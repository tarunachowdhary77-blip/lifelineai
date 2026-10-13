import React from 'react';
import {
  Activity,
  Plus,
  Scale,
  Heart,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Info,
} from 'lucide-react';
import { HealthMeasurement, PatientProfile } from '../../types';
import { evaluateBloodPressureSafety } from '../../lib/pregnancyUtils';

interface Props {
  patient: PatientProfile;
  measurements: HealthMeasurement[];
  isPregnant?: boolean;
  onOpenLogModal: (measurement?: HealthMeasurement | null) => void;
}

export const VitalsTrackerView: React.FC<Props> = ({
  patient,
  measurements,
  isPregnant = true,
  onOpenLogModal,
}) => {
  // Sort descending by date
  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const latest = sorted[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
            <Activity className="w-3.5 h-3.5 text-blue-200" />
            <span>Maternal & Women's Health Vitals</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Weight, Blood Pressure & Vitals
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Record blood pressure checks, gestational weight progression, resting pulse, and glucose screening. Track trends without automated diagnoses.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={() => onOpenLogModal(null)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-blue-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Record Measurement</span>
          </button>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Latest Vitals Overview Cards */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* BP */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Latest Blood Pressure
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {latest.bloodPressureSystolic && latest.bloodPressureDiastolic
                  ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
                  : '—'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">mmHg</span>
            </div>
            {latest.bloodPressureSystolic && (
              <span
                className={`text-[11px] block font-semibold ${
                  evaluateBloodPressureSafety(
                    latest.bloodPressureSystolic,
                    latest.bloodPressureDiastolic,
                    isPregnant
                  ).color
                }`}
              >
                {
                  evaluateBloodPressureSafety(
                    latest.bloodPressureSystolic,
                    latest.bloodPressureDiastolic,
                    isPregnant
                  ).category
                }
              </span>
            )}
          </div>

          {/* Weight */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Latest Weight
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {latest.weightKg ? `${latest.weightKg}` : '—'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Logged {latest.date}
            </span>
          </div>

          {/* Pulse */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Heart Rate / Pulse
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {latest.pulseBpm ? `${latest.pulseBpm}` : '—'}
              </span>
              <span className="text-xs text-slate-500 font-semibold">bpm</span>
            </div>
            <span className="text-[10px] text-slate-400 block">Resting pulse</span>
          </div>

          {/* Obstetric Exam */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Fundal Height / FHR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {latest.fundalHeightCm ? `${latest.fundalHeightCm} cm` : latest.fetalHeartRateBpm ? `${latest.fetalHeartRateBpm} bpm` : '—'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {latest.fetalHeartRateBpm ? `FHR: ${latest.fetalHeartRateBpm} bpm` : 'Obstetric metric'}
            </span>
          </div>
        </div>
      )}

      {/* Chronological Measurements Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recorded Vitals History ({measurements.length})
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log with data source attribution and clinical safety flags.
            </p>
          </div>

          <button
            onClick={() => onOpenLogModal(null)}
            className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vitals</span>
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Activity className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No vitals or weight entries recorded yet.</p>
            <button
              onClick={() => onOpenLogModal(null)}
              className="text-xs font-bold text-blue-600 underline"
            >
              Log your first measurement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((m) => {
              const bpEval = evaluateBloodPressureSafety(
                m.bloodPressureSystolic,
                m.bloodPressureDiastolic,
                isPregnant
              );

              return (
                <div
                  key={m.id}
                  onClick={() => onOpenLogModal(m)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {m.date} {m.time ? `• ${m.time}` : ''}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.source === 'clinician_recorded'
                            ? 'bg-purple-100 text-purple-800'
                            : m.source === 'device_measured'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {m.source === 'clinician_recorded'
                          ? 'Clinician-Recorded'
                          : m.source === 'device_measured'
                          ? 'Device Measured'
                          : 'Patient Reported'}
                      </span>

                      {bpEval.urgentWarning && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                          Urgent BP Warning
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                      {m.bloodPressureSystolic && (
                        <span className="font-bold text-slate-900">
                          BP: {m.bloodPressureSystolic}/{m.bloodPressureDiastolic} mmHg
                        </span>
                      )}
                      {m.weightKg && (
                        <span>• Weight: {m.weightKg} kg</span>
                      )}
                      {m.pulseBpm && (
                        <span>• Pulse: {m.pulseBpm} bpm</span>
                      )}
                      {m.bloodGlucoseMgDl && (
                        <span>• Glucose: {m.bloodGlucoseMgDl} mg/dL ({m.bloodGlucoseContext || 'Fasting'})</span>
                      )}
                      {m.fundalHeightCm && (
                        <span className="text-rose-700 font-semibold">• Fundal Height: {m.fundalHeightCm} cm</span>
                      )}
                      {m.fetalHeartRateBpm && (
                        <span className="text-rose-700 font-semibold">• FHR: {m.fetalHeartRateBpm} bpm</span>
                      )}
                    </div>

                    {m.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{m.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover:text-blue-600 shrink-0">
                    <span>Edit</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Never alter prescribed medications based solely on home readings. In pregnancy, a persistent blood pressure ≥ 140/90 mmHg, or any reading ≥ 160/110 mmHg, warrants immediate obstetric evaluation.
        </p>
      </div>
    </div>
  );
};
