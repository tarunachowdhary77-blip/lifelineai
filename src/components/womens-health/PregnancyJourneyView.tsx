import React, { useState } from 'react';
import {
  Baby,
  Calendar,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Activity,
  FileText,
  ShieldAlert,
  Edit2,
  Plus,
} from 'lucide-react';
import {
  PregnancyProfile,
  PatientProfile,
  TimelineEvent,
  MedicalDocument,
} from '../../types';
import {
  calculateGestationalAge,
  TRIMESTER_GUIDES,
} from '../../lib/pregnancyUtils';

interface Props {
  patient: PatientProfile;
  pregnancyProfile?: PregnancyProfile | null;
  timelineEvents: TimelineEvent[];
  documents: MedicalDocument[];
  onOpenDatingModal: () => void;
  onOpenWellnessModal: () => void;
  onOpenVitalModal: () => void;
  onOpenUltrasoundModal: () => void;
  onNavigateSubTab: (subTab: string) => void;
}

export const PregnancyJourneyView: React.FC<Props> = ({
  patient,
  pregnancyProfile,
  timelineEvents,
  documents,
  onOpenDatingModal,
  onOpenWellnessModal,
  onOpenVitalModal,
  onOpenUltrasoundModal,
  onNavigateSubTab,
}) => {
  const [selectedTrimesterTab, setSelectedTrimesterTab] = useState<1 | 2 | 3>(2);

  const gestInfo = calculateGestationalAge(pregnancyProfile || undefined);

  // Sync selected tab with current trimester on load
  React.useEffect(() => {
    if (gestInfo?.trimester) {
      setSelectedTrimesterTab(gestInfo.trimester);
    }
  }, [gestInfo?.trimester]);

  const activeTrimesterGuide = TRIMESTER_GUIDES[selectedTrimesterTab];

  // If user has not configured pregnancy dates yet
  if (!pregnancyProfile || !pregnancyProfile.isActive) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4 max-w-xl mx-auto my-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100">
          <Baby className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Set Up Your Pregnancy Journey
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Choose an appropriate dating method (Last Menstrual Period, Clinician EDD, or Dating Ultrasound) to personalize your pregnancy progress and trimester guidance.
        </p>
        <button
          onClick={onOpenDatingModal}
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Configure Pregnancy Dates & Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Pregnancy Status Card */}
      <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
              <Baby className="w-3.5 h-3.5 text-rose-200" />
              <span>{gestInfo?.trimesterName || 'Second Trimester'}</span>
            </div>

            <button
              onClick={onOpenDatingModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-rose-100 border border-white/15 transition-all"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit Dates / Source</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {gestInfo?.weeks} Weeks, {gestInfo?.days} Days
            </h1>
            <span className="text-rose-200 text-sm font-semibold">
              Estimated Due Date: {gestInfo?.edd || 'Needs confirmation'}
            </span>
          </div>

          {/* Fetal Size Analogy */}
          {gestInfo?.sizeAnalogy && (
            <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs flex items-center justify-between gap-4 max-w-lg">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-200 block">
                  Baby Size Analogy:
                </span>
                <span className="text-sm font-bold text-white">
                  Size of a {gestInfo.sizeAnalogy.fruitOrItem}
                </span>
              </div>
              <div className="text-right text-xs text-rose-100">
                <span>Approx: {gestInfo.sizeAnalogy.lengthApprox}</span>
                <span className="block text-[11px] text-rose-200 font-mono">
                  {gestInfo.sizeAnalogy.weightApprox}
                </span>
              </div>
            </div>
          )}

          {/* Gestational Progress Bar */}
          <div className="space-y-1.5 pt-1 max-w-xl">
            <div className="flex justify-between text-xs text-rose-200 font-semibold">
              <span>Conception</span>
              <span>{gestInfo?.progressPercent || 50}% of pregnancy</span>
              <span>Week 40</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-300 to-rose-300 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${gestInfo?.progressPercent || 50}%` }}
              />
            </div>
          </div>

          {/* Dating Source Attribution */}
          <p className="text-[11px] text-rose-200/90 leading-relaxed">
            <strong>Dating Source: </strong>
            {gestInfo?.datingMethodUsed || 'Clinical ultrasound assessment'}
          </p>

          {/* Discrepancy Note (if dates conflict) */}
          {gestInfo?.discrepancyNote && (
            <div className="p-3 bg-amber-500/20 border border-amber-300/40 rounded-xl text-xs text-amber-100 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <span>{gestInfo.discrepancyNote}</span>
            </div>
          )}
        </div>

        <div className="absolute right-[-30px] bottom-[-30px] w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenWellnessModal}
          className="p-3.5 bg-white hover:bg-teal-50/60 rounded-2xl border border-slate-200 hover:border-teal-300 text-left transition-all shadow-2xs group flex flex-col justify-between"
        >
          <HeartPulse className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">1. Log Wellness</p>
            <p className="text-[10px] text-slate-500">Nutrition, sleep & kicks</p>
          </div>
        </button>

        <button
          onClick={onOpenVitalModal}
          className="p-3.5 bg-white hover:bg-blue-50/60 rounded-2xl border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group flex flex-col justify-between"
        >
          <Activity className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">2. Log Vitals</p>
            <p className="text-[10px] text-slate-500">BP, weight & glucose</p>
          </div>
        </button>

        <button
          onClick={onOpenUltrasoundModal}
          className="p-3.5 bg-white hover:bg-indigo-50/60 rounded-2xl border border-slate-200 hover:border-indigo-300 text-left transition-all shadow-2xs group flex flex-col justify-between"
        >
          <FileText className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-xs font-bold text-slate-800 leading-tight">3. Ultrasound Scan</p>
            <p className="text-[10px] text-slate-500">Upload & AI OCR summary</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateSubTab('warnings')}
          className="p-3.5 bg-rose-50/80 hover:bg-rose-100/80 rounded-2xl border border-rose-200 text-left transition-all shadow-2xs group flex flex-col justify-between"
        >
          <ShieldAlert className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-xs font-bold text-rose-950 leading-tight">4. Warning Signs</p>
            <p className="text-[10px] text-rose-700">Urgent care guidelines</p>
          </div>
        </button>
      </div>

      {/* Trimester Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Trimester Milestones & Clinical Guides
            </h2>
            <p className="text-xs text-slate-500">
              Conventional obstetric milestones, appointment planning, recommended investigations, and questions.
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl shrink-0">
            {(
              [
                { id: 1, label: '1st Trimester (1–13w)' },
                { id: 2, label: '2nd Trimester (14–27w)' },
                { id: 3, label: '3rd Trimester (28w+)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTrimesterTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTrimesterTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Trimester Content */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
              {activeTrimesterGuide.title} ({activeTrimesterGuide.range})
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Conventional Obstetric Guidelines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clinical Focus */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wide block">
                Clinical Focus & Routine Care:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeTrimesterGuide.clinicalFocus.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Investigations */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wide block">
                Standard Investigations & Scans:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeTrimesterGuide.recommendedInvestigations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Questions for Clinician */}
          <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2">
            <span className="font-bold text-xs text-teal-950 uppercase tracking-wide block">
              Suggested Questions for Your Next Prenatal Visit:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {activeTrimesterGuide.questionsForClinician.map((q, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-xl border border-teal-100 text-slate-800">
                  <span className="text-teal-700 font-bold mr-1.5">Q{idx + 1}:</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Conventional ranges are educational guides. Completion of milestones does not independently verify fetal health. Follow your obstetrician's personalized schedule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
