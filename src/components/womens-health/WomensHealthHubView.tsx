import React, { useState, useEffect } from 'react';
import {
  Baby,
  Droplets,
  Heart,
  Activity,
  FileText,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Plus,
  Settings,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  PatientProfile,
  PregnancyProfile,
  MenstrualCycleEntry,
  PregnancyWellnessLog,
  HealthMeasurement,
  UltrasoundReportAnalysis,
  MedicalDocument,
  TimelineEvent,
  AppointmentEntry,
} from '../../types';
import { PregnancyJourneyView } from './PregnancyJourneyView';
import { MenstrualCycleView } from './MenstrualCycleView';
import { PregnancyWellnessView } from './PregnancyWellnessView';
import { VitalsTrackerView } from './VitalsTrackerView';
import { UltrasoundReportsView } from './UltrasoundReportsView';
import { WarningSignsView } from './WarningSignsView';
import { GynecologistSummaryView } from './GynecologistSummaryView';

// Modals
import { PregnancyDatingModal } from './modals/PregnancyDatingModal';
import { LogPeriodModal } from './modals/LogPeriodModal';
import { LogWellnessModal } from './modals/LogWellnessModal';
import { LogVitalModal } from './modals/LogVitalModal';
import { UltrasoundReportModal } from './modals/UltrasoundReportModal';

import {
  savePregnancyProfile,
  saveMenstrualCycle,
  deleteMenstrualCycle,
  savePregnancyWellnessLog,
  saveHealthMeasurement,
  savePatient,
} from '../../lib/storage';
import { calculateGestationalAge, analyzeMenstrualCycles } from '../../lib/pregnancyUtils';

export type WomensHealthSubTab =
  | 'overview'
  | 'pregnancy'
  | 'menstrual'
  | 'wellness'
  | 'vitals'
  | 'reports'
  | 'warnings'
  | 'summary';

interface Props {
  patient: PatientProfile;
  pregnancyProfile?: PregnancyProfile | null;
  menstrualCycles: MenstrualCycleEntry[];
  wellnessLogs: PregnancyWellnessLog[];
  measurements: HealthMeasurement[];
  ultrasoundAnalyses: UltrasoundReportAnalysis[];
  documents: MedicalDocument[];
  timelineEvents: TimelineEvent[];
  appointments: AppointmentEntry[];
  initialSubTab?: WomensHealthSubTab;
  onRefresh: () => void;
  onNavigateTab: (tab: any) => void;
}

