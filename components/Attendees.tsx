
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
            {attendee.linkedIn && (
              <a href="#" className="text-[#8b949e] hover:text-[#ccff00] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
