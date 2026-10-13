import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  ShieldAlert,
  Bot,
  HelpCircle,
  FileText,
  Activity,
  HeartPulse,
  Pill,
  RefreshCw,
  Languages,
} from 'lucide-react';
import {
  PatientProfile,
  DailyHealthEntry,
  SymptomEntry,
  MedicationEntry,
  ConsultationEntry,
  MedicalDocument,
} from '../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Props {
  patient: PatientProfile;
  symptoms: SymptomEntry[];
  checkins: DailyHealthEntry[];
  medications: MedicationEntry[];
  consultations: ConsultationEntry[];
  documents: MedicalDocument[];
}

export const HealthEducationAssistantView: React.FC<Props> = ({
  patient,
  symptoms,
  checkins,
  medications,
  consultations,
  documents,
}) => {
  const [responseLanguage, setResponseLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialWelcome = `Hello ${patient.name.split(' ')[0]}! I am your Lifeline AI Health Assistant.
I can help you review your recorded symptoms, explore lifestyle habits and tobacco health risks, understand your health diary, and prepare high-value questions for your next doctor consultation.

How can I help you today? You can select a quick question below or ask in English, Hindi, or Marwari.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: initialWelcome,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const exampleQuestions = [
    'What symptoms have I recorded this month?',
    'How has my sleep and energy changed over the last 30 days?',
    'What health problems are associated with tobacco smoking and gutkha?',
    'What should I tell my doctor about my recurring ear pain and cough?',
    'Help me prepare questions for my next consultation.',
    'What information is missing from my medical history?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build safe patient context
      const patientContext = {
        name: patient.name,
        age: patient.dateOfBirth
          ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
          : 'Unknown',
        sex: patient.sex,
        allergies: patient.allergies,
        conditions: patient.conditions,
        medications: medications.filter((m) => m.active).map((m) => `${m.name} (${m.dose} ${m.units})`),
        tobaccoProfile: patient.tobaccoRisk
          ? `Status: ${patient.tobaccoRisk.status}, Type: ${patient.tobaccoRisk.smokingType || patient.tobaccoRisk.smokelessType || 'None'}, Duration: ${patient.tobaccoRisk.durationYears || 0} years`
          : 'None recorded',
        recentSymptoms: symptoms.slice(0, 5).map((s) => ({
          date: s.date,
          name: s.name,
          location: s.bodyLocation,
          severity: `${s.severity}/10`,
          status: s.status,
          notes: s.notes,
        })),
        recentCheckins: checkins.slice(0, 5).map((c) => ({
          date: c.date,
          wellbeing: c.wellbeing,
          energy: c.energy,
          sleepHours: c.lifestyle?.sleepHours,
          discomfort: c.discomfort,
        })),
        recentConsultations: consultations.slice(0, 3).map((c) => ({
          date: c.date,
          doctor: c.doctorName,
          specialty: c.doctorSpecialty,
          clinic: c.clinicOrHospital,
          reason: c.reasonForConsultation,
          response: c.patientResponse,
        })),
      };

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          patientContext,
          responseLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error connecting to the health knowledge engine. Please check your network and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Lifeline AI Health Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Understand your health history, explore health information, and prepare better questions for your doctor.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 self-start md:self-auto shrink-0">
          <Languages className="w-4 h-4 text-slate-400 ml-1.5" />
          {(
            [
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिंदी (Hindi)' },
              { id: 'mr', label: 'मारवाड़ी (Marwari)' },
            ] as const
          ).map((lang) => (
            <button
              key={lang.id}
              onClick={() => setResponseLanguage(lang.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                responseLanguage === lang.id
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safety & Medical Disclaimers */}
      <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl text-teal-950 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Medical Safety Notice:</strong> This assistant provides general health education and organizes your recorded diary to help you talk with your doctor. It does not diagnose medical conditions, prescribe medication, or replace clinical judgment.
        </p>
      </div>

      {/* Quick Example Question Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Recommended Patient Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-xs font-medium text-slate-700 hover:text-teal-900 transition-all text-left shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-[10px] block ${
                      isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                    {patient.name.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">Reviewing health records and formulating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about your symptoms, sleep patterns, tobacco risks, or doctor questions..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
