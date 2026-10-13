import React from 'react';
import {
  HeartPulse,
  Activity,
  Pill,
  FolderLock,
  Stethoscope,
  Clock,
  Sparkles,
  CalendarDays,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Info,
  Mic,
  Bot,
  Flame,
  Languages,
} from 'lucide-react';
import {
  PatientProfile,
  DailyHealthEntry,
  SymptomEntry,
  MedicationEntry,
  MedicalDocument,
  ConsultationEntry,
  AppointmentEntry,
  TimelineEvent,
} from '../../types';
import { NavTab } from '../layout/Sidebar';

interface Props {
  patient: PatientProfile;
  checkins: DailyHealthEntry[];
  symptoms: SymptomEntry[];
  medications: MedicationEntry[];
  documents: MedicalDocument[];
  consultations: ConsultationEntry[];
  appointments: AppointmentEntry[];
  timelineEvents: TimelineEvent[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenCheckinModal: () => void;
  onOpenSymptomModal: () => void;
  onOpenMedicationModal: () => void;
  onOpenDocumentModal: () => void;
  onOpenConsultationModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenEvent: (evt: TimelineEvent) => void;
  onOpenSummary: () => void;
}

export const DashboardView: React.FC<Props> = ({
  patient,
  checkins,
  symptoms,
  medications,
  documents,
  consultations,
  appointments,
  timelineEvents,
  onNavigateTab,
  onOpenCheckinModal,
  onOpenSymptomModal,
  onOpenMedicationModal,
  onOpenDocumentModal,
  onOpenConsultationModal,
  onOpenVoiceModal,
  onOpenEvent,
  onOpenSummary,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCheckin = checkins.find((c) => c.date === todayStr);

  const activeMeds = medications.filter((m) => m.active);
  const recentSymptoms = symptoms.slice(0, 3);
  const recentConsultations = consultations.slice(0, 2);
  const recentDocs = documents.slice(0, 3);
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'upcoming')
    .slice(0, 2);
  const recentTimeline = timelineEvents.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Value Proposition */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Consultation Preparation Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {patient.name.split(' ')[0]}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Lifeline AI connects your health history across time, helping you prepare a clearer, chronological summary for your next medical consultation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenSummary}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Prepare My Doctor Summary
            </button>

