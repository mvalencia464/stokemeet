
import React from 'react';
import { ActionItem } from '../types';

interface ActionItemsProps {
  items: ActionItem[];
  onToggle: (id: string) => void;
}

export const ActionItems: React.FC<ActionItemsProps> = ({ items, onToggle }) => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">ACTION ITEMS</h3>
        <div className="flex gap-2">
          <button className="text-[10px] bg-[#161b22] px-2 py-1 border border-[#30363d] rounded text-[#8b949e] hover:text-[#e6edf3]">Copy for...</button>
          <button className="text-[10px] bg-[#0070f3]/10 px-2 py-1 border border-[#0070f3]/30 rounded text-[#0070f3] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Follow-up Email
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-[#8b949e] italic">No action items detected yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 group items-start cursor-pointer" onClick={() => onToggle(item.id)}>
              <div className={`mt-1 min-w-[1.25rem] h-5 w-5 rounded-md border flex items-center justify-center transition-all ${item.completed
                  ? 'bg-[#0070f3] border-[#0070f3]'
                  : 'bg-[#161b22] border-[#30363d] group-hover:border-[#0070f3]/50'
                }`}>
                {item.completed && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div className="flex flex-col">
                <p className={`text-sm leading-relaxed transition-colors ${item.completed ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>
                  {item.text}
                  {item.timestamp && <span className="ml-2 text-xs text-[#0070f3] opacity-60">✨ @ {item.timestamp}</span>}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                    👤 {item.assignee}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
