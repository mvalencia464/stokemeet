
import React from 'react';

type Tab = 'summary' | 'transcript' | 'ask';

interface MainTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 border-b border-[#30363d] px-4 mt-6">
      <button
        onClick={() => onTabChange('summary')}
        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'summary' ? 'text-[#ccff00]' : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
      >
        SUMMARY
        {activeTab === 'summary' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />}
      </button>
      <button
        onClick={() => onTabChange('transcript')}
        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'transcript' ? 'text-[#ccff00]' : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
      >
        TRANSCRIPT
        {activeTab === 'transcript' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />}
      </button>
      <button
        onClick={() => onTabChange('ask')}
        className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'ask' ? 'text-[#ccff00]' : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
      >
        ASK STOKEMEET
        {activeTab === 'ask' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />}
      </button>
    </div>
  );
};
