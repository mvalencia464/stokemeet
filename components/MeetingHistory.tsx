import React, { useState, useRef, useEffect } from 'react';
import { Meeting } from '../types';

interface MeetingHistoryProps {
  meetings: Meeting[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

const MeetingHistory: React.FC<MeetingHistoryProps> = ({ meetings, selectedId, onSelect, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation();
    setEditingId(meeting.id);
    setEditTitle(meeting.title);
  };

  const saveEditing = () => {
    if (!editingId) return;
    if (editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Meetings</h3>
      {meetings.length === 0 ? (
        <div className="text-center py-8 px-4">
          <p className="text-sm text-zinc-400 italic">No meetings saved yet.</p>
        </div>
      ) : (
        meetings.map(meeting => (
          <div
            key={meeting.id}
            onClick={() => onSelect(meeting.id)}
            className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${selectedId === meeting.id
              ? 'bg-zinc-900 border-zinc-900 shadow-md text-white'
              : 'bg-white border-transparent hover:bg-zinc-100'
              }`}
          >
            <div className="flex flex-col gap-1 pr-10">
              <div className="flex items-center gap-2">
                {editingId === meeting.id ? (
                  <input
                    ref={inputRef}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={handleKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-white text-zinc-900 px-2 py-0.5 rounded text-sm font-semibold outline-none ring-2 ring-zinc-900 w-full"
                  />
                ) : (
                  <h4
                    onDoubleClick={(e) => startEditing(e, meeting)}
                    className={`font-semibold truncate flex-1 text-sm select-none ${selectedId === meeting.id ? 'text-white' : 'text-zinc-800'}`}
                    title="Double-click to rename"
                  >
                    {meeting.title}
                  </h4>
                )}

                {editingId !== meeting.id && meeting.videoData ? (
                  <svg className={`w-3.5 h-3.5 shrink-0 ${selectedId === meeting.id ? 'text-zinc-400' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : editingId !== meeting.id && meeting.audioData && (
                  <svg className={`w-3.5 h-3.5 shrink-0 ${selectedId === meeting.id ? 'text-zinc-400' : 'text-zinc-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4a1 1 0 001.707.707l3-3a1 1 0 000-1.414l-3-3A1 1 0 007 8z" />
                  </svg>
                )}
              </div>
              <div className={`flex items-center gap-3 text-xs ${selectedId === meeting.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                <span>{new Date(meeting.timestamp).toLocaleDateString()}</span>
                <span>•</span>
                <span>{Math.floor(meeting.duration / 60)}m {meeting.duration % 60}s</span>
              </div>
            </div>

            {editingId !== meeting.id && (
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this meeting?')) onDelete(meeting.id);
                  }}
                  className={`p-1 rounded-md hover:bg-black/10 ${selectedId === meeting.id ? 'text-zinc-300 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'}`}
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MeetingHistory;
