import React, { useState, useEffect } from 'react';
import { Meeting } from './types';
import Recorder from './components/Recorder';
import MeetingHistory from './components/MeetingHistory';
import MeetingDetails from './components/MeetingDetails';
import { getMeetings, saveMeeting as dbSaveMeeting, deleteMeeting as dbDeleteMeeting } from './utils/db';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
      } catch (e) {
        console.error("Failed to load meetings from IndexedDB", e);
      }
    };
    load();
  }, []);

  const handleSaveMeeting = async (newMeeting: Meeting) => {
    try {
      await dbSaveMeeting(newMeeting);
      setMeetings(prev => [newMeeting, ...prev]);
      setSelectedMeetingId(newMeeting.id);
    } catch (e) {
      console.error("Failed to save meeting", e);
      alert("Error saving meeting. Storage might be full.");
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    try {
      await dbDeleteMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
      if (selectedMeetingId === id) setSelectedMeetingId(null);
    } catch (e) {
      console.error("Failed to delete meeting", e);
    }
  };

  const handleRenameMeeting = async (id: string, newTitle: string) => {
    try {
      const meetingToUpdate = meetings.find(m => m.id === id);
      if (meetingToUpdate) {
        const updated = { ...meetingToUpdate, title: newTitle };
        await dbSaveMeeting(updated);
        setMeetings(prev => prev.map(m => m.id === id ? updated : m));
      }
    } catch (e) {
      console.error("Failed to rename meeting", e);
    }
  };

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <aside className="w-full md:w-72 bg-white border-r border-zinc-200 flex flex-col shrink-0 h-screen sticky top-0">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">StokeMeet</h1>
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Rec</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4">
          <MeetingHistory
            meetings={meetings}
            selectedId={selectedMeetingId}
            onSelect={setSelectedMeetingId}
            onDelete={handleDeleteMeeting}
            onRename={handleRenameMeeting}
          />
        </div>

        <div className="p-4 border-t border-zinc-100 space-y-2 shrink-0 bg-white z-10">
          <button
            onClick={() => setSelectedMeetingId(null)}
            className="w-full py-2.5 px-4 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            New Meeting
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-2.5 px-4 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-medium hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Settings
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-neutral-50 overflow-y-auto h-screen">
        {!selectedMeetingId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Recorder
              onSave={handleSaveMeeting}
              isGlobalRecording={isRecording}
              setIsGlobalRecording={setIsRecording}
            />
          </div>
        ) : (
          <MeetingDetails
            meeting={selectedMeeting!}
            onUpdate={async (updated) => {
              await dbSaveMeeting(updated);
              setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
            }}
          />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default App;
