
import React from 'react';
import { MeetingType } from '../types';
import { MEETING_TYPES_CONFIG } from '../constants';

interface SummarySelectorProps {
  selectedType: MeetingType;
  onTypeChange: (type: MeetingType) => void;
  onCopy?: () => void;
}

export const SummarySelector: React.FC<SummarySelectorProps> = ({ selectedType, onTypeChange, onCopy }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-[#161b22]/50 border-b border-[#30363d]">
      <div className="relative inline-block">
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as MeetingType)}
          className="bg-[#161b22] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-4 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ccff00] min-w-[200px]"
        >
          {Object.keys(MEETING_TYPES_CONFIG).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>



      <button
        onClick={handleCopy}
        className={`ml-auto text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${copied
            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
            : 'bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20'
          }`}
      >
        {copied ? (
          <>
            Copied!
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </>
        ) : (
          <>
            Copy Summary
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
          </>
        )}
      </button>
    </div>
  );
};
