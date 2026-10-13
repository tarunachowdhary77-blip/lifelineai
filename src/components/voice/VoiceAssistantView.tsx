import React, { useState, useEffect, useRef } from 'react';
import {
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
  Play,
  Pause,
  Trash2,
  HelpCircle,
  Keyboard,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { PatientProfile, VoiceProcessedResult } from '../../types';

interface Props {
  patient: PatientProfile;
  onSaveToDestination: (target: 'symptom' | 'checkin' | 'consultation' | 'notes', data: any) => void;
  onNavigateTab: (tab: any) => void;
}

export const VoiceAssistantView: React.FC<Props> = ({
  patient,
  onSaveToDestination,
  onNavigateTab,
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
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // MediaRecorder, AudioContext & Web Speech references
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Demonstration test samples from requirements
  const samplePhrases = [
    {
      lang: 'Hindi (हिंदी)',
      title: 'Cough with Night Worsening',
      text: 'Mujhe teen din se khansi aa rahi hai. Raat ko zyada hoti hai aur kabhi-kabhi saans lene mein dikkat hoti hai. Bukhaar nahi hai.',
    },
    {
      lang: 'Marwari (मारवाड़ी)',
      title: 'Rajasthani Regional Phrasing',
      text: 'Mhare teen din su khaansi chal ri hai, raat ne ghani badh jaave hai. Kabhi-kabhi saans levane mein dikkat pade hai.',
    },
    {
      lang: 'Hinglish',
      title: 'Ear Pain Post-Swimming',
      text: 'Right ear mein sharp stabbing pain hai 2 days se, swimming ke baad start hua. Hearing thodi kam ho gayi hai.',
    },
    {
      lang: 'Hindi (हिंदी)',
      title: 'Abdominal Burning Sensation',
      text: 'Pet mein subah se tez jalan aur dard hai, ulti jaisa lagta hai par ulti hui nahi.',
    },
  ];

  const [isInIframe, setIsInIframe] = useState(false);

  // Detect iframe environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInIframe(window.self !== window.top);
    }
  }, []);

  // Listen to microphone permission change passively (never pre-emptively lock to denied on mount)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: 'microphone' as PermissionName })
        .then((permissionStatus: any) => {
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
          // Ignore permissions API failure
        });
    }
  }, []);

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

  // Clean up audio context and urls on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch {}
      }
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
    };
  }, []);

  // Helper to generate a short playable sample audio note for instant testing
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
    setSaveSuccessMessage(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setProcessingError('Your browser does not support audio recording. Please use the Audio File Upload or Type Symptoms option.');
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
        // Fallback to basic audio constraints if advanced filters aren't supported
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Set up AudioContext for live sound wave visualizer
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
        console.warn('AudioContext visualization initialization note:', e);
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
            // Non-blocking: We rely on MediaRecorder audio stream sent to Gemini
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
        setProcessingError('No microphone hardware detected on your device. Please plug in a microphone or upload an audio recording.');
      } else {
        setProcessingError(`Microphone access unavailable (${err?.message || 'blocked'}). You can upload an audio file or type symptoms below.`);
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
          setProcessingError('No audio data was recorded. Please speak clearly into your microphone or try uploading an audio file.');
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
    const sampleText = 'Pet mein subah se tez jalan aur dard hai, ulti jaisa lagta hai par ulti hui nahi.';
    setTranscriptInput(sampleText);
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
    setSaveSuccessMessage(`Confirmed voice record forwarded to ${selectedDestination.toUpperCase()} editor.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-teal-500/30 text-teal-200 px-3 py-1 rounded-full border border-teal-400/30 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              Multilingual Voice Assistant
            </span>
            <span className="text-xs text-teal-200 font-medium hidden sm:inline">
              Regional Indian Speech to Medical English
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            🎙 Speak in Your Language
          </h1>

          <p className="text-sm sm:text-base text-teal-100 max-w-2xl leading-relaxed">
            "Speak naturally in Hindi, Marwari, or another supported language. We will help you prepare your health information in English."
          </p>

          {/* Supported Languages communication */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-teal-300 font-semibold">Supported Speech & Translation:</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-white">
              Hindi (हिंदी)
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-white">
              Marwari / Rajasthani (मारवाड़ी)
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-white">
              Hinglish
            </span>
            <span className="px-2.5 py-1 bg-white/10 rounded-lg border border-white/15 text-white">
              English
            </span>
          </div>
        </div>

        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              1. Select Your Input Language / Dialect:
            </label>
            <p className="text-[11px] text-slate-500">
              Lifeline AI adapts phonetic recognition and medical translation accordingly.
            </p>
          </div>

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

        {/* Input Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200">
          <div className="flex">
            <button
              type="button"
              onClick={() => setInputMode('mic')}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                inputMode === 'mic'
                  ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-4 h-4 text-teal-600" />
              <span>Live Microphone</span>
              {isRecording && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                inputMode === 'upload'
                  ? 'border-teal-600 text-teal-700 bg-teal-50/40 rounded-t-xl'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Upload Audio File</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">Fallback</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('text')}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
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
            <div className="px-4 py-2">
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1.5 hover:underline"
                title="Open app in full browser window for direct native microphone access"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Standalone Tab (Direct Mic)</span>
              </a>
            </div>
          )}
        </div>

        {/* TAB 1: LIVE MICROPHONE RECORDING */}
        {inputMode === 'mic' && (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 hover:scale-105 active:scale-95 text-white flex flex-col items-center justify-center shadow-xl shadow-teal-500/30 transition-all group disabled:opacity-50"
                  aria-label="Start recording"
                >
                  <Mic className="w-12 h-12 group-hover:scale-110 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecordingAndProcess}
                  className="w-28 h-28 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-600/40 transition-all animate-pulse"
                  aria-label="Stop recording"
                >
                  <MicOff className="w-12 h-12" />
                </button>
              )}

              {isRecording && (
                <span className="absolute -top-2 -right-2 px-2.5 py-0.5 bg-rose-600 text-white font-bold text-xs rounded-full shadow-xs animate-bounce">
                  RECORDING
                </span>
              )}
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {isRecording
                  ? `Recording in Progress... (${recordingSeconds}s)`
                  : '🎙 Tap Microphone to Speak'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRecording
                  ? 'Speak naturally in your preferred language. Tap the red button when finished.'
                  : 'Tap the button above and describe your symptoms naturally in Hindi, Marwari, Hinglish, or English.'}
              </p>
            </div>

            {/* Live Audio Visualizer Sound Wave when recording */}
            {isRecording && (
              <div className="w-full max-w-xs space-y-2 py-2">
                <div className="flex items-center justify-center gap-1.5 h-10 px-4 bg-slate-900/90 rounded-2xl">
                  {[20, 45, 75, 90, 60, 85, 40, 65, 95, 30, 70, 50].map((h, i) => {
                    const scaled = Math.max(15, Math.min(100, Math.round((h * (audioLevel + 20)) / 100)));
                    return (
                      <span
                        key={i}
                        className="w-1.5 bg-teal-400 rounded-full transition-all duration-75"
                        style={{ height: `${scaled}%` }}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Microphone Active</span>
                  <span className="font-mono text-teal-600 font-bold">{recordingSeconds}s</span>
                </div>
              </div>
            )}

            {/* Recorded audio review playback before re-recording */}
            {recordedAudioUrl && !isRecording && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 max-w-md w-full">
                <FileAudio className="w-5 h-5 text-teal-600 shrink-0" />
                <div className="flex-1 text-left">
                  <span className="text-[11px] font-bold text-slate-700 block">Last Recorded Audio:</span>
                  <audio controls src={recordedAudioUrl} className="w-full h-8 mt-1" />
                </div>
              </div>
            )}

            {/* Chrome / IFrame Permission Guidance */}
            {micPermissionDenied && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 text-left max-w-xl space-y-3 shadow-xs animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-amber-900 text-sm block">
                      Microphone Switched On, but Direct Access Restricted by Preview Frame
                    </strong>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {isInIframe ? (
                        <>
                          Your microphone is already switched on in Google Chrome! However, Chrome's security model blocks direct audio hardware access inside embedded preview frames.
                        </>
                      ) : (
                        <>
                          Microphone access was denied or another application currently has exclusive lock on your microphone device.
                        </>
                      )}
                    </p>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70 text-[11px] text-slate-700 space-y-1">
                      <p className="font-semibold text-slate-900">How to use voice consultation right now:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {isInIframe && (
                          <li>
                            <strong>Open in Standalone Tab</strong>: Run directly in a full browser window with direct live microphone access.
                          </li>
                        )}
                        <li>
                          <strong>Try Sample Voice Note</strong>: 1-click test with a medical patient recording processed by Gemini AI.
                        </li>
                        <li>
                          <strong>Upload Audio File</strong>: Upload any voice note recorded on your phone or PC (.mp3, .m4a, .wav).
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200 flex flex-wrap gap-2 justify-end">
                  {isInIframe && (
                    <a
                      href={typeof window !== 'undefined' ? window.location.href : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in New Tab (Direct Mic)
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleTrySampleVoiceNote}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Try Sample Voice Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('upload')}
                    className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload Audio File
                  </button>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl text-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry Microphone
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AUDIO FILE UPLOAD FALLBACK */}
        {inputMode === 'upload' && (
          <div className="py-4 space-y-5">
            <div className="p-6 border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/30 rounded-3xl text-center space-y-4 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
                onChange={handleFileUpload}
                className="hidden"
                id="voice-file-input"
              />

              <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                <FileAudio className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Upload Voice Note or Audio Recording
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Upload a voice memo recorded on WhatsApp, phone voice recorder, or another device. Supports .mp3, .m4a, .wav, .webm, .ogg (Max 25MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select Audio File
                </button>
                <button
                  type="button"
                  onClick={handleTrySampleVoiceNote}
                  className="px-5 py-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4 text-teal-600" />
                  Load & Analyze Sample Audio Clip
                </button>
              </div>
            </div>

            {uploadedFile && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800">{uploadedFile.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {uploadedAudioUrl && (
                    <audio controls src={uploadedAudioUrl} className="h-8 max-w-xs mt-1" />
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      if (uploadedAudioUrl) URL.revokeObjectURL(uploadedAudioUrl);
                      setUploadedAudioUrl(null);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={processUploadedFile}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Transcribe & Analyze</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TYPE SYMPTOMS DIRECTLY */}
        {inputMode === 'text' && (
          <div className="py-2 space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              Type Your Symptoms in Hindi, Marwari, Hinglish, or English:
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Mhare teen din su khaansi chal ri hai, raat ne ghani badh jaave hai..."
              value={transcriptInput}
              onChange={(e) => setTranscriptInput(e.target.value)}
              className="w-full p-3.5 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 font-sans"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => processText(transcriptInput)}
                disabled={!transcriptInput.trim() || isProcessing}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Translate & Analyze</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center justify-center gap-2.5 max-w-md mx-auto">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
            <span className="font-semibold">Transcribing regional speech & translating to medical English...</span>
          </div>
        )}

        {/* Processing Error Message */}
        {processingError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>Voice Input Notice:</strong> {processingError}
            </div>
          </div>
        )}

        {/* Quick Testing Chips: Sample Regional Speeches */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Quick Test: Natural Regional Phrases
            </span>
            <span className="text-[11px] text-slate-400">Click to test instant translation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTranscriptInput(phrase.text);
                  processText(phrase.text);
                }}
                className="p-3.5 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-2xl text-left text-xs transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-teal-800 text-[11px] uppercase tracking-wide">
                    {phrase.lang}
                  </span>
                  <span className="text-[10px] text-slate-400 group-hover:text-teal-600">
                    {phrase.title}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-sans">
                  "{phrase.text}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 6 & 7: Dual Version Display & Confirmation */}
        {processedResult && (
          <div className="space-y-5 pt-6 border-t border-slate-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Step 6: Dual Display (Review Before Saving)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Detected: {processedResult.detectedLanguage} • Confidence: {processedResult.confidence}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ORIGINAL TRANSCRIPTION */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      ORIGINAL TRANSCRIPTION:
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(editableOriginal, 'hi-IN')}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editableOriginal}
                    onChange={(e) => setEditableOriginal(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  You can edit the original transcription above if any spoken word was misrecognized.
                </p>
              </div>

              {/* ENGLISH MEDICAL SUMMARY */}
              <div className="p-5 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-teal-950 uppercase tracking-wide">
                      ENGLISH MEDICAL SUMMARY:
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(editableEnglish, 'en-US')}
                      className="text-xs text-teal-800 hover:text-teal-950 font-semibold inline-flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Listen in English
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={editableEnglish}
                    onChange={(e) => setEditableEnglish(e.target.value)}
                    className="w-full p-3 bg-white border border-teal-300 rounded-xl text-xs sm:text-sm text-slate-900 leading-relaxed font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <p className="text-[11px] text-teal-800 pt-1">
                  Rewritten in objective, non-diagnostic clinical English for your doctor.
                </p>
              </div>
            </div>

            {/* Extracted Clinical Entities */}
            {processedResult.clinicalEntities && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider block">
                  Extracted Clinical Details:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Primary Symptom</span>
                    <span className="font-bold text-slate-900">
                      {processedResult.clinicalEntities.symptomName || 'General'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                    <span className="font-bold text-slate-900">
                      {processedResult.clinicalEntities.duration || 'Not specified'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Severity</span>
                    <span className="font-bold text-slate-900">
                      {processedResult.clinicalEntities.severity ? `${processedResult.clinicalEntities.severity}/10` : 'Not specified'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase">Location</span>
                    <span className="font-bold text-slate-900">
                      {processedResult.clinicalEntities.bodyLocation || 'Unspecified'}
                    </span>
                  </div>
                </div>

                {processedResult.clinicalEntities.negations && processedResult.clinicalEntities.negations.length > 0 && (
                  <div className="text-xs text-slate-600 pt-1">
                    <strong className="text-rose-700">Explicit Negation (Patient denies): </strong>
                    {processedResult.clinicalEntities.negations.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Destination Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Step 7: Choose Health Record Destination to Save:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                        selectedDestination === dest.id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{dest.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Patient Verification Required:</strong> This entry will not be treated as a confirmed medical record until you review and confirm the English summary above. Lifeline AI does not diagnose illnesses.
              </div>
            </div>

            {saveSuccessMessage && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span className="font-semibold">{saveSuccessMessage}</span>
              </div>
            )}

            {/* Confirm Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProcessedResult(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Reject & Re-record
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="w-full sm:w-auto px-7 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Save to Record</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
