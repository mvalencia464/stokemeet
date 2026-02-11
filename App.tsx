
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MeetingDetail } from './components/MeetingDetail';
import { MeetingData, MeetingType, ActionItem } from './types';
import { FathomMeeting, getMeetingTranscript, getMeetingSummary } from './services/fathomService';

const App: React.FC = () => {
  const [currentMeeting, setCurrentMeeting] = useState<MeetingData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleMeetingSelect = async (fathomMeeting: FathomMeeting) => {
    setIsSyncing(true);
    try {
      // Fetch details in parallel
      const [transcriptData, summaryData] = await Promise.all([
        getMeetingTranscript(fathomMeeting.recording_id),
        getMeetingSummary(fathomMeeting.recording_id)
      ]);

      const transcript = transcriptData
        .map(t => `${t.speaker.display_name}: ${t.text}`)
        .join('\n');

      const attendees = fathomMeeting.calendar_invitees.map(a => ({
        name: a.name,
        email: a.email,
        linkedIn: 'unknown'
      }));

      const actionItems: ActionItem[] = (fathomMeeting.action_items || []).map((ai, i) => ({
        id: `fathom-${i}`,
        text: ai.description,
        assignee: ai.assignee?.name || 'Unassigned',
        timestamp: ai.recording_timestamp,
        completed: ai.completed
      }));

      const startDate = new Date(fathomMeeting.recording_start_time);
      const endDate = new Date(fathomMeeting.recording_end_time);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationMins = Math.round(durationMs / 60000);

      setCurrentMeeting({
        title: fathomMeeting.title,
        date: startDate.toLocaleDateString(),
        duration: `${durationMins} mins`,
        attendees,
        transcript,
        summaryContent: summaryData?.markdown_formatted || "No summary available.",
        actionItems,
        currentType: MeetingType.GENERAL, // Default type
        videoUrl: fathomMeeting.url
      });
    } catch (e) {
      console.error("Error fetching meeting details:", e);
      // Fallback if detail fetch fails
      handleMeetingSelectFallback(fathomMeeting);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMeetingSelectFallback = (fathomMeeting: FathomMeeting) => {
    const startDate = new Date(fathomMeeting.recording_start_time);
    const endDate = new Date(fathomMeeting.recording_end_time);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMins = Math.round(durationMs / 60000);

    setCurrentMeeting({
      title: fathomMeeting.title,
      date: startDate.toLocaleDateString(),
      duration: `${durationMins} mins`,
      attendees: fathomMeeting.calendar_invitees.map(a => ({ name: a.name, email: a.email })),
      transcript: "",
      summaryContent: "Details could not be loaded.",
      actionItems: [],
      currentType: MeetingType.GENERAL,
      videoUrl: fathomMeeting.url
    });
  };

  const handleBack = () => {
    setCurrentMeeting(null);
  };

  if (isSyncing) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0070f3] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#8b949e] font-medium">Syncing meeting insights...</p>
      </div>
    );
  }

  if (currentMeeting) {
    return <MeetingDetail initialData={currentMeeting} onBack={handleBack} />;
  }

  return <Dashboard onMeetingSelect={handleMeetingSelect} />;
};

export default App;
