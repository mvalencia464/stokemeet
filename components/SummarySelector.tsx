
import React from 'react';
import { MeetingType, CustomSummaryProfile } from '../types';
import { MEETING_TYPES_CONFIG } from '../constants';

interface SummarySelectorProps {
  selectedType: MeetingType | string;
  onTypeChange: (type: MeetingType | string) => void;
  onCopy?: () => void;
  onAddProfile?: () => void;
  customProfiles?: CustomSummaryProfile[];
}

export const SummarySelector: React.FC<SummarySelectorProps> = ({ 
  selectedType, 
  onTypeChange, 
  onCopy,
  onAddProfile,
  customProfiles = []
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedConfig = MEETING_TYPES_CONFIG[selectedType as MeetingType];
  const selectedCustom = customProfiles?.find(p => p.id === selectedType);

  const groupedTypes = React.useMemo(() => {
    const grouped: Record<string, Array<{ type: string; config: typeof selectedConfig }>> = {
      'Free': [],
      'Most Used': [],
      'Sales': [],
      'Customer Success': [],
      'Internal & Operations': [],
      'Custom Profiles': [],
    };

    Object.entries(MEETING_TYPES_CONFIG).forEach(([type, config]) => {
      const category = config.category || 'Other';
      if (grouped[category]) {
        grouped[category].push({ type, config });
      }
    });

    if (customProfiles && customProfiles.length > 0) {
      grouped['Custom Profiles'] = customProfiles.map(p => ({
        type: p.id,
        config: {
          description: p.description,
          category: 'Custom Profiles' as const,
          systemPrompt: p.systemPrompt
        }
      }));
    }

    return grouped;
  }, [customProfiles]);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-[#161b22]/50 border-b border-[#30363d]">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-[#161b22] border border-[#30363d] text-[#e6edf3] text-sm rounded-lg px-4 py-2 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#ccff00] min-w-[250px] flex items-center justify-between gap-2 hover:bg-[#1c2128]"
        >
          <div className="text-left flex-1">
            <div className="font-semibold">{selectedCustom?.name || selectedType}</div>
            <div className="text-xs text-[#8b949e] truncate">
              {selectedCustom?.description || selectedConfig?.description}
            </div>
          </div>
          <svg 
            className={`w-4 h-4 text-[#8b949e] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1117] border border-[#30363d] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {Object.entries(groupedTypes).map(([category, types]) => 
              types.length > 0 && (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-[#8b949e] uppercase bg-[#161b22] sticky top-0">
                    {category}
                  </div>
                  {types.map(({ type, config }) => (
                    <button
                      key={type}
                      onClick={() => {
                        onTypeChange(type as MeetingType | string);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-3 hover:bg-[#1c2128] border-b border-[#30363d] transition-colors ${
                        selectedType === type ? 'bg-[#ccff00]/10 border-l-2 border-l-[#ccff00]' : ''
                      }`}
                    >
                      <div className="font-medium text-[#e6edf3]">{type}</div>
                      <div className="text-xs text-[#8b949e] mt-1">{config.description}</div>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {onAddProfile && (
        <button
          onClick={onAddProfile}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#ccff00]/10 text-[#ccff00] hover:bg-[#ccff00]/20 border border-[#ccff00]/20 transition-colors flex items-center gap-1.5"
        >
          <span className="text-sm">+</span> New Profile
        </button>
      )}

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
