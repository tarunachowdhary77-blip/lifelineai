import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Calendar,
  Clock,
  Activity,
  Heart,
  Pill,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { MenstrualCycleEntry, PatientProfile } from '../../types';
import { analyzeMenstrualCycles } from '../../lib/pregnancyUtils';

interface Props {
  patient: PatientProfile;
  cycles: MenstrualCycleEntry[];
  onOpenLogModal: (cycleToEdit?: MenstrualCycleEntry | null) => void;
  onNavigateSubTab: (subTab: string) => void;
}

export const MenstrualCycleView: React.FC<Props> = ({
  patient,
  cycles,
  onOpenLogModal,
  onNavigateSubTab,
}) => {
  const stats = analyzeMenstrualCycles(cycles);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-rose-800 via-rose-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
            <Droplets className="w-3.5 h-3.5 text-rose-200" />
            <span>Menstrual Health Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Menstrual Cycle Tracker & Insights
          </h1>

          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            Record period dates, bleeding duration, flow intensity, cramp severity (0–10), and pain relief medication. Prepare concise reports for your gynecologist.
          </p>
        </div>

        <div className="z-10 shrink-0 flex flex-wrap gap-2">
          <button
            onClick={() => onOpenLogModal(null)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-rose-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>Log Period</span>
          </button>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Cycle Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Average Cycle Length
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.averageCycleLengthDays ? `${stats.averageCycleLengthDays}` : '—'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">days</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            From period start to start
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Average Bleeding
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.averageBleedingDays ? `${stats.averageBleedingDays}` : '—'}
            </span>
            <span className="text-xs text-slate-500 font-semibold">days</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Bleeding duration only
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Cycle Regularity
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-sm sm:text-base font-bold ${
                stats.isRegularEstimate === true
                  ? 'text-teal-700'
                  : stats.isRegularEstimate === false
                  ? 'text-amber-700'
                  : 'text-slate-500'
              }`}
            >
              {stats.isRegularEstimate === true
                ? 'Regular'
                : stats.isRegularEstimate === false
                ? 'Variation > 7d'
                : 'Need 2+ cycles'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            {stats.cycleLengthVariationDays !== null
              ? `±${stats.cycleLengthVariationDays} days variation`
              : 'Estimate'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Pain Pattern Trend
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-sm sm:text-base font-bold capitalize ${
                stats.recordedPainTrend === 'severe'
                  ? 'text-rose-600'
                  : stats.recordedPainTrend === 'moderate'
                  ? 'text-amber-600'
                  : 'text-teal-700'
              }`}
            >
              {stats.recordedPainTrend || 'None recorded'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Across logged cycles
          </span>
        </div>
      </div>

      {/* Cycle History Table & List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recorded Menstrual Cycles ({cycles.length})
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of past periods, duration, and reported flow.
            </p>
          </div>

          <button
            onClick={() => onOpenLogModal(null)}
            className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Period</span>
          </button>
        </div>

        {cycles.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Droplets className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No menstrual cycles logged yet.</p>
            <button
              onClick={() => onOpenLogModal(null)}
              className="text-xs font-bold text-rose-600 underline"
            >
              Log your first period to calculate cycle length
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cycles.map((cycle) => (
              <div
                key={cycle.id}
                onClick={() => onOpenLogModal(cycle)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Started: {cycle.startDate}
                    </span>
                    {cycle.endDate && (
                      <span className="text-xs text-slate-500">
                        to {cycle.endDate}
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {cycle.bleedingDays || cycle.dailyFlows?.length || 5} Bleeding Days
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {cycle.cycleLengthDays && (
                      <span className="font-semibold text-slate-800">
                        Cycle Length: {cycle.cycleLengthDays} days
                      </span>
                    )}
                    {cycle.symptoms?.crampsSeverity !== undefined && (
                      <span>• Cramp score: {cycle.symptoms.crampsSeverity}/10</span>
                    )}
                    {cycle.clotsNoticed && (
                      <span className="text-rose-700 font-medium">• Clots noted</span>
                    )}
                    {cycle.painReliefMedication?.used && (
                      <span className="text-blue-700 font-medium">• Pain relief taken</span>
                    )}
                  </div>

                  {cycle.notes && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      "{cycle.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-rose-600 shrink-0">
                  <span>Edit</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gynecologist Shareable Summary Card */}
      <div className="p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Gynecologist Consultation Ready
          </span>
          <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
            You can synthesize these menstrual cycle dates, flow patterns, and cramp scores into an objective clinical brief for your doctor.
          </p>
        </div>

        <button
          onClick={() => onNavigateSubTab('summary')}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 inline-flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Doctor Brief</span>
        </button>
      </div>

      {/* Boundary Disclaimer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Cycle tracking predictions are mathematical estimates. Tracking alone cannot confirm ovulation, guarantee fertility, or exclude medical conditions.
        </p>
      </div>
    </div>
  );
};
