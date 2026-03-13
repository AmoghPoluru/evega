"use client";

import { secondsToTime } from "@/lib/youtube-utils";

interface YouTubeEmbedProps {
  videoId: string;
  startTimeSeconds?: number; // in seconds (converted from MM:SS)
  title?: string;
}

export function YouTubeEmbed({ videoId, startTimeSeconds, title }: YouTubeEmbedProps) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}${startTimeSeconds ? `?start=${startTimeSeconds}` : ''}`;

  return (
    <div className="space-y-2">
      {startTimeSeconds && (
        <p className="text-sm text-gray-600">
          Video starts at {secondsToTime(startTimeSeconds)}
        </p>
      )}
      <div className="relative w-full aspect-video">
        <iframe
          src={embedUrl}
          title={title || "Product Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}
