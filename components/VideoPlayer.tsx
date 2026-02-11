import React from 'react';

interface VideoPlayerProps {
  url?: string;
  title?: string;
  thumbnailUrl?: string | null;
  embedHtml?: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, thumbnailUrl, embedHtml }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (!url) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#30363d] flex items-center justify-center">
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  // Check if it's a direct video file (unlikely for Fathom) or a page
  const isDirectVideo = url.match(/\.(mp4|webm|ogg)$/i);

  if (isDirectVideo) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#30363d]">
        <video
          src={url}
          controls
          className="w-full h-full"
          poster={thumbnailUrl || "https://picsum.photos/seed/meeting/1280/720"}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // If we have a thumbnail and haven't clicked play yet, show the overlay
  if (thumbnailUrl && !isPlaying) {
    return (
      <div
        className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#30363d] cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        <img
          src={thumbnailUrl}
          alt={title || "Video thumbnail"}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-[#ccff00] rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4z"></path>
            </svg>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 rounded text-xs font-mono text-white backdrop-blur-sm">
          Click to Play
        </div>
      </div>
    );
  }

  // If we have embed HTML and we are playing, render that
  if (embedHtml) {
    return (
      <div
        className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#30363d] [&_iframe]:w-full [&_iframe]:h-full"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
    );
  }

  // Assuming it's an embeddable page (e.g. Fathom share link)
  // We'll try to embed it in an iframe.
  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl border border-[#30363d]">
      <iframe
        src={url}
        title={title || "Meeting Recording"}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};