import React, { useState, useRef } from 'react';
import { getGeminiClient } from '../services/geminiService';
import { createBlob } from '../utils/audio';
import { Meeting } from '../types';
import { LiveServerMessage, Modality } from '@google/genai';

interface RecorderProps {
  onSave: (meeting: Meeting) => void;
  isGlobalRecording: boolean;
  setIsGlobalRecording: (val: boolean) => void;
}

const Recorder: React.FC<RecorderProps> = ({ onSave, isGlobalRecording, setIsGlobalRecording }) => {
  const [transcript, setTranscript] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScreenCaptureEnabled, setIsScreenCaptureEnabled] = useState(false);

  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);
  const transcriptionRef = useRef('');
  const lastTimestampRef = useRef(-10);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSupportedMimeType = (isVideo: boolean) => {
    const videoTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h244,opus',
      'video/webm',
      'video/mp4'
    ];
    const audioTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    const candidates = isVideo ? videoTypes : audioTypes;
    return candidates.find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const startRecording = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;

      let recordingStream = micStream;
      let actuallyCapturingScreen = false;

      if (isScreenCaptureEnabled) {
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" } as any,
            audio: true
          });
          displayStreamRef.current = displayStream;
          actuallyCapturingScreen = true;

          const combinedTracks = [
            ...displayStream.getVideoTracks(),
            ...micStream.getAudioTracks()
          ];
          recordingStream = new MediaStream(combinedTracks);

          displayStream.getVideoTracks()[0].onended = () => {
            if (isGlobalRecording) stopRecording();
          };
        } catch (e) {
          console.warn("Screen capture failed or cancelled:", e);
          setIsScreenCaptureEnabled(false);
          actuallyCapturingScreen = false;
        }
      }

      const mimeType = getSupportedMimeType(actuallyCapturingScreen);
      console.log(`Using MIME type: ${mimeType}`);

      const mediaRecorder = new MediaRecorder(recordingStream, { mimeType });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      const ai = getGeminiClient();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      console.log("Connecting to Gemini Live...");
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a professional meeting scribe. Transcribe the audio exactly. Do not summarize yet. The primary language is English. Always interpret audio as English."
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live connection opened");
            const source = audioCtx.createMediaStreamSource(micStream);
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              const now = (window as any).currentElapsed || 0;
              let prefix = '';
              if (lastTimestampRef.current + 10 <= now) {
                prefix = `\n[${formatTime(now)}] `;
                lastTimestampRef.current = now;
              }
              transcriptionRef.current += prefix + text;
              setTranscript(transcriptionRef.current);
            }
          },
          onerror: (e) => console.error("Session Error", e),
          onclose: () => console.log("Session Closed")
        }
      });

      sessionRef.current = await sessionPromise;
      console.log("Gemini Session established");
      setIsGlobalRecording(true);
      setElapsedTime(0);
      (window as any).currentElapsed = 0;
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          (window as any).currentElapsed = next;
          return next;
        });
      }, 1000);

    } catch (err) {
      console.error("Could not start recording", err);
      alert("Failed to access media. Please check microphone and screen recording permissions.");
    }
  };

  const stopRecording = () => {
    setIsProcessing(true);
    const currentDuration = elapsedTime;
    const currentTitle = meetingTitle;
    const currentTranscript = transcriptionRef.current;
    const recordedVideo = isScreenCaptureEnabled && !!displayStreamRef.current;

    if (timerRef.current) clearInterval(timerRef.current);
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || (recordedVideo ? 'video/webm' : 'audio/webm');
        const blob = new Blob(chunksRef.current, { type: mimeType });

        const finalMeeting: Meeting = {
          id: Date.now().toString(),
          title: currentTitle || `Meeting ${new Date().toLocaleDateString()}`,
          timestamp: Date.now(),
          transcript: currentTranscript,
          duration: currentDuration,
          audioData: recordedVideo ? undefined : blob,
          videoData: recordedVideo ? blob : undefined
        };

        onSave(finalMeeting);
        setIsGlobalRecording(false);
        setIsProcessing(false);
        setTranscript('');
        setMeetingTitle('');
        transcriptionRef.current = '';
        setElapsedTime(0);

        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (displayStreamRef.current) displayStreamRef.current.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current.stop();
    } else {
      setIsGlobalRecording(false);
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center max-w-md mx-auto">
        <div className="w-12 h-12 border-2 border-zinc-100 border-t-zinc-800 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Finalizing Recording...</h2>
        <p className="text-zinc-500 text-center text-sm">We're encoding your {isScreenCaptureEnabled ? 'video' : 'audio'} and transcript. This may take a moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full">
      {!isGlobalRecording ? (
        <div className="bg-white p-10 rounded-[2rem] premium-shadow border border-zinc-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-900 shadow-sm mb-6 mb-8 border border-zinc-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Start a New Session</h2>
          <p className="text-zinc-500 mb-10 max-w-sm text-center text-sm leading-relaxed">Capture audio or record your entire screen for full meeting context with Gemini's intelligence.</p>

          <div className="w-full space-y-5 mb-10">
            <input
              type="text"
              placeholder="Meeting Title (e.g. Design Review)"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all placeholder:text-zinc-400 font-medium text-sm"
            />

            <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${isScreenCaptureEnabled ? 'bg-zinc-50 border-zinc-300' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isScreenCaptureEnabled ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white'}`}>
                {isScreenCaptureEnabled && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
                <input
                  type="checkbox"
                  checked={isScreenCaptureEnabled}
                  onChange={(e) => setIsScreenCaptureEnabled(e.target.checked)}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-zinc-900 text-sm block">Enable Screen Recording</span>
                <p className="text-xs text-zinc-500 mt-0.5">Video will be stored locally in your browser</p>
              </div>
            </label>

          </div>

          <button
            onClick={startRecording}
            className="w-full py-4 px-6 bg-zinc-900 text-white rounded-xl font-bold shadow-lg hover:bg-zinc-800 active:scale-[0.99] transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
          >
            Start {isScreenCaptureEnabled ? 'Screen Recording' : 'Audio Session'}
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-red-100 flex flex-col h-[70vh] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-zinc-900">{meetingTitle || 'Recording...'}</h2>
                {isScreenCaptureEnabled && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-wider border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                    Video Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-zinc-400 font-mono mt-1 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {formatTime(elapsedTime)}
              </div>
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              Stop & Save
            </button>
          </div>

          <div className="flex-1 bg-zinc-50 rounded-2xl p-6 overflow-y-auto border border-zinc-100/50">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              Live Transcript
            </h3>
            <p className="text-zinc-700 whitespace-pre-wrap leading-loose text-sm font-medium">
              {transcript || <span className="italic text-zinc-400">Listening to audio...</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;
