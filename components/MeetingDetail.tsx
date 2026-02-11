
import React, { useState } from 'react';
import { Header } from './Header';
import { VideoPlayer } from './VideoPlayer';
import { MainTabs } from './MainTabs';
import { SummarySelector } from './SummarySelector';
import { Attendees } from './Attendees';
import { ActionItems } from './ActionItems';
import { MeetingType, MeetingData, ActionItem } from '../types';
import { generateMeetingSummary } from '../services/geminiService';
import { getFathomData } from '../services/fathomService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MeetingDetailProps {
  initialData: MeetingData;
  onBack: () => void;
}

export const MeetingDetail: React.FC<MeetingDetailProps> = ({ initialData, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'ask'>('summary');
  const [loading, setLoading] = useState(false);
  const [meetingData, setMeetingData] = useState<MeetingData>(initialData);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

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

  const handleTypeChange = async (newType: MeetingType) => {
    setLoading(true);
    setMeetingData(prev => ({ ...prev, currentType: newType }));

    try {
      const result = await generateMeetingSummary(meetingData.transcript, newType);

      const newActions: ActionItem[] = result.actionItems.map((text, i) => ({
        id: `gen-${Date.now()}-${i}`,
        text,
        assignee: "Auto-assigned",
        completed: false
      }));

      setMeetingData(prev => ({
        ...prev,
        summaryContent: result.content,
        actionItems: [...prev.actionItems, ...newActions].slice(-10)
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionItem = (id: string) => {
    setMeetingData(prev => ({
      ...prev,
      actionItems: prev.actionItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }));
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
          {/* We override the sticky/border of Header by containing it or just accept it. 
                 Since Header has sticky, we need to ensure this container handles it.
                 Actually, simpler to just have the back button part of the header row. */}
          <div className="flex items-center justify-between p-4 bg-[#0d1117]">
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-[#e6edf3]">{meetingData.title}</h1>
              <p className="text-sm text-[#8b949e]">{meetingData.date}</p>
            </div>
            {/* Replicating Header right side or importing it if we could pass left content. 
                    For now, I'll just manually render the header content here to ensure perfect alignment with the back button 
                    and avoid double borders/sticky issues. This is cleaner than fighting CSS. */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#21262d]">
                <span className="text-blue-500">🔗</span>
                <span className="text-sm font-medium">Share</span>
              </div>
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
                    onCopy={() => {
                      if (meetingData.summaryContent) {
                        navigator.clipboard.writeText(meetingData.summaryContent);
                      }
                    }}
                  />

                  <div className="p-8 prose prose-invert max-w-none">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-[#0070f3] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[#8b949e] animate-pulse">Generating {meetingData.currentType} insights...</p>
                      </div>
                    ) : (
                      <div className="summary-content">
                        {/* Summary title is now part of the markdown content */}
                        <div className="text-[#c9d1d9] leading-relaxed space-y-4">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-[#e6edf3]" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-[#e6edf3]" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-6 mb-2 text-[#e6edf3] border-b border-[#30363d] pb-1" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                              p: ({ node, ...props }) => <p className="text-sm mb-4" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-bold text-[#e6edf3]" {...props} />,
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
                      <input type="text" placeholder="Search transcript..." className="bg-[#0d1117] border border-[#30363d] rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#0070f3]" />
                    </div>
                  </div>
                  {meetingData.transcript.split('\n').filter(l => l.trim()).map((line, i) => {
                    const [speaker, ...text] = line.split(':');
                    return (
                      <div key={i} className="flex gap-4 group cursor-pointer hover:bg-[#30363d]/20 p-2 rounded transition-colors">
                        <span className="text-[10px] text-[#8b949e] w-12 pt-1">0{Math.floor(i * 0.5)}:0{i}</span>
                        <div className="flex flex-col flex-1">
                          <span className="text-xs font-bold text-[#0070f3] mb-1 uppercase tracking-tighter">{speaker}</span>
                          <p className="text-sm text-[#c9d1d9]">{text.join(':')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'ask' && (
                <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#0070f3]/10 rounded-full flex items-center justify-center text-[#0070f3] text-2xl">
                    ✨
                  </div>
                  <h3 className="text-xl font-bold">Ask StokeMeet AI about this meeting</h3>
                  <p className="text-[#8b949e] max-w-sm">Get answers to specific questions about what was discussed, decisions made, or upcoming deadlines.</p>
                  <div className="w-full max-w-lg relative mt-8">
                    <input
                      type="text"
                      placeholder="What was the decision on the winter promo?"
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#0070f3] p-2 rounded-lg text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Sidebar */}
        <aside className="w-full lg:w-96 border-l border-[#30363d] bg-[#0d1117] overflow-y-auto">
          <Attendees attendees={meetingData.attendees} />
          <ActionItems items={meetingData.actionItems} onToggle={toggleActionItem} />

          <div className="p-6 mt-10">
            {/* Upgrade banner removed */}
          </div>
        </aside>
      </main>
    </div>
  );
};
