import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
  // console.time("video-processing");
  const inputPath = req.body.inputPath;
  const outputPath = req.body.outputPath;

  if (!inputPath || !outputPath) {
    return res.status(400).send("Input and output paths are required.");
  }

  ffmpeg(inputPath)
    .outputOptions("-vf", "scale=-1:360")
    .on("end", () => {
      // console.timeEnd("video-processing");
      res.send("Video processing completed successfully.");
    })
    .on("error", (err) => {
      console.error("Error processing video:", err);
      res.status(500).send(`Error processing video: ${err.message}`);
    })
    .save(outputPath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
