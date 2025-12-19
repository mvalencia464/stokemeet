import React, { useState, useRef, useEffect } from 'react';
import { Meeting, SummaryTemplate } from '../types';
import { generateMeetingTakeaways, askStokeMeet } from '../services/geminiService';

interface MeetingDetailsProps {
  meeting: Meeting;
  onUpdate: (updated: Meeting) => Promise<void>;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meeting, onUpdate }) => {
  const [template, setTemplate] = useState<SummaryTemplate>('Standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript' | 'chat'>('summary');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    const data = meeting.videoData || meeting.audioData;
    if (data instanceof Blob) {
      const url = URL.createObjectURL(data);
      setMediaUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof data === 'string') {
      setMediaUrl(data);
    } else {
      setMediaUrl(null);
    }
  }, [meeting.videoData, meeting.audioData]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await generateMeetingTakeaways(meeting.transcript, template);
      await onUpdate({
        ...meeting,
        summary: result.summary,
        takeaways: result.takeaways
      });
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please check your API connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const seekTo = (seconds: number) => {
    if (meeting.videoData && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(console.error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (meeting.audioData && audioRef.current) {
      audioRef.current.currentTime = seconds;
      audioRef.current.play().catch(console.error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatItemTime = (seconds?: number) => {
    if (seconds === undefined) return null;
    return `(${formatDuration(seconds)})`;
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(meeting.transcript);
    alert("Transcript copied to clipboard!");
  };

  const handleDownloadTranscript = () => {
    const blob = new Blob([meeting.transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const prefix = localStorage.getItem('stoke_filename_prefix') || 'StokeMeet';
    a.download = `${prefix}_${meeting.title.replace(/\s+/g, '_')}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMedia = () => {
    if (!mediaUrl) return;
    const a = document.createElement('a');
    a.href = mediaUrl;
    const prefix = localStorage.getItem('stoke_filename_prefix') || 'StokeMeet';
    const ext = 'webm';
    a.download = `${prefix}_${meeting.title.replace(/\s+/g, '_')}_recording.${ext}`;
    a.click();
  };

  const handleAskStokeMeet = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await askStokeMeet(meeting.transcript, userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "Error connecting to Gemini." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const parseTimestamp = (line: string): number | null => {
    const match = line.match(/\[(\d{2}):(\d{2})\]/);
    if (match) {
      return parseInt(match[1]) * 60 + parseInt(match[2]);
    }
    return null;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50/50">
      <div className="bg-white border-b border-zinc-200 px-8 py-6 sticky top-0 z-10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">{meeting.title}</h2>
              <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1 font-medium">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                  {new Date(meeting.timestamp).toLocaleDateString()}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDuration(meeting.duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative">
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as SummaryTemplate)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <option value="Standard">Standard Summary</option>
                  <option value="Executive">Executive Brief</option>
                  <option value="Technical">Technical Report</option>
                  <option value="Sales">Sales Deep Dive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !meeting.transcript}
                className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {isAnalyzing ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                {isAnalyzing ? 'Analyzing...' : meeting.summary ? 'Re-Analyze' : 'Analyze'}
              </button>
              <button
                onClick={handleDownloadMedia}
                disabled={!mediaUrl}
                className="p-2.5 bg-white border border-zinc-200 text-zinc-500 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm active:scale-[0.98]"
                title="Download Recording"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>
          </div>

          {meeting.videoData && mediaUrl ? (
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-zinc-800 aspect-video ring-1 ring-zinc-900/5">
              <video
                ref={videoRef}
                src={mediaUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          ) : meeting.audioData && mediaUrl ? (
            <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-4 border border-zinc-200/60 shadow-sm">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Audio-Only</span>
              </div>
              <audio
                ref={audioRef}
                controls
                src={mediaUrl}
                className="flex-1 h-10 accent-zinc-900"
              />
            </div>
          ) : (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 text-sm flex items-center gap-2 font-medium">
              <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Recording not found.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border-b border-zinc-200 sticky top-[80px] z-[5] shadow-sm">
        <div className="max-w-4xl mx-auto px-8 pt-2">
          <div className="flex p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/50 backdrop-blur-md">
            {['summary', 'transcript', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab
                    ? 'bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-900/5'
                    : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                  }`}
              >
                {tab === 'summary' ? 'AI Takeaways' : tab === 'transcript' ? 'Full Transcript' : 'Ask AI'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'summary' ? (
            <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {!meeting.summary ? (
                <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-sm border border-zinc-100 mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">Ready to distill?</h3>
                  <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">Let Gemini analyze your words and extract the most important bits with clickable timestamps.</p>
                  <button
                    onClick={handleAnalyze}
                    className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold shadow-lg hover:bg-zinc-800 transition-all hover:-translate-y-0.5"
                  >
                    Generate Summary
                  </button>
                </div>
              ) : (
                <>
                  <section className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                    <p className="text-lg text-zinc-700 leading-8 font-medium">{meeting.summary}</p>
                  </section>

                  <div className="grid grid-cols-1 gap-6">
                    {meeting.takeaways?.map((section, idx) => (
                      <section key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col">
                        <h4 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                          {section.title}
                        </h4>
                        <div className="space-y-4">
                          {section.items.map((item, i) => (
                            <div
                              key={i}
                              className={`flex items-start gap-4 group ${item.timestamp !== undefined ? 'cursor-pointer hover:bg-zinc-50 rounded-xl p-3 -m-3 transition-colors' : ''}`}
                              onClick={() => item.timestamp !== undefined && seekTo(item.timestamp)}
                            >
                              <div className="mt-1 shrink-0">
                                {section.type === 'checklist' ? (
                                  <input type="checkbox" readOnly className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                                ) : (
                                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-zinc-700 leading-relaxed text-[15px]">
                                  {item.text}
                                  {item.timestamp !== undefined && (
                                    <span className="ml-2 text-zinc-400 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                      {formatDuration(item.timestamp)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : activeTab === 'transcript' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-end gap-3 sticky top-0 z-10 pt-4 pb-2 bg-zinc-50/90 backdrop-blur-sm -mx-8 px-8 border-b border-transparent">
                <button
                  onClick={handleCopyTranscript}
                  className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2 shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy
                </button>
                <button
                  onClick={handleDownloadTranscript}
                  className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2 shadow-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download
                </button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-10">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">Annotated Transcript</h3>
                <div className="space-y-6 font-mono text-sm leading-relaxed text-zinc-600">
                  {meeting.transcript.split('\n').filter(t => t.trim()).map((para, i) => {
                    const ts = parseTimestamp(para);
                    return (
                      <div
                        key={i}
                        className={`group -ml-4 pl-4 border-l-2 border-transparent hover:border-zinc-300 transition-all ${ts !== null ? 'cursor-pointer' : ''}`}
                        onClick={() => ts !== null && seekTo(ts)}
                      >
                        <p className="">
                          {para.startsWith('[') ? (
                            <>
                              <span className="text-zinc-800 font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-xs mr-3 inline-block">{para.match(/\[\d{2}:\d{2}\]/)?.[0]}</span>
                              {para.replace(/\[\d{2}:\d{2}\]\s*/, '')}
                            </>
                          ) : para}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-[650px] animate-in fade-in zoom-in-50 duration-300">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Ask StokeMeet</h3>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Gemini 2.0 Flash Active
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const text = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
                      navigator.clipboard.writeText(text);
                    }}
                    className="p-2 bg-white border border-zinc-200 text-zinc-500 rounded-lg hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-sm"
                    title="Copy Chat"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                  <button
                    onClick={() => {
                      const text = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
                      const blob = new Blob([text], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      const prefix = localStorage.getItem('stoke_filename_prefix') || 'StokeMeet';
                      a.download = `${prefix}_Chat_${meeting.id}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2 bg-white border border-zinc-200 text-zinc-500 rounded-lg hover:text-zinc-900 hover:border-zinc-300 transition-colors shadow-sm"
                    title="Download Chat"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
                {chatMessages.length === 0 && (
                  <div className="text-center py-20 px-6 h-full flex flex-col justify-center items-center opacity-50">
                    <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </div>
                    <h4 className="font-bold text-zinc-900 mb-2">Ask anything</h4>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">Gemini can find quotes, summarize specific topics, or draft emails from this transcript.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                    <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-none'
                        : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-bl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start animate-in fade-in duration-200">
                    <div className="bg-zinc-50 border border-zinc-100 px-5 py-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-zinc-100">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskStokeMeet()}
                    className="w-full pl-5 pr-32 py-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm placeholder:text-zinc-400"
                  />
                  <div className="absolute right-2 flex gap-2">
                    <button
                      onClick={handleAskStokeMeet}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-all font-bold text-xs"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