export const WomensHealthHubView: React.FC<Props> = ({
  patient,
  pregnancyProfile,
  menstrualCycles,
  wellnessLogs,
  measurements,
  ultrasoundAnalyses,
  documents,
  timelineEvents,
  appointments,
  initialSubTab = 'overview',
  onRefresh,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WomensHealthSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // User Settings: Is pregnancy tracking enabled? Is menstrual tracking enabled?
  const [enablePregnancy, setEnablePregnancy] = useState(
    patient.womensHealthSettings?.enablePregnancyTracking ?? (pregnancyProfile?.isActive || true)
  );
  const [enableMenstrual, setEnableMenstrual] = useState(
    patient.womensHealthSettings?.enableMenstrualTracking ?? true
  );

  // Modals state
  const [isDatingModalOpen, setIsDatingModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodToEdit, setPeriodToEdit] = useState<MenstrualCycleEntry | null>(null);
  const [isWellnessModalOpen, setIsWellnessModalOpen] = useState(false);
  const [wellnessToEdit, setWellnessToEdit] = useState<PregnancyWellnessLog | null>(null);
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false);
  const [vitalToEdit, setVitalToEdit] = useState<HealthMeasurement | null>(null);
  const [isUltrasoundModalOpen, setIsUltrasoundModalOpen] = useState(false);

  const gestInfo = calculateGestationalAge(pregnancyProfile || undefined);
  const menstrualStats = analyzeMenstrualCycles(menstrualCycles);

  const handleSavePregnancy = (newProfile: PregnancyProfile) => {
    savePregnancyProfile(newProfile);
    onRefresh();
  };

  const handleSavePeriod = (cycle: MenstrualCycleEntry) => {
    saveMenstrualCycle(cycle);
    onRefresh();
  };

  const handleDeletePeriod = (id: string) => {
    deleteMenstrualCycle(id);
    onRefresh();
  };

  const handleSaveWellness = (log: PregnancyWellnessLog) => {
    savePregnancyWellnessLog(log);
    onRefresh();
  };

  const handleSaveVital = (meas: HealthMeasurement) => {
    saveHealthMeasurement(meas);
    onRefresh();
  };

  const handleToggleModule = (module: 'pregnancy' | 'menstrual', value: boolean) => {
    if (module === 'pregnancy') {
      setEnablePregnancy(value);
      if (pregnancyProfile) {
        savePregnancyProfile({ ...pregnancyProfile, isActive: value });
      }
    } else {
      setEnableMenstrual(value);
    }

    savePatient({
      ...patient,
      womensHealthSettings: {
        enablePregnancyTracking: module === 'pregnancy' ? value : enablePregnancy,
        enableMenstrualTracking: module === 'menstrual' ? value : enableMenstrual,
      },
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs overflow-x-auto no-print">
        <div className="flex items-center gap-1 min-w-max">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Hub Overview</span>
          </button>

          {enablePregnancy && (
            <button
              onClick={() => setActiveSubTab('pregnancy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'pregnancy'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Pregnancy Journey</span>
            </button>
          )}

          {enableMenstrual && (
            <button
              onClick={() => setActiveSubTab('menstrual')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'menstrual'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Menstrual Cycle</span>
            </button>
          )}

          {enablePregnancy && (
            <button
              onClick={() => setActiveSubTab('wellness')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'wellness'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Daily Wellness</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('vitals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'vitals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Vitals & Weight</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Ultrasound & Labs</span>
          </button>

          {enablePregnancy && (
            <button
              onClick={() => setActiveSubTab('warnings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'warnings'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Warning Signs</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('summary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'summary'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gynecologist Summary</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Personalized Dashboard / Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Personalized Greeting Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="relative z-10 space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
                Women's Health & Maternal Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome, {patient.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
                {enablePregnancy && pregnancyProfile?.isActive
                  ? `You are currently at ${gestInfo?.weeks} weeks, ${gestInfo?.days} days (${gestInfo?.trimesterName}). Estimated Due Date: ${gestInfo?.edd}.`
                  : 'Your continuous health history for menstrual wellness, vitals, and gynecological consultations.'}
              </p>
            </div>

            <div className="z-10 shrink-0 flex flex-wrap gap-2">
              {enablePregnancy && (
                <button
                  onClick={() => setIsDatingModalOpen(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all inline-flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Dating Settings</span>
                </button>
              )}

              <button
                onClick={() => setActiveSubTab('summary')}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Doctor Brief</span>
              </button>
            </div>

            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Module Preferences Card (User Control: Section 2) */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Your Active Modules: </strong>
                Customize whether you want pregnancy or menstrual tracking enabled.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enablePregnancy}
                  onChange={(e) => handleToggleModule('pregnancy', e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Pregnancy Tracking</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={enableMenstrual}
                  onChange={(e) => handleToggleModule('menstrual', e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Menstrual Cycle</span>
              </label>
            </div>
          </div>

          {/* Key Overview Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Pregnancy Status Card */}
            {enablePregnancy && (
              <div
                onClick={() => setActiveSubTab('pregnancy')}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 shadow-2xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Pregnancy Progress
                  </span>
                  <Baby className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {pregnancyProfile?.isActive
                    ? `${gestInfo?.weeks}w ${gestInfo?.days}d`
                    : 'Not Configured'}
                </h3>
                <p className="text-xs text-slate-500">
                  {pregnancyProfile?.isActive
                    ? `Due: ${gestInfo?.edd}`
                    : 'Tap to configure dates'}
                </p>
                <div className="pt-1 text-[11px] font-bold text-rose-600 group-hover:underline flex items-center gap-1">
                  <span>View journey & milestones</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Menstrual Cycle Card */}
            {enableMenstrual && (
              <div
                onClick={() => setActiveSubTab('menstrual')}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-rose-300 shadow-2xs transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Menstrual Health
                  </span>
                  <Droplets className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {menstrualStats.averageCycleLengthDays
                    ? `${menstrualStats.averageCycleLengthDays} Days`
                    : `${menstrualCycles.length} Logged`}
                </h3>
                <p className="text-xs text-slate-500">
                  {menstrualCycles[0]
                    ? `Last period: ${menstrualCycles[0].startDate}`
                    : 'No periods recorded'}
                </p>
                <div className="pt-1 text-[11px] font-bold text-rose-600 group-hover:underline flex items-center gap-1">
                  <span>Cycle history & flow</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Vitals & BP */}
            <div
              onClick={() => setActiveSubTab('vitals')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Latest Vitals
                </span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {measurements[0]?.bloodPressureSystolic
                  ? `${measurements[0].bloodPressureSystolic}/${measurements[0].bloodPressureDiastolic}`
                  : 'Not Recorded'}
              </h3>
              <p className="text-xs text-slate-500">
                {measurements[0]?.weightKg
                  ? `Weight: ${measurements[0].weightKg} kg`
                  : 'No measurements yet'}
              </p>
              <div className="pt-1 text-[11px] font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                <span>View vitals curve</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Ultrasound & Reports */}
            <div
              onClick={() => setActiveSubTab('reports')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-2xs transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Ultrasound Vault
                </span>
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {ultrasoundAnalyses.length} Scans
              </h3>
              <p className="text-xs text-slate-500">
                {ultrasoundAnalyses[0]
                  ? ultrasoundAnalyses[0].scanType
                  : 'No ultrasound reports'}
              </p>
              <div className="pt-1 text-[11px] font-bold text-indigo-600 group-hover:underline flex items-center gap-1">
                <span>View scans & biometrics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Quick Women's Health Actions:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {enablePregnancy && (
                <button
                  onClick={() => setIsWellnessModalOpen(true)}
                  className="p-3 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all text-xs font-semibold flex items-center gap-2"
                >
                  <Heart className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Log Daily Wellness</span>
                </button>
              )}

              {enableMenstrual && (
                <button
                  onClick={() => {
                    setPeriodToEdit(null);
                    setIsPeriodModalOpen(true);
                  }}
                  className="p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition-all text-xs font-semibold flex items-center gap-2"
                >
                  <Droplets className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Log Period</span>
                </button>
              )}

              <button
                onClick={() => {
                  setVitalToEdit(null);
                  setIsVitalModalOpen(true);
                }}
                className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all text-xs font-semibold flex items-center gap-2"
              >
                <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Record Vitals & BP</span>
              </button>

              <button
                onClick={() => setIsUltrasoundModalOpen(true)}
                className="p-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all text-xs font-semibold flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Upload Ultrasound</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Pregnancy Journey Tracker */}
      {activeSubTab === 'pregnancy' && (
        <PregnancyJourneyView
          patient={patient}
          pregnancyProfile={pregnancyProfile}
          timelineEvents={timelineEvents}
          documents={documents}
          onOpenDatingModal={() => setIsDatingModalOpen(true)}
          onOpenWellnessModal={() => setIsWellnessModalOpen(true)}
          onOpenVitalModal={() => setIsVitalModalOpen(true)}
          onOpenUltrasoundModal={() => setIsUltrasoundModalOpen(true)}
          onNavigateSubTab={(tab) => setActiveSubTab(tab as any)}
        />
      )}

      {/* SUB-VIEW 3: Menstrual Cycle Tracker */}
      {activeSubTab === 'menstrual' && (
        <MenstrualCycleView
          patient={patient}
          cycles={menstrualCycles}
          onOpenLogModal={(cycle) => {
            setPeriodToEdit(cycle || null);
            setIsPeriodModalOpen(true);
          }}
          onNavigateSubTab={(tab) => setActiveSubTab(tab as any)}
        />
      )}

      {/* SUB-VIEW 4: Pregnancy Wellness Tracker */}
      {activeSubTab === 'wellness' && (
        <PregnancyWellnessView
          patient={patient}
          wellnessLogs={wellnessLogs}
          onOpenLogModal={(log) => {
            setWellnessToEdit(log || null);
            setIsWellnessModalOpen(true);
          }}
        />
      )}

      {/* SUB-VIEW 5: Vitals Tracker */}
      {activeSubTab === 'vitals' && (
        <VitalsTrackerView
          patient={patient}
          measurements={measurements}
          isPregnant={enablePregnancy && pregnancyProfile?.isActive}
          onOpenLogModal={(meas) => {
            setVitalToEdit(meas || null);
            setIsVitalModalOpen(true);
          }}
        />
      )}

      {/* SUB-VIEW 6: Ultrasound Reports */}
      {activeSubTab === 'reports' && (
        <UltrasoundReportsView
          patient={patient}
          documents={documents}
          analyses={ultrasoundAnalyses}
          onOpenUploadModal={() => setIsUltrasoundModalOpen(true)}
        />
      )}

      {/* SUB-VIEW 7: Warning Signs */}
      {activeSubTab === 'warnings' && (
        <WarningSignsView
          pregnancyProfile={pregnancyProfile}
          onRefresh={onRefresh}
        />
      )}

      {/* SUB-VIEW 8: Gynecologist Summary */}
      {activeSubTab === 'summary' && (
        <GynecologistSummaryView
          patient={patient}
          pregnancyProfile={pregnancyProfile}
          cycles={menstrualCycles}
          measurements={measurements}
          ultrasoundAnalyses={ultrasoundAnalyses}
          timelineEvents={timelineEvents}
        />
      )}

      {/* MODALS */}
      <PregnancyDatingModal
        isOpen={isDatingModalOpen}
        onClose={() => setIsDatingModalOpen(false)}
        initialProfile={pregnancyProfile}
        patientId={patient.id}
        onSave={handleSavePregnancy}
      />

      <LogPeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        patientId={patient.id}
        initialCycle={periodToEdit}
        onSave={handleSavePeriod}
        onDelete={handleDeletePeriod}
      />

      <LogWellnessModal
        isOpen={isWellnessModalOpen}
        onClose={() => setIsWellnessModalOpen(false)}
        patientId={patient.id}
        initialLog={wellnessToEdit}
        onSave={handleSaveWellness}
      />

      <LogVitalModal
        isOpen={isVitalModalOpen}
        onClose={() => setIsVitalModalOpen(false)}
        patientId={patient.id}
        isPregnant={enablePregnancy && pregnancyProfile?.isActive}
        initialMeasurement={vitalToEdit}
        onSave={handleSaveVital}
      />

      <UltrasoundReportModal
        isOpen={isUltrasoundModalOpen}
        onClose={() => setIsUltrasoundModalOpen(false)}
        patient={patient}
        pregnancyProfile={pregnancyProfile}
        onAnalysisSaved={() => {
          onRefresh();
          setActiveSubTab('reports');
        }}
      />
    </div>
  );
};
