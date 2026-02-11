
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../components/Dashboard';
import { FathomMeeting } from '../services/fathomService';
import { useAuth } from '../contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleMeetingSelect = (meeting: FathomMeeting) => {
    // Navigate to the meeting page, passing the meeting object in state
    // so we don't have to re-fetch it immediately if we have it.
    navigate(`/meeting/${meeting.recording_id}`, { state: { meeting } });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return <Dashboard onMeetingSelect={handleMeetingSelect} onLogout={handleLogout} />;
};
