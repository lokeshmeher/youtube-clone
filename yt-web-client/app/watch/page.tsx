"use client";
import { useSearchParams } from "next/navigation";

export default function Watch() {
  const videoPrefix =
    "https://storage.googleapis.com/lokesh-nc-yt-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  return (
    <div>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
}
