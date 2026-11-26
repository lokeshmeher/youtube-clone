"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export function WatchContent() {
  const videoPrefix =
    "https://storage.googleapis.com/lokesh-nc-yt-processed-videos/";
  const videoSrc = useSearchParams().get("v");

  return (
    <div>
      <video controls src={videoPrefix + videoSrc} />
    </div>
  );
}

export default function Watch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WatchContent />
    </Suspense>
  );
}
