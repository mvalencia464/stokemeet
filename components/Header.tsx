
import React from 'react';
import { Button } from './Button';

interface HeaderProps {
  title: string;
  date: string;
}

export const Header: React.FC<HeaderProps> = ({ title, date }) => {
  return (
    <header className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border-b border-[#30363d] bg-[#0d1117] sticky top-0 z-50">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-[#e6edf3]">{title}</h1>
        <p className="text-sm text-[#8b949e]">{date}</p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 md:mt-0">
        <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#21262d]">
          <span className="text-[#ccff00]">🔗</span>
          <span className="text-sm font-medium">Share</span>
        </div>
        <Button variant="ghost" className="p-2 h-auto w-auto">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
        </Button>
      </div>
    </header>
  );
};
