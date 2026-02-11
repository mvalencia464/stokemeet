
import React, { useState, useEffect } from 'react';
import { getFathomData, FathomMeeting } from '../services/fathomService';

// Simple hash function to generate consistent colors from strings
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

interface FathomThumbnailProps {
    meeting: FathomMeeting;
}

export const FathomThumbnail: React.FC<FathomThumbnailProps> = ({ meeting }) => {
    const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function load() {
            if (!meeting.share_url) {
                if (active) setLoading(false);
                return;
            }

            // Check sessionStorage cache first to avoid repetitive API calls on re-renders
            const cacheKey = `fathom_thumb_${meeting.share_url}`;
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                if (active) {
                    setThumbnailSrc(cached);
                    setLoading(false);
                }
                return;
            }

            try {
                const data = await getFathomData(meeting.share_url);
                if (active && data.thumbnail_url) {
                    setThumbnailSrc(data.thumbnail_url);
                    sessionStorage.setItem(cacheKey, data.thumbnail_url);
                }
            } catch (e) {
                console.warn("Error loading thumbnail", e);
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => { active = false; };
    }, [meeting.share_url]);

    const duration = new Date(meeting.recording_end_time).getTime() - new Date(meeting.recording_start_time).getTime();
    const durationText = duration > 0 ? Math.round(duration / 60000) + ' min' : 'Recorded';

    // RENDER: Real Image
    if (thumbnailSrc) {
        return (
            <div className="relative w-full h-full group bg-[#0d1117] overflow-hidden">
                <img
                    src={thumbnailSrc}
                    alt={`Thumbnail for ${meeting.title || 'Meeting'}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => setThumbnailSrc(null)} // Fallback if URL expires/fails
                />
                {/* Overlay for hover state consistency with fallback */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-[#ccff00] rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z"></path></svg>
                    </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] font-mono text-white">
                    {durationText}
                </div>
            </div>
        );
    }

    // RENDER: Fallback (Generative Color + Title)
    return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-[#0d1117] group">
            {/* Dynamic gradient */}
            <div
                className="absolute inset-0 opacity-80 group-hover:scale-105 transition-transform duration-500"
                style={{
                    background: `linear-gradient(135deg, ${stringToColor(meeting.title || 'default')}40 0%, #0d1117 100%)`
                }}
            ></div>

            {/* Play Icon - Always visible in fallback mode per original design, but enhanced interaction */}
            <div className="z-10 w-12 h-12 bg-[#30363d]/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-[#ccff00] transition-colors shadow-sm">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z"></path></svg>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] font-mono text-white">
                {durationText}
            </div>
        </div>
    );
};