            <button
              onClick={() => onNavigateTab('timeline')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/15 transition-all"
            >
              <Clock className="w-4 h-4" />
              View Full Timeline ({timelineEvents.length})
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* FEATURE 1: Prominent Multilingual Voice-to-Text Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full border border-white/20">
              Multilingual Voice Assistant
            </span>
            <span className="text-xs text-teal-100 font-medium">
              Hindi • Marwari (मारवाड़ी) • Hinglish
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Speak Naturally in Your Native Language
          </h2>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            "Speak naturally in Hindi, Marwari, or another supported language. We will help you prepare your health information in English."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 z-10 shrink-0">
          <button
            onClick={onOpenVoiceModal}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-slate-50 text-teal-900 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Mic className="w-5 h-5 text-teal-600 animate-pulse" />
            <span>🎙 Speak in Your Language</span>
          </button>
        </div>

        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Women's Health & Maternal Hub Card */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 px-2.5 py-0.5 rounded-full border border-rose-400/30">
              🌸 Women's Health Hub
            </span>
            <span className="text-xs text-rose-200 font-medium hidden sm:inline">
              Pregnancy Journey • Menstrual Cycles • Ultrasound Vault
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">
            Maternal Health, Pregnancy & Gynecological Care
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Connect your pregnancy milestones, menstrual cycle history, daily wellness, and ultrasound biometrics into one organized pre-consultation summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
          <button
            onClick={() => onNavigateTab('womens_health')}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-rose-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 active:scale-95"
          >
            <span>Open Women's Health Hub →</span>
          </button>
        </div>

        <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Fictional Scenario Narrative Card (2-Minute Hackathon Demo) */}
      {patient.isDemoPatient && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Fictional Demonstration Scenario: October 2025 Ear Pain & Recurrence</span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
              Demo Narrative
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>Demonstration Story:</strong> Sarah Jenkins experienced severe right ear pain (Oct 4) after swimming. Urgent care prescribed Amoxicillin (Oct 6). Symptoms improved to 2/10 by Oct 12. However, following a flight to Chicago (Oct 18), severe pain returned with yellowish discharge (8/10). On Oct 22, an ENT specialist found a tympanic perforation, discontinued oral Amoxicillin, and prescribed Ciprofloxacin otic drops.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs">
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-amber-900 font-bold underline hover:text-amber-950"
            >
              Examine timeline sequence →
            </button>
            <span className="text-amber-400">•</span>
            <button
              onClick={onOpenSummary}
              className="text-teal-700 font-bold underline hover:text-teal-900"
            >
              Generate AI pre-consultation handover →
            </button>
          </div>
        </div>
      )}

      {/* 7 Quick Action Buttons (Per Section 4 Requirements) */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Quick Health Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <button
            onClick={onOpenCheckinModal}
            className="p-3 bg-white hover:bg-teal-50/60 rounded-xl border border-slate-200 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <HeartPulse className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">1. Daily Check-in</p>
              <p className="text-[10px] text-slate-500">Log energy & vitals</p>
            </div>
          </button>

          <button
            onClick={onOpenSymptomModal}
            className="p-3 bg-white hover:bg-rose-50/60 rounded-xl border border-slate-200 hover:border-rose-300 text-left transition-all group flex flex-col justify-between"
          >
            <Activity className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">2. Log Symptom</p>
              <p className="text-[10px] text-slate-500">Location & pain score</p>
            </div>
          </button>

          <button
            onClick={onOpenMedicationModal}
            className="p-3 bg-white hover:bg-blue-50/60 rounded-xl border border-slate-200 hover:border-blue-300 text-left transition-all group flex flex-col justify-between"
          >
            <Pill className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">3. Medication</p>
              <p className="text-[10px] text-slate-500">Track doses & status</p>
            </div>
          </button>

          <button
            onClick={onOpenDocumentModal}
            className="p-3 bg-white hover:bg-amber-50/60 rounded-xl border border-slate-200 hover:border-amber-300 text-left transition-all group flex flex-col justify-between"
          >
            <FolderLock className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">4. Upload Doc</p>
              <p className="text-[10px] text-slate-500">Rx, labs & notes</p>
            </div>
          </button>

          <button
            onClick={onOpenConsultationModal}
            className="p-3 bg-white hover:bg-teal-50/60 rounded-xl border border-slate-200 hover:border-teal-300 text-left transition-all group flex flex-col justify-between"
          >
            <Stethoscope className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">5. Doctor Visit</p>
              <p className="text-[10px] text-slate-500">Log clinic care</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('timeline')}
            className="p-3 bg-white hover:bg-indigo-50/60 rounded-xl border border-slate-200 hover:border-indigo-300 text-left transition-all group flex flex-col justify-between"
          >
            <Clock className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-slate-800 leading-tight">6. Health Timeline</p>
              <p className="text-[10px] text-slate-500">Connected events</p>
            </div>
          </button>

          <button
            onClick={onOpenSummary}
            className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-xl border border-teal-200 text-left transition-all group flex flex-col justify-between"
          >
            <Sparkles className="w-5 h-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-teal-950 leading-tight">7. AI Summary</p>
              <p className="text-[10px] text-teal-700">Pre-consult brief</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid: Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Today's Check-in Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                Today's Health Check-in
              </span>
              <span className="text-[11px] font-mono text-slate-400">{todayStr}</span>
            </div>

            {todayCheckin ? (
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900 text-sm">
                    Wellbeing: {todayCheckin.wellbeing}
                  </span>
                  <span className="text-xs text-teal-700 font-semibold">
                    Energy: {todayCheckin.energy}
                  </span>
                </div>
                {todayCheckin.discomfort && (
                  <p className="text-xs text-teal-950">
                    <strong>Discomfort: </strong>{todayCheckin.discomfort}
                  </p>
                )}
                <span className="text-[10px] text-teal-600 font-semibold block pt-1">
                  ✓ Recorded today at {todayCheckin.time || 'earlier'}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  You haven't logged your daily wellbeing or vitals today.
                </p>
                <button
                  onClick={onOpenCheckinModal}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Record Today's Check-in
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">{checkins.length} total entries recorded</span>
            <button
              onClick={() => onNavigateTab('checkin')}
              className="text-teal-600 font-bold hover:underline"
            >
              View History →
            </button>
          </div>
        </div>

        {/* Card 2: Recent Symptoms */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-600" />
                Recent Symptoms
              </span>
              <button
                onClick={onOpenSymptomModal}
                className="text-xs text-rose-600 font-bold hover:underline"
              >
                + Record
              </button>
            </div>

            {recentSymptoms.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No symptoms recorded.</p>
            ) : (
              <div className="space-y-2">
                {recentSymptoms.map((sym) => (
                  <div
                    key={sym.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 truncate max-w-[170px]">{sym.name}</p>
                      <p className="text-[11px] text-slate-500">{sym.date} • {sym.status}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        sym.severity >= 7
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sym.severity}/10
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">{symptoms.length} symptoms logged</span>
            <button
              onClick={() => onNavigateTab('symptoms')}
              className="text-rose-600 font-bold hover:underline"
            >
              Symptom Tracker →
            </button>
          </div>
        </div>

        {/* Card 3: Active Medications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" />
                Current Medications
              </span>
              <button
                onClick={onOpenMedicationModal}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                + Add
              </button>
            </div>

            {activeMeds.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active prescriptions.</p>
            ) : (
              <div className="space-y-2">
                {activeMeds.map((med) => (
                  <div
                    key={med.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{med.name}</p>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                        {med.dose} {med.units}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{med.schedule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">{medications.length} total prescriptions</span>
            <button
              onClick={() => onNavigateTab('medications')}
              className="text-blue-600 font-bold hover:underline"
            >
              Medications →
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Consultations & Timeline Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Consultations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Recent Consultations & Clinical Care
            </h3>
            <button
              onClick={() => onNavigateTab('consultations')}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              View All ({consultations.length})
            </button>
          </div>

          {recentConsultations.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No consultations recorded.</p>
          ) : (
            <div className="space-y-3">
              {recentConsultations.map((con) => (
                <div
                  key={con.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{con.doctorName} ({con.doctorSpecialty})</p>
                      <p className="text-[11px] text-slate-500">{con.clinicOrHospital}</p>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {con.date}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Reason: </strong>{con.reasonForConsultation}
                  </p>
                  <div className="p-2 bg-amber-50/70 rounded-lg text-amber-950 text-[11px]">
                    <strong>Outcome: </strong>{con.patientResponse}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chronological Health Activity Preview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Latest Health Chronology
            </h3>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Timeline ({timelineEvents.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTimeline.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onOpenEvent(evt)}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-slate-800">
                      {evt.date}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      {evt.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 truncate">{evt.title}</p>
                </div>
                <span className="text-slate-400 hover:text-slate-700 text-xs font-bold shrink-0">
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Medical Documents Row */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-amber-600" />
            Medical Documents & Uploaded Records
          </h3>
          <button
            onClick={() => onNavigateTab('documents')}
            className="text-xs font-bold text-teal-600 hover:underline"
          >
            Vault ({documents.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onNavigateTab('documents')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 text-xs flex items-center gap-3 cursor-pointer transition-colors"
            >
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{doc.title}</p>
                <p className="text-[11px] text-slate-500">{doc.category} • {doc.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURE 2 & FEATURE 3: Health Assistant & Health Risks Dashboard Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Feature 2: Health Assistant Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-600" />
                Lifeline AI Health Assistant
              </span>
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                AI Guidance
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Understand Your Story & Prepare Better Questions
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions about your symptoms, sleep patterns, tobacco risks, or get personalized suggestions for your next doctor consultation.
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {['"What symptoms have I recorded this month?"', '"Help me prepare questions for my doctor"'].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab('assistant')}
                  className="text-[11px] bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 rounded-lg px-2.5 py-1 text-slate-700 text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Hindi • Marwari • English</span>
            <button
              onClick={() => onNavigateTab('assistant')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 flex items-center gap-1"
            >
              Open Health Assistant →
            </button>
          </div>
        </div>

        {/* Feature 3: Health Risks & Tobacco Module Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                Health Risks & Prevention
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Evidence-Based
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-base">
              Tobacco & Exposure Risk Education
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Explore health risks from smoking (bidi/cigarettes) and smokeless tobacco (gutkha/khaini), plus interactive timeline charts of quitting benefits.
            </p>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
              <span className="font-bold text-[11px] block">Current Profile:</span>
              <p>
                {patient.tobaccoRisk?.status === 'former_smoker' || patient.tobaccoRisk?.status === 'former_smokeless'
                  ? `Former user (Quit ${patient.tobaccoRisk.quitYearsAgo || 'several'} years ago) • Cardiovascular risk reduced by >50%`
                  : patient.tobaccoRisk?.status?.includes('current')
                  ? 'Current exposure recorded • Check recovery timeline'
                  : 'No active tobacco exposure recorded'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Oral screening & cessation charts</span>
            <button
              onClick={() => onNavigateTab('risks')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
            >
              View Risk Charts & Modules →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
