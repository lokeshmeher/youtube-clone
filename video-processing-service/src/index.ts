import express from "express";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./storage";
import { getVideo, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

// Process a video from cloud storage into 360p.
app.post("/process-video", async (req, res) => {
  // Get the bucket and filename from the Cloud Pub/Sub message.
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString();
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload received.");
    }
    console.info("Received Pub/Sub message:", data);
  } catch (error) {
    console.error("Error parsing message:", error);
    return res.status(400).send("Bad request: missing filename.");
  }

  const inputFileName = data.name; // In format of <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];
  const video = await getVideo(videoId);

  if (video?.status === "processing") {
    // Pub/sub will try to redeliver the message until the video is processed.
    return res.status(400).send("Bad request: video already processing");
  } else if (video?.status === "processed") {
    return res.status(200).send("Video already processed");
  } else {
    await setVideo(videoId, {
      id: videoId,
      uid: videoId.split("-")[0],
      status: "processing",
    });
  }

  // Download the raw video from the cloud storage bucket.
  await downloadRawVideo(inputFileName);

  try {
    await convertVideo(inputFileName, outputFileName);
    await uploadProcessedVideo(outputFileName);
  } catch (error) {
    console.error(
      "Error converting video or uploading processed video:",
      error,
    );
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    await setVideo(videoId, {
      status: undefined,
    });
    return res.status(500).send("Processing failed.");
  }

  await setVideo(videoId, {
    status: "processed",
    filename: outputFileName,
  });

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  res.status(200).send("Processing complete.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
