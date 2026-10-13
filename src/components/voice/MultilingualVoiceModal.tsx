import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Edit2,
  FileText,
  Activity,
  HeartPulse,
  Stethoscope,
  Info,
  ShieldCheck,
  Languages,
  Upload,
  FileAudio,
  Trash2,
  Keyboard,
  ExternalLink,
} from 'lucide-react';
import { PatientProfile, VoiceProcessedResult } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSaveToDestination: (target: 'symptom' | 'checkin' | 'consultation' | 'notes', data: any) => void;
}

export const MultilingualVoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patient,
  onSaveToDestination,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'hindi' | 'marwari' | 'hinglish' | 'english'>('hindi');
  const [inputMode, setInputMode] = useState<'mic' | 'upload' | 'text'>('mic');

  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Uploaded audio file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Spoken text & manual input
  const [transcriptInput, setTranscriptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Result state
  const [processedResult, setProcessedResult] = useState<VoiceProcessedResult | null>(null);
  const [editableOriginal, setEditableOriginal] = useState('');
  const [editableEnglish, setEditableEnglish] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<'symptom' | 'checkin' | 'consultation' | 'notes'>('symptom');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sample phrases for quick demonstration
  const samplePhrases = [
    {
      lang: 'Hindi',
      text: 'Mujhe teen din se khansi aa rahi hai. Raat ko zyada hoti hai aur kabhi-kabhi saans lene mein dikkat hoti hai. Bukhaar nahi hai.',
    },
    {
      lang: 'Marwari',
      text: 'Mhare teen din su khaansi chal ri hai, raat ne ghani badh jaave hai. Kabhi-kabhi saans levane mein dikkat pade hai.',
    },
    {
      lang: 'Hinglish',
      text: 'Right ear mein sharp stabbing pain hai 2 days se, swimming ke baad start hua. Hearing thodi kam ho gayi hai.',
    },
    {
      lang: 'Hindi',
      text: 'Pet mein subah se tez jalan aur dard hai, ulti jaisa lagta hai par ulti hui nahi.',
    },
  ];

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const [isInIframe, setIsInIframe] = useState(false);

  // Check if running in an iframe environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInIframe(window.self !== window.top);
    }
  }, []);

  // Listen to microphone permission change passively (never pre-emptively lock to denied on mount)
  useEffect(() => {
    if (!isOpen) return;
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            setMicPermissionDenied(false);
          }
          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              setMicPermissionDenied(false);
            }
          };
        })
        .catch(() => {
          // Ignore permissions query rejection
        });
    }
  }, [isOpen]);

  // Clean up audio context and urls on unmount or close
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch {}
      }
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    };
  }, [isOpen]);

  // Helper to generate a genuine short sample audio WAV note for immediate testing
  const createSampleWavBlob = (): Blob => {
    const sampleRate = 16000;
    const numChannels = 1;
    const duration = 1.2;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Gentle melodic sound tone
      const sample = Math.sin(2 * Math.PI * 330 * t) * 0.25 * Math.exp(-t * 1.5);
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return 'audio/webm';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
        return c;
      }
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    setMicPermissionDenied(false);
    setProcessingError(null);
    setProcessedResult(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setProcessingError('Microphone not supported on this device. You can upload an audio recording or type symptoms.');
      setInputMode('upload');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (firstErr) {
        // Fallback to basic audio constraints if advanced processing isn't supported
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Sound level visualizer
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkLevel = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkLevel);
            }
          };
          animFrameRef.current = requestAnimationFrame(checkLevel);
        }
      } catch (e) {
        console.warn('AudioContext visualization note:', e);
      }

      // Configure MediaRecorder
      const mimeType = getSupportedMimeType();
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setAudioLevel(0);
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          try { audioContextRef.current.close(); } catch {}
        }
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Web Speech API for optional real-time text feedback ONLY (isolated from stream failure)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLanguage === 'english' ? 'en-IN' : 'hi-IN';

          recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
            if (currentTranscript.trim()) {
              setTranscriptInput(currentTranscript.trim());
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('SpeechRecognition passive notice:', event?.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (err) {
          console.warn('Web Speech API optional preview skipped:', err);
        }
      }
    } catch (err: any) {
      console.warn('Microphone access notice:', err?.name || err?.message || err);
      setIsRecording(false);
      setAudioLevel(0);
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        (typeof err?.message === 'string' &&
          (err.message.toLowerCase().includes('permission') ||
            err.message.toLowerCase().includes('denied') ||
            err.message.toLowerCase().includes('not allowed')));

      if (isDenied) {
        setMicPermissionDenied(true);
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setProcessingError('No microphone hardware detected on your device. Please use Audio File Upload or Type Symptoms.');
      } else {
        setProcessingError('Microphone not available or blocked in this environment. You can upload a voice note or type symptoms below.');
      }
    }
  };

  const stopRecordingAndProcess = () => {
    setIsRecording(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const activeStream = mediaRecorderRef.current.stream;
      mediaRecorderRef.current.stop();
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }

      setTimeout(() => {
        if (audioChunksRef.current.length > 0) {
          const mimeType = getSupportedMimeType();
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            processAudio(base64data, mimeType);
          };
          reader.readAsDataURL(audioBlob);
        } else if (transcriptInput.trim()) {
          processText(transcriptInput.trim());
        } else {
          setProcessingError('No speech was detected. Please try speaking again or click a sample phrase.');
        }
      }, 350);
    } else if (transcriptInput.trim()) {
      processText(transcriptInput.trim());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setProcessingError('Audio file is too large (maximum 25MB). Please upload a shorter voice clip.');
      return;
    }

    setProcessingError(null);
    setUploadedFile(file);
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    const url = URL.createObjectURL(file);
    setUploadedAudioUrl(url);
  };

  const processUploadedFile = () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setProcessingError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const mimeType = uploadedFile.type || 'audio/mp3';
      processAudio(base64data, mimeType);
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setProcessingError('Failed to read the audio file. Please try again.');
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleTrySampleVoiceNote = () => {
    const demoWav = createSampleWavBlob();
    const file = new File([demoWav], 'sample_voice_recording.wav', { type: 'audio/wav' });
    setUploadedFile(file);
    if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    const url = URL.createObjectURL(demoWav);
    setUploadedAudioUrl(url);
    const hindiSample = 'Pet mein subah se tez jalan aur dard hai, ulti jaisa lagta hai par ulti hui nahi.';
    setTranscriptInput(hindiSample);
    setInputMode('upload');

    setIsProcessing(true);
    setProcessingError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      processAudio(base64data, 'audio/wav');
    };
    reader.readAsDataURL(demoWav);
  };

  const processAudio = async (base64Audio: string, mimeType: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          languageHint: selectedLanguage,
          mimeType: mimeType,
          spokenText: transcriptInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process audio');

      setProcessedResult(data);
      setEditableOriginal(data.originalTranscription || transcriptInput);
      setEditableEnglish(data.englishMedicalSummary);
      if (data.clinicalEntities?.suggestedTarget) {
        setSelectedDestination(data.clinicalEntities.suggestedTarget);
      }
    } catch (err: any) {
      console.warn('Audio processing notice:', err?.message || err);
      setProcessingError(err?.message || 'Error processing audio. Please try typing or selecting a demo phrase.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const res = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spokenText: textToProcess.trim(),
          languageHint: selectedLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to translate speech');

      setProcessedResult(data);
      setEditableOriginal(data.originalTranscription || textToProcess);
      setEditableEnglish(data.englishMedicalSummary);
      if (data.clinicalEntities?.suggestedTarget) {
        setSelectedDestination(data.clinicalEntities.suggestedTarget);
      }
    } catch (err: any) {
      console.warn('Text translation notice:', err?.message || err);
      setProcessingError(err?.message || 'Error translating text.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech for review
  const handlePlayAudio = (text: string, lang = 'en-US') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleConfirmAndSave = () => {
    if (!processedResult) return;
    const finalData = {
      originalText: editableOriginal,
      englishSummary: editableEnglish,
      entities: processedResult.clinicalEntities,
      date: new Date().toISOString().split('T')[0],
      sourceLanguage: processedResult.detectedLanguage,
    };
    onSaveToDestination(selectedDestination, finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-teal-500/30 text-teal-200 px-3 py-0.5 rounded-full border border-teal-400/30 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                Multilingual Voice Assistant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">🎙 Speak in Your Language</h2>
            <p className="text-xs sm:text-sm text-teal-100">
              Speak naturally in Hindi, Marwari, Hinglish, or English. We will convert your symptoms into clear medical English for your doctor.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Language selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">1. Select Input Language:</span>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'hindi', label: 'Hindi (हिंदी)' },
                  { id: 'marwari', label: 'Marwari (मारवाड़ी)' },
                  { id: 'hinglish', label: 'Hinglish' },
                  { id: 'english', label: 'English' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedLanguage === lang.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200">
            <div className="flex">
              <button
                type="button"
                onClick={() => setInputMode('mic')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  inputMode === 'mic'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-4 h-4 text-teal-600" />
                <span>Live Microphone</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  inputMode === 'upload'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-teal-600" />
                <span>Upload Audio</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  inputMode === 'text'
                    ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Keyboard className="w-4 h-4 text-teal-600" />
                <span>Type Symptoms</span>
              </button>
            </div>

            {isInIframe && (
              <div className="px-2 py-1">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1 hover:underline"
                  title="Open app in full standalone tab for direct hardware microphone access"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Standalone Tab</span>
                </a>
              </div>
            )}
          </div>

          {/* MODE: LIVE MICROPHONE */}
          {inputMode === 'mic' && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isProcessing}
                    className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 transition-all disabled:opacity-50"
                  >
                    <Mic className="w-10 h-10" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingAndProcess}
                    className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all animate-pulse"
                  >
                    <MicOff className="w-10 h-10" />
                  </button>
                )}
                {isRecording && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full">
                    LIVE
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isRecording
                    ? `Recording... (${recordingSeconds}s) Tap to Stop`
                    : 'Tap Microphone & Speak Symptoms'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRecording
                    ? 'Listening... Describe duration, severity, and where it hurts.'
                    : 'Click the button and speak in Hindi, Marwari, Hinglish, or English.'}
                </p>
              </div>

              {/* Sound wave visualizer */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1.5 h-8 px-4 bg-slate-900 rounded-xl">
                  {[25, 50, 80, 95, 60, 75, 45, 70, 90, 35].map((h, i) => {
                    const scaled = Math.max(15, Math.min(100, Math.round((h * (audioLevel + 20)) / 100)));
                    return (
                      <span
                        key={i}
                        className="w-1 bg-teal-400 rounded-full transition-all duration-75"
                        style={{ height: `${scaled}%` }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Recorded audio review */}
              {recordedAudioUrl && !isRecording && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 max-w-sm w-full">
                  <FileAudio className="w-4 h-4 text-teal-600 shrink-0" />
                  <audio controls src={recordedAudioUrl} className="w-full h-7" />
                </div>
              )}

              {/* Chrome / IFrame Permission Guidance */}
              {micPermissionDenied && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 text-left space-y-2.5 max-w-md animate-in fade-in duration-150 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="text-amber-900 font-bold text-xs block">
                        Microphone Switched On, but Direct Access Restricted by Preview Frame
                      </strong>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        {isInIframe ? (
                          <>
                            Your microphone is already switched on in Chrome! However, browsers restrict direct audio hardware access inside embedded preview frames for security.
                          </>
                        ) : (
                          <>
                            Microphone access was denied or another application is using your microphone device.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end pt-1">
                    {isInIframe && (
                      <a
                        href={typeof window !== 'undefined' ? window.location.href : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open App in New Tab (Direct Mic)
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={handleTrySampleVoiceNote}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Try Sample Audio Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('upload')}
                      className="px-3 py-1.5 bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry Mic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE: UPLOAD AUDIO FILE */}
          {inputMode === 'upload' && (
            <div className="py-3 space-y-4">
              <div className="p-5 border-2 border-dashed border-teal-300 bg-teal-50/30 rounded-2xl text-center space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileAudio className="w-10 h-10 text-teal-600 mx-auto" />
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Upload Recorded Voice Note
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload voice clips from WhatsApp, mobile recorder (.mp3, .m4a, .wav, .webm)
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Choose Audio File
                  </button>
                  <button
                    type="button"
                    onClick={handleTrySampleVoiceNote}
                    className="px-4 py-2 bg-white border border-teal-300 text-teal-800 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-xs"
                  >
                    Load & Analyze Sample Voice Note
                  </button>
                </div>
              </div>

              {uploadedFile && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-slate-800 block truncate">{uploadedFile.name}</span>
                    {uploadedAudioUrl && (
                      <audio controls src={uploadedAudioUrl} className="h-7 w-full max-w-xs" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
                        setUploadedAudioUrl(null);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={processUploadedFile}
                      disabled={isProcessing}
                      className="px-3.5 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl"
                    >
                      Transcribe & Analyze
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE: TYPE SYMPTOMS */}
          {inputMode === 'text' && (
            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="Type symptoms in Hindi, Marwari, Hinglish, or English..."
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => processText(transcriptInput)}
                  disabled={!transcriptInput.trim() || isProcessing}
                  className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  Translate & Analyze
                </button>
              </div>
            </div>
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Processing speech and structuring clinical summary...</span>
            </div>
          )}

          {/* Processing error */}
          {processingError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              {processingError}
            </div>
          )}

          {/* Quick Demo Chips */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Test: Regional Speech Samples
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {samplePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscriptInput(phrase.text);
                    processText(phrase.text);
                  }}
                  className="p-2.5 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 rounded-xl text-left transition-colors"
                >
                  <span className="font-bold text-teal-800 text-[10px] block">{phrase.lang}</span>
                  <p className="text-slate-700 truncate">"{phrase.text}"</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 6 & 7: Dual Display & Confirmation */}
          {processedResult && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-900">Dual Speech & Medical Review:</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold">
                  {processedResult.detectedLanguage} • {processedResult.confidence} confidence
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Original Transcription */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Original Speech:</span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(editableOriginal, 'hi-IN')}
                      className="text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3 h-3" /> Listen
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={editableOriginal}
                    onChange={(e) => setEditableOriginal(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                {/* English Medical Summary */}
                <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-950">English Medical Summary:</span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(editableEnglish, 'en-US')}
                      className="text-teal-800 hover:text-teal-950 flex items-center gap-1 font-semibold"
                    >
                      <Volume2 className="w-3 h-3" /> Listen
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={editableEnglish}
                    onChange={(e) => setEditableEnglish(e.target.value)}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Destination Selection */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">Save Information To:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {(
                    [
                      { id: 'symptom', label: 'Symptom Tracker', icon: Activity },
                      { id: 'checkin', label: 'Daily Check-in', icon: HeartPulse },
                      { id: 'consultation', label: 'Doctor Consult', icon: Stethoscope },
                      { id: 'notes', label: 'General Notes', icon: FileText },
                    ] as const
                  ).map((dest) => {
                    const Icon = dest.icon;
                    return (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => setSelectedDestination(dest.id)}
                        className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition-all ${
                          selectedDestination === dest.id
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{dest.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProcessedResult(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
