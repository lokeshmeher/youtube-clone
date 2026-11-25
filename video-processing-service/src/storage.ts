import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "lokesh-nc-yt-raw-videos";
const processedVideoBucketName = "lokesh-nc-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Ensure directory exists, creating it if necessary.
 * @param {string} path - The path to the directory.
 */
function ensureDirectoryExists(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  console.log(`Directory created at: ${path}`);
}

/**
 * Sets up the necessary directories for storing raw and processed videos.
 */
export function setupDirectories() {
  ensureDirectoryExists(localRawVideoPath);
  ensureDirectoryExists(localProcessedVideoPath);
}

/**
 *
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video conversion is complete.
 */
export function convertVideo(
  rawVideoName: string,
  processedVideoName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-2:360") // Scale video to 360p while maintaining aspect ratio
      .on("end", () => {
        console.log(`Video conversion completed: ${processedVideoName}`);
        resolve();
      })
      .on("error", (err: any) => {
        console.error(`Error during video conversion: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * Downloads a raw video file from the cloud storage bucket to the local directory.
 * @param fileName - The name of the file to download from the {@link rawVideoBucketName} bucket
 * into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string): Promise<void> {
  await storage
    .bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: `${localRawVideoPath}/${fileName}` });

  console.log(
    `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`,
  );
}

/**
 * Uploads a processed video file from the local directory to the cloud storage bucket and makes it public.
 * @param fileName - The name of the file to upload from the {@link localProcessedVideoPath} folder to the
 * {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the file has been uploaded and made public.
 */
export async function uploadProcessedVideo(fileName: string): Promise<void> {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName,
  });
  console.log(
    `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`,
  );

  await bucket.file(fileName).makePublic();
}

/**
 * Deletes a raw video file from the local directory.
 * @param fileName - The name of file to delete from {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export async function deleteRawVideo(fileName: string): Promise<void> {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * Deletes a processed video file from the local directory.
 * @param fileName - The name of file to delete from {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export async function deleteProcessedVideo(fileName: string): Promise<void> {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * Deletes a file from the local directory.
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}: ${err.message}`);
          reject(err);
        } else {
          console.log(`File deleted: ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File not found: ${filePath}. Skipping deletion.`);
      resolve(); // Resolve even if the file doesn't exist
    }
  });
}
