import React, { useState } from 'react';
import { X, Activity, Scale, Heart, Thermometer, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { HealthMeasurement } from '../../../types';
import { evaluateBloodPressureSafety } from '../../../lib/pregnancyUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  isPregnant?: boolean;
  initialMeasurement?: HealthMeasurement | null;
  onSave: (measurement: HealthMeasurement) => void;
}

export const LogVitalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  isPregnant = true,
  initialMeasurement,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].substring(0, 5);

  const [date, setDate] = useState(initialMeasurement?.date || todayStr);
  const [time, setTime] = useState(initialMeasurement?.time || timeStr);
  const [weightKg, setWeightKg] = useState(
    initialMeasurement?.weightKg?.toString() || ''
  );
  const [systolic, setSystolic] = useState(
    initialMeasurement?.bloodPressureSystolic?.toString() || ''
  );
  const [diastolic, setDiastolic] = useState(
    initialMeasurement?.bloodPressureDiastolic?.toString() || ''
  );
  const [pulse, setPulse] = useState(
    initialMeasurement?.pulseBpm?.toString() || ''
  );
  const [temperature, setTemperature] = useState(
    initialMeasurement?.temperatureC?.toString() || ''
  );
  const [glucose, setGlucose] = useState(
    initialMeasurement?.bloodGlucoseMgDl?.toString() || ''
  );
  const [glucoseContext, setGlucoseContext] = useState<
    'fasting' | 'post_prandial_1h' | 'post_prandial_2h' | 'random'
  >(initialMeasurement?.bloodGlucoseContext || 'fasting');
  const [fundalHeight, setFundalHeight] = useState(
    initialMeasurement?.fundalHeightCm?.toString() || ''
  );
  const [fetalHeartRate, setFetalHeartRate] = useState(
    initialMeasurement?.fetalHeartRateBpm?.toString() || ''
  );
  const [source, setSource] = useState<
    'patient_entered' | 'device_measured' | 'clinician_recorded'
  >(initialMeasurement?.source || 'patient_entered');
  const [notes, setNotes] = useState(initialMeasurement?.notes || '');

  if (!isOpen) return null;

  const sysNum = systolic ? parseInt(systolic, 10) : undefined;
  const diaNum = diastolic ? parseInt(diastolic, 10) : undefined;
  const bpEvaluation = evaluateBloodPressureSafety(sysNum, diaNum, isPregnant);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const measurement: HealthMeasurement = {
      id: initialMeasurement?.id || `meas-${Date.now()}`,
      patientId,
      date,
      time,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      bloodPressureSystolic: sysNum,
      bloodPressureDiastolic: diaNum,
      pulseBpm: pulse ? parseInt(pulse, 10) : undefined,
      temperatureC: temperature ? parseFloat(temperature) : undefined,
      bloodGlucoseMgDl: glucose ? parseFloat(glucose) : undefined,
      bloodGlucoseContext: glucose ? glucoseContext : undefined,
      fundalHeightCm: fundalHeight ? parseFloat(fundalHeight) : undefined,
      fetalHeartRateBpm: fetalHeartRate ? parseInt(fetalHeartRate, 10) : undefined,
      source,
      notes: notes.trim() || undefined,
      createdAt: initialMeasurement?.createdAt || new Date().toISOString(),
    };

    onSave(measurement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Log Weight & Vitals
              </h2>
              <p className="text-xs text-slate-500">
                Record blood pressure, maternal weight, pulse, blood sugar, and obstetric vitals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-sm">
          {/* Date, Time & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Date: *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Measured By: *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl"
              >
                <option value="patient_entered">Self-Recorded</option>
                <option value="device_measured">Home Digital Device</option>
                <option value="clinician_recorded">Doctor / Clinic Staff</option>
              </select>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>Blood Pressure (mmHg):</span>
              <span className={`text-xs ${bpEvaluation.color}`}>
                {bpEvaluation.category}
              </span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Systolic (top):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 115"
                  min="60"
                  max="250"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Diastolic (bottom):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  min="40"
                  max="150"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            {sysNum && diaNum && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                  bpEvaluation.urgentWarning
                    ? 'bg-rose-100 border border-rose-300 text-rose-900 font-semibold'
                    : bpEvaluation.category === 'Stage 2'
                    ? 'bg-amber-100 border border-amber-300 text-amber-900'
                    : 'bg-teal-50 border border-teal-200 text-teal-800'
                }`}
              >
                {bpEvaluation.urgentWarning ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                )}
                <span>{bpEvaluation.message}</span>
              </div>
            )}
          </div>

          {/* Weight & Pulse */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weight (kg):
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                placeholder="e.g. 64.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pulse (bpm):
              </label>
              <input
                type="number"
                min="40"
                max="200"
                placeholder="e.g. 78"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Temperature (°C):
              </label>
              <input
                type="number"
                step="0.1"
                min="34"
                max="43"
                placeholder="e.g. 36.8"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Blood Glucose (When relevant) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide block">
              Blood Glucose (Optional / Gestational Diabetes Monitoring):
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Glucose (mg/dL):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 92"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Measurement Context:
                </label>
                <select
                  value={glucoseContext}
                  onChange={(e) => setGlucoseContext(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="fasting">Fasting</option>
                  <option value="post_prandial_1h">1-Hour Post Meal</option>
                  <option value="post_prandial_2h">2-Hour Post Meal</option>
                  <option value="random">Random / Casual</option>
                </select>
              </div>
            </div>
          </div>

          {/* Obstetric Specific Vitals */}
          {isPregnant && (
            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200/70 space-y-2">
              <span className="font-bold text-xs text-rose-950 uppercase tracking-wide block">
                Clinician Obstetric Exam Vitals (When Measured by Doctor):
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-0.5">
                    Fundal Height (cm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 22 cm"
                    value={fundalHeight}
                    onChange={(e) => setFundalHeight(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-0.5">
                    Fetal Heart Rate (bpm):
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 146 bpm"
                    value={fetalHeartRate}
                    onChange={(e) => setFetalHeartRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Measurement Notes:
            </label>
            <input
              type="text"
              placeholder="e.g. Measured at morning clinic visit, seated rest for 5 min."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Measurement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
