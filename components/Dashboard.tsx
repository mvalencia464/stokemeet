
import React, { useEffect, useState } from 'react';
import { listMeetings, FathomMeeting } from '../services/fathomService';
import { FathomThumbnail } from './FathomThumbnail';



interface DashboardProps {
  onMeetingSelect: (meeting: FathomMeeting) => void;
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onMeetingSelect, onLogout }) => {
  const [meetings, setMeetings] = useState<FathomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await listMeetings();
        setMeetings(data.items);
      } catch (err) {
        console.error("Error fetching meetings:", err);
        setError("Failed to load meetings. Please check your API key.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#8b949e] animate-pulse">Loading your meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#e6edf3] mb-2">Something went wrong</h2>
          <p className="text-[#8b949e] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-6 rounded-lg text-sm font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#e6edf3] mb-2">Recent Calls</h1>
          <p className="text-[#8b949e]">Access all your recorded meetings and insights.</p>
        </div>
        <div className="flex gap-4">
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] border border-[#30363d] rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {meetings.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[#161b22] border border-[#30363d] rounded-2xl">
            <p className="text-[#8b949e]">No meetings found. Start recording with Fathom to see them here.</p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.url}
              className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#ccff00] hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all duration-300 cursor-pointer group flex flex-col h-full hover:-translate-y-1"
              onClick={() => onMeetingSelect(meeting)}
            >
              <div className="aspect-video bg-[#0d1117] relative flex items-center justify-center overflow-hidden border-b border-[#30363d] group-hover:border-[#ccff00]/30 transition-colors">
                <FathomThumbnail meeting={meeting} />
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#e6edf3] line-clamp-2 leading-tight group-hover:text-[#ccff00] transition-colors">
                    {meeting.title || "Untitled Meeting"}
                  </h3>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#8b949e]">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span>{new Date(meeting.recording_start_time).toLocaleDateString()}</span>
                  </div>
                  {meeting.meeting_type && (
                    <span className="px-2 py-0.5 bg-[#30363d]/50 rounded-full capitalize text-[10px]">
                      {meeting.meeting_type}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
