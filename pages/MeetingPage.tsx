
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MeetingDetail } from '../components/MeetingDetail';
import { MeetingData, MeetingType, ActionItem } from '../types';
import { FathomMeeting, getMeetingTranscript, listMeetings } from '../services/fathomService';

export const MeetingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to transform FathomMeeting + Transcript to MeetingData
  const transformToMeetingData = async (fathomMeeting: FathomMeeting): Promise<MeetingData> => {
    try {
      const transcriptData = await getMeetingTranscript(fathomMeeting.recording_id);
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

      return {
        id: fathomMeeting.recording_id.toString(),
        title: fathomMeeting.title,
        date: startDate.toLocaleDateString(),
        duration: `${durationMins} mins`,
        attendees,
        transcript,
        summaryContent: "", // Will be populated by MeetingDetail logic
        actionItems,
        currentType: MeetingType.GENERAL,
        videoUrl: fathomMeeting.share_url
      };
    } catch (e) {
      console.error("Error transforming meeting data:", e);
      throw e;
    }
  };

  useEffect(() => {
    const loadMeeting = async () => {
      if (!id) return;

      // 1. Check if we have the meeting object in navigation state
      const stateMeeting = location.state?.meeting as FathomMeeting | undefined;

      if (stateMeeting && stateMeeting.recording_id.toString() === id) {
        try {
          const data = await transformToMeetingData(stateMeeting);
          setMeetingData(data);
        } catch (e) {
          setError("Failed to load meeting details.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2. If not in state, we need to find it from the list
      try {
        // Note: This is inefficient for large lists. Ideally we'd have a getMeeting(id) API.
        // We'll fetch the first page. If not found, we might need to fetch more or fail.
        // For now, we assume recent meetings.
        const listResponse = await listMeetings(); 
        const found = listResponse.items.find(m => m.recording_id.toString() === id);

        if (found) {
          const data = await transformToMeetingData(found);
          setMeetingData(data);
        } else {
          setError("Meeting not found in recent list.");
        }
      } catch (e) {
        console.error("Error fetching meeting list:", e);
        setError("Failed to find meeting.");
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [id, location.state]);

  if (loading) {
     return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#8b949e] font-medium">Syncing meeting insights...</p>
      </div>
    );
  }

  if (error || !meetingData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="text-center">
            <h2 className="text-xl font-bold text-[#e6edf3] mb-2">Error</h2>
            <p className="text-[#8b949e] mb-4">{error || "Meeting not found"}</p>
            <button onClick={() => navigate('/')} className="text-[#ccff00] hover:underline">
                Return to Dashboard
            </button>
        </div>
      </div>
    );
  }

  return <MeetingDetail initialData={meetingData} onBack={() => navigate('/')} />;
};
