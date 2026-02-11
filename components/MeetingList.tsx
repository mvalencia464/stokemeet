
import React from 'react';
import { FathomMeeting } from '../services/fathomService';

interface MeetingListProps {
  meetings: FathomMeeting[];
  onSelect: (meeting: FathomMeeting) => void;
  isLoading: boolean;
}

export const MeetingList: React.FC<MeetingListProps> = ({ meetings, onSelect, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-[#8b949e]">Loading meetings...</div>;
  }

  if (meetings.length === 0) {
    return <div className="p-4 text-center text-[#8b949e]">No meetings found.</div>;
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl max-h-[400px] overflow-y-auto">
      <div className="p-3 border-b border-[#30363d] bg-[#0d1117] flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#e6edf3]">Fathom Meetings</h3>
      </div>
      <div className="divide-y divide-[#30363d]">
        {meetings.map((meeting) => (
          <div 
            key={meeting.url} 
            className="p-4 hover:bg-[#21262d] cursor-pointer transition-colors"
            onClick={() => onSelect(meeting)}
          >
            <h4 className="text-sm font-semibold text-[#ccff00]">{meeting.title || "Untitled Meeting"}</h4>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-[#8b949e]">{new Date(meeting.recording_start_time).toLocaleDateString()}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#30363d] text-[#c9d1d9] capitalize">
                {meeting.meeting_type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
