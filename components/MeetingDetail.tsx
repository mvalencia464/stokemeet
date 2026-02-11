import React, { useState } from 'react';
import { Header } from './Header';
import { VideoPlayer } from './VideoPlayer';
import { MainTabs } from './MainTabs';
import { SummarySelector } from './SummarySelector';
import { Attendees } from './Attendees';
import { ActionItems } from './ActionItems';
import { MeetingType, MeetingData, ActionItem, CustomSummaryProfile } from '../types';
import { generateMeetingSummary, askMeetingQuestion, generateFollowUpEmail } from '../services/geminiService';
import { getFathomData } from '../services/fathomService';
import { customProfileService } from '../services/customProfileService';
import { useAuth } from '../contexts/AuthContext';
import { CustomProfileModal } from './CustomProfileModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingDetailProps {
  initialData: MeetingData;
  onBack: () => void;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({ initialData, onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'ask'>('summary');
  const [loading, setLoading] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData>(initialData);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  // Custom Profiles State
  const [customProfiles, setCustomProfiles] = useState<CustomSummaryProfile[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [defaultProfileId, setDefaultProfileId] = useState<string>('');

  // Ask StokeMeet AI State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [shareButtonCopied, setShareButtonCopied] = useState(false);

  // Load profiles on mount
  React.useEffect(() => {
    const profiles = customProfileService.getProfiles();
    setCustomProfiles(profiles);
    setDefaultProfileId(customProfileService.getDefaultProfileId());
  }, []);

  React.useEffect(() => {
    async function loadData() {
      if (meetingData.videoUrl) {
        try {
          const data = await getFathomData(meetingData.videoUrl);
          if (data.thumbnail_url) setThumbnailUrl(data.thumbnail_url);
          if (data.html) setEmbedHtml(data.html);
        } catch (e) {
          console.warn("Failed to load player data", e);
        }
      }
    }
    loadData();
  }, [meetingData.videoUrl]);

  // Auto-generate AI summary on initial load if not present
  React.useEffect(() => {
    async function generateInitialSummary() {
      if (!meetingData.summaryContent && meetingData.transcript) {
        setLoading(true);
        try {
          const { loadSummary, saveSummary, loadRemoteSummary, saveRemoteSummary } = await import('../services/storageService');
          
          let cached = null;
          if (user?.id) {
            cached = await loadRemoteSummary(user.id, meetingData.id, meetingData.currentType);
          } else {
            cached = loadSummary(meetingData.id, meetingData.currentType);
          }

          if (cached) {
            // Use cached summary
            const newActions: ActionItem[] = cached.actionItems.map((item, i) => {
              if (typeof item === 'string') {
                return {
                  id: `gen-${Date.now()}-${i}`,
                  text: item,
                  assignee: "Auto-assigned",
                  completed: false
                };
              }
              return {
                id: `gen-${Date.now()}-${i}`,
                text: item.text,
                assignee: item.assignee,
                completed: false
              };
            });

            setMeetingData(prev => ({
              ...prev,
              summaryContent: cached.content,
              actionItems: [...prev.actionItems, ...newActions].slice(-10)
            }));
          } else {
            // Generate new AI summary
            const attendeeNames = meetingData.attendees.map(a => a.name);
            
            // Ensure we have the latest profiles
            const profiles = customProfileService.getProfiles();
            const customProfile = profiles.find(p => p.id === meetingData.currentType);

            const result = await generateMeetingSummary(
              meetingData.transcript,
              meetingData.currentType,
              meetingData.date,
              attendeeNames,
              customProfile?.systemPrompt,
              customProfile?.name
            );

            // Save to cache (remote or local)
            const summaryData = {
              content: result.content,
              actionItems: result.actionItems,
              timestamp: Date.now()
            };

            if (user?.id) {
              await saveRemoteSummary(user.id, meetingData.id, meetingData.currentType, summaryData);
            } else {
              saveSummary(meetingData.id, meetingData.currentType, summaryData);
            }

            const newActions: ActionItem[] = result.actionItems.map((item, i) => ({
              id: `gen-${Date.now()}-${i}`,
              text: item.text,
              assignee: item.assignee,
              completed: false
            }));

            setMeetingData(prev => ({
              ...prev,
              summaryContent: result.content,
              actionItems: [...prev.actionItems, ...newActions].slice(-10)
            }));
          }
        } catch (e) {
          console.error("Failed to generate initial summary:", e);
          setMeetingData(prev => ({
            ...prev,
            summaryContent: "Failed to generate summary. Please try changing the summary type."
          }));
        } finally {
          setLoading(false);
        }
      }
    }
    generateInitialSummary();
  }, [meetingData.id, user?.id]); // Run when meeting ID or user ID changes

  const handleTypeChange = async (newType: MeetingType | string) => {
    setLoading(true);
    setMeetingData(prev => ({ ...prev, currentType: newType }));

    try {
      // Check if it's a custom profile
      const customProfile = customProfiles.find(p => p.id === newType);

      // Check cache first (remote or local)
      const { loadSummary, saveSummary, loadRemoteSummary, saveRemoteSummary } = await import('../services/storageService');
      
      let cached = null;
      if (user?.id) {
        cached = await loadRemoteSummary(user.id, meetingData.id, newType);
      } else {
        cached = loadSummary(meetingData.id, newType);
      }

      if (cached) {
        // Use cached summary
        const newActions: ActionItem[] = cached.actionItems.map((item, i) => {
          if (typeof item === 'string') {
            return {
              id: `gen-${Date.now()}-${i}`,
              text: item,
              assignee: "Auto-assigned",
              completed: false
            };
          }
          return {
            id: `gen-${Date.now()}-${i}`,
            text: item.text,
            assignee: item.assignee,
            completed: false
          };
        });

        setMeetingData(prev => ({
          ...prev,
          summaryContent: cached.content,
          actionItems: [...prev.actionItems, ...newActions].slice(-10),
          customProfileId: customProfile?.id
        }));
        setLoading(false);
        return;
      }

      // Generate new summary if not cached
      const attendeeNames = meetingData.attendees.map(a => a.name);
      const result = await generateMeetingSummary(
        meetingData.transcript,
        newType,
        meetingData.date,
        attendeeNames,
        customProfile?.systemPrompt,
        customProfile?.name
      );

      // Save to cache (remote or local)
      const summaryData = {
        content: result.content,
        actionItems: result.actionItems,
        timestamp: Date.now()
      };

      if (user?.id) {
        await saveRemoteSummary(user.id, meetingData.id, newType, summaryData);
      } else {
        saveSummary(meetingData.id, newType, summaryData);
      }

      const newActions: ActionItem[] = result.actionItems.map((item, i) => ({
        id: `gen-${Date.now()}-${i}`,
        text: item.text,
        assignee: item.assignee,
        completed: false
      }));

      setMeetingData(prev => ({
        ...prev,
        summaryContent: result.content,
        actionItems: [...prev.actionItems, ...newActions].slice(-10),
        customProfileId: customProfile?.id
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultProfile = (id: string) => {
    customProfileService.setDefaultProfileId(id);
    setDefaultProfileId(id);
  };

  const toggleActionItem = (id: string) => {
    setMeetingData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const result = await askMeetingQuestion(meetingData.transcript, question);
      setAnswer(result);
    } catch (e) {
      setAnswer("Sorry, I couldn't get an answer right now.");
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAskQuestion();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyActionItems = () => {
    const actionItemsText = meetingData.actionItems
      .map(item => `- ${item.assignee}: ${item.text}`)
      .join('\n');
    copyToClipboard(actionItemsText);
  };

  const handleGenerateFollowUpEmail = async () => {
    setIsGeneratingEmail(true);
    try {
      // Get the first attendee as the user (or you could make this configurable)
      const userName = meetingData.attendees[0]?.name || "User";

      const email = await generateFollowUpEmail(
        meetingData.summaryContent,
        meetingData.actionItems.map(item => ({ text: item.text, assignee: item.assignee })),
        userName,
        meetingData.videoUrl
      );

      copyToClipboard(email);
    } catch (error) {
      console.error("Error generating email:", error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleShareMeeting = () => {
    if (meetingData.videoUrl) {
      copyToClipboard(meetingData.videoUrl);
      setShareButtonCopied(true);
      setTimeout(() => setShareButtonCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      <div className="flex items-center bg-[#0d1117] border-b border-[#30363d] sticky top-0 z-50">
        <button
          onClick={onBack}
          className="px-4 py-4 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border-r border-[#30363d] transition-colors flex items-center gap-2 h-full"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-bold">Back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between p-4 bg-[#0d1117]">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-[#e6edf3]">{meetingData.title}</h1>
              <p className="text-sm text-[#8b949e]">{meetingData.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareMeeting}
                className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 transition-all duration-300 ${
                  shareButtonCopied
                    ? 'bg-[#ccff00]/20 border-[#ccff00]/50 text-[#ccff00]'
                    : 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/20'
                }`}
                title="Copy Fathom share link"
              >
                {shareButtonCopied ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.04.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                    <span className="text-sm font-medium">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Video & Summary/Transcript */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <VideoPlayer url={meetingData.videoUrl} title={meetingData.title} thumbnailUrl={thumbnailUrl} embedHtml={embedHtml} />

          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-xl">
            <MainTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-[600px]">
              {activeTab === 'summary' && (
                <>
                  <SummarySelector
                    selectedType={meetingData.currentType}
                    onTypeChange={handleTypeChange}
                    onCopy={() => copyToClipboard(meetingData.summaryContent)}
                    onAddProfile={() => setIsCustomModalOpen(true)}
                    customProfiles={customProfiles}
                    defaultProfileId={defaultProfileId}
                    onSetDefault={handleSetDefaultProfile}
                  />

                  <div className="p-5 prose prose-invert max-w-none relative group/summary">
                    <button
                      onClick={() => copyToClipboard(meetingData.summaryContent)}
                      className="absolute top-4 right-4 opacity-0 group-hover/summary:opacity-100 transition-opacity bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs px-2 py-1 rounded"
                    >
                      Copy Summary
                    </button>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#8b949e] animate-pulse">Generating {meetingData.currentType} insights...</p>
                      </div>
                    ) : (
                      <div className="summary-content">
                        <div className="text-[#c9d1d9] leading-snug space-y-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold mt-6 mb-3 text-white tracking-tight border-b border-[#30363d] pb-2" {...props} />,
                              h2: ({ node, ...props }) => (
                                <div className="group/section relative mt-6 mb-2 pb-1">
                                  <div className="absolute -left-4 top-1 w-1 h-5 bg-[#ccff00] rounded-r opacity-0 group-hover/section:opacity-100 transition-opacity"></div>
                                  <h2 className="text-lg font-bold text-[#e6edf3] flex items-center gap-2" {...props} />
                                </div>
                              ),
                              h3: ({ node, ...props }) => (
                                <div className="group/subsection relative mt-4 mb-1.5">
                                  <h3 className="text-base font-semibold text-[#c9d1d9]" {...props} />
                                </div>
                              ),
                              blockquote: ({ node, ...props }) => (
                                <div className="my-3 p-3 bg-[#161b22] border-l-4 border-[#ccff00] rounded-r-lg shadow-sm">
                                  <blockquote className="text-[#e6edf3] italic text-sm leading-snug" {...props} />
                                </div>
                              ),
                              ul: ({ node, ...props }) => <ul className="space-y-1 my-2 [&_ul]:ml-8 [&_ul]:mt-1 [&_ul]:space-y-0.5" {...props} />,
                              ol: ({ node, ...props }) => <ol className="space-y-1 my-2 [&_ol]:ml-8 [&_ol]:mt-1 [&_ol]:space-y-0.5" {...props} />,
                              li: ({ node, ...props }) => (
                                <li className="text-sm leading-tight flex items-start gap-2">
                                  <span className="text-[#ccff00] mt-0.5 shrink-0">•</span>
                                  <span className="flex-1" {...props} />
                                </li>
                              ),
                              p: ({ node, ...props }) => <p className="text-sm leading-snug text-[#c9d1d9] mb-2" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold text-[#ccff00]" {...props} />,
                              a: ({ node, ...props }) => <a className="text-[#ccff00] hover:underline" {...props} />,
                            }}
                          >
                            {meetingData.summaryContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'transcript' && (
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold">Transcript</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(meetingData.transcript)}
                        className="text-xs bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] px-2 py-1 rounded"
                      >
                        Copy Full Transcript
                      </button>
                      <input type="text" placeholder="Search transcript..." className="bg-[#0d1117] border border-[#30363d] rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ccff00]" />
                    </div>
                  </div>
                  {meetingData.transcript.split('\n').filter(l => l.trim()).map((line, i) => {
                    const [speaker, ...text] = line.split(':');
                    return (
                      <div key={i} className="flex gap-4 group cursor-pointer hover:bg-[#30363d]/20 p-2 rounded transition-colors">
                        <span className="text-[10px] text-[#8b949e] w-12 pt-1">0{Math.floor(i * 0.5)}:0{i}</span>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-bold text-[#ccff00] mb-1 uppercase tracking-tighter">{speaker}</span>
                          <p className="text-sm text-[#c9d1d9]">{text.join(':')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'ask' && (
                <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-[#ccff00]/10 rounded-full flex items-center justify-center text-[#ccff00] text-2xl">
                    ✨
                  </div>
                  <h3 className="text-xl font-bold">Ask StokeMeet AI about this meeting</h3>
                  <p className="text-[#8b949e] max-w-sm">Get answers to specific questions about what was discussed, decisions made, or upcoming deadlines.</p>

                  <div className="w-full max-w-lg relative mt-4">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="What was the decision on the winter promo?"
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#ccff00]"
                      disabled={asking}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={asking || !question.trim()}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#ccff00] p-2 rounded-lg text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {asking ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                      )}
                    </button>
                  </div>

                  {answer && (
                    <div className="w-full max-w-lg mt-6 bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#ccff00] uppercase tracking-wider drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">StokeMeet AI</span>
                      </div>
                      <div className="text-sm text-[#e6edf3] leading-relaxed prose prose-invert">
                        <ReactMarkdown>
                          {answer}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <aside className="w-full lg:w-96 border-l border-[#30363d] bg-[#0d1117] overflow-y-auto">
          <Attendees attendees={meetingData.attendees} />
          <ActionItems
            items={meetingData.actionItems}
            onToggle={toggleActionItem}
            onCopyFor={handleCopyActionItems}
            onFollowUpEmail={handleGenerateFollowUpEmail}
            isGeneratingEmail={isGeneratingEmail}
          />

          <div className="p-6 mt-10">
            {/* Upgrade banner removed */}
          </div>
        </aside>
      </main>

      <CustomProfileModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={(profile) => {
          const saved = customProfileService.saveProfile(profile);
          setCustomProfiles([...customProfiles, saved]);
          setIsCustomModalOpen(false);
          // Automatically switch to the new profile
          handleTypeChange(saved.id);
        }}
      />
    </div>
  );
};