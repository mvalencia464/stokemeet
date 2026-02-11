
import React from 'react';
import { Attendee } from '../types';

interface AttendeesProps {
  attendees: Attendee[];
}

export const Attendees: React.FC<AttendeesProps> = ({ attendees }) => {
  return (
    <div className="p-4 border-b border-[#30363d]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">ATTENDEES</h3>
        <span className="text-[#ccff00] text-xs font-semibold cursor-pointer">Recording Sent</span>
      </div>
      <div className="space-y-4">
        {attendees.map((attendee, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                {attendee.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#e6edf3]">{attendee.name}</span>
                {attendee.email && <span className="text-xs text-[#8b949e]">{attendee.email}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
