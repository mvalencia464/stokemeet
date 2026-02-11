
import React from 'react';
import { MeetingType, CustomSummaryProfile } from '../types';
import { MEETING_TYPES_CONFIG } from '../constants';

interface SummarySelectorProps {
  selectedType: MeetingType | string;
  onTypeChange: (type: MeetingType | string) => void;
  onCopy?: () => void;
  onAddProfile?: () => void;
  onEditProfile?: (profile: CustomSummaryProfile) => void;
  onDeleteProfile?: (id: string) => void;
  customProfiles?: CustomSummaryProfile[];
  defaultProfileId?: string;
  onSetDefault?: (id: string) => void;
}

export const SummarySelector: React.FC<SummarySelectorProps> = ({ 
  selectedType, 
  onTypeChange, 
  onCopy,
  onAddProfile,
  onEditProfile,
  onDeleteProfile,
  customProfiles = [],
  defaultProfileId,
  onSetDefault
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
    const grouped: Record<string, Array<{ type: string; name: string; config: typeof selectedConfig }>> = {
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
        grouped[category].push({ type, name: type, config });
      }
    });

    if (customProfiles && customProfiles.length > 0) {
      grouped['Custom Profiles'] = customProfiles.map(p => ({
        type: p.id,
        name: p.name,
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
                  {types.map(({ type, name, config }) => {
                    const isCustom = category === 'Custom Profiles';
                    const customProfile = isCustom ? customProfiles?.find(p => p.id === type) : null;
                    
                    return (
                      <div
                        key={type}
                        className={`group flex items-center justify-between px-3 py-3 border-b border-[#30363d] transition-colors hover:bg-[#1c2128] ${
                          selectedType === type ? 'bg-[#ccff00]/10 border-l-2 border-l-[#ccff00]' : ''
                        }`}
                      >
                        <button
                          onClick={() => {
                            onTypeChange(type as MeetingType | string);
                            setIsDropdownOpen(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-[#e6edf3]">{name}</div>
                          <div className="text-xs text-[#8b949e] mt-1">{config.description}</div>
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {onSetDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(type);
                              }}
                              title={defaultProfileId === type ? "Default profile" : "Set as default"}
                              className={`p-1.5 rounded-full transition-all ${
                                defaultProfileId === type 
                                  ? 'text-[#ccff00] opacity-100' 
                                  : 'text-[#8b949e] opacity-0 group-hover:opacity-100 hover:text-[#e6edf3] hover:bg-[#30363d]'
                              }`}
                            >
                              <svg className="w-4 h-4" fill={defaultProfileId === type ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                          )}
                          
                          {isCustom && customProfile && onEditProfile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProfile(customProfile);
                              }}
                              title="Edit profile"
                              className="p-1.5 rounded-full transition-all text-[#8b949e] opacity-0 group-hover:opacity-100 hover:text-[#e6edf3] hover:bg-[#30363d]"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          
                          {isCustom && onDeleteProfile && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${name}"?`)) {
                                  onDeleteProfile(type);
                                }
                              }}
                              title="Delete profile"
                              className="p-1.5 rounded-full transition-all text-[#8b949e] opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-[#30363d]"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
