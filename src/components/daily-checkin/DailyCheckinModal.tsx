import React, { useState, useEffect } from 'react';
import {
  X,
  HeartPulse,
  Activity,
  Droplets,
  Moon,
  Smile,
  Thermometer,
  Pill,
  Trash2,
} from 'lucide-react';
import {
  DailyHealthEntry,
  HealthWellbeing,
  EnergyLevel,
  SleepQuality,
  StressLevel,
  MedicationEntry,
} from '../../types';
import { saveCheckin, deleteCheckin, getMedications } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: DailyHealthEntry | null;
  patientId: string;
  onSaved: () => void;
}

export const DailyCheckinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  entryToEdit,
  patientId,
  onSaved,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [wellbeing, setWellbeing] = useState<HealthWellbeing>('Good');
  const [energy, setEnergy] = useState<EnergyLevel>('Moderate');
  const [discomfort, setDiscomfort] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Lifestyle fields
  const [sleepHours, setSleepHours] = useState<string>('');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | ''>('');
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<string>('');
  const [physicalActivity, setPhysicalActivity] = useState<string>('');
  const [sedentaryHours, setSedentaryHours] = useState<string>('');
  const [stressLevel, setStressLevel] = useState<StressLevel | ''>('');
  const [dietNotes, setDietNotes] = useState<string>('');

  // Symptoms
  const [symptomsPresent, setSymptomsPresent] = useState<boolean>(false);
  const [symptomSummary, setSymptomSummary] = useState<string>('');

  // Measurements
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Available medications for adherence tracking
  const [availableMeds, setAvailableMeds] = useState<MedicationEntry[]>([]);
  const [adherenceMap, setAdherenceMap] = useState<
    Record<string, { status: 'taken' | 'missed' | 'skipped' | 'not_recorded'; reason?: string }>
  >({});

  useEffect(() => {
    if (isOpen) {
      const meds = getMedications(patientId);
      setAvailableMeds(meds);

      if (entryToEdit) {
        setDate(entryToEdit.date);
        setTime(entryToEdit.time || '08:00');
        setWellbeing(entryToEdit.wellbeing);
        setEnergy(entryToEdit.energy);
        setDiscomfort(entryToEdit.discomfort || '');
        setNotes(entryToEdit.notes || '');

        setSleepHours(entryToEdit.lifestyle?.sleepHours?.toString() || '');
        setSleepQuality(entryToEdit.lifestyle?.sleepQuality || '');
        setWaterIntakeLiters(entryToEdit.lifestyle?.waterIntakeLiters?.toString() || '');
        setPhysicalActivity(entryToEdit.lifestyle?.physicalActivity || '');
        setSedentaryHours(entryToEdit.lifestyle?.sedentaryHours?.toString() || '');
        setStressLevel(entryToEdit.lifestyle?.stressLevel || '');
        setDietNotes(entryToEdit.lifestyle?.dietNotes || '');

        setSymptomsPresent(entryToEdit.symptomsPresent);
        setSymptomSummary(entryToEdit.symptomSummary || '');

        setBloodPressureSystolic(entryToEdit.measurements?.bloodPressureSystolic?.toString() || '');
        setBloodPressureDiastolic(entryToEdit.measurements?.bloodPressureDiastolic?.toString() || '');
        setPulse(entryToEdit.measurements?.pulse?.toString() || '');
        setTemperature(entryToEdit.measurements?.temperature?.toString() || '');
        setWeight(entryToEdit.measurements?.weight?.toString() || '');

        const existingAdh: Record<string, any> = {};
        entryToEdit.medicationAdherence?.forEach((item) => {
          existingAdh[item.medicationId] = { status: item.status, reason: item.reason };
        });
        setAdherenceMap(existingAdh);
      } else {
        // Reset defaults
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
        setWellbeing('Good');
        setEnergy('Moderate');
        setDiscomfort('');
        setNotes('');
        setSleepHours('');
        setSleepQuality('');
        setWaterIntakeLiters('');
        setPhysicalActivity('');
        setSedentaryHours('');
        setStressLevel('');
        setDietNotes('');
        setSymptomsPresent(false);
        setSymptomSummary('');
        setBloodPressureSystolic('');
        setBloodPressureDiastolic('');
        setPulse('');
        setTemperature('');
        setWeight('');

        const defaultAdh: Record<string, any> = {};
        meds.forEach((m) => {
          defaultAdh[m.id] = { status: 'taken', reason: '' };
        });
        setAdherenceMap(defaultAdh);
      }
    }
  }, [isOpen, entryToEdit, patientId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const measurementsObj: any = {};
    if (bloodPressureSystolic) measurementsObj.bloodPressureSystolic = Number(bloodPressureSystolic);
    if (bloodPressureDiastolic) measurementsObj.bloodPressureDiastolic = Number(bloodPressureDiastolic);
    if (pulse) measurementsObj.pulse = Number(pulse);
    if (temperature) measurementsObj.temperature = Number(temperature);
    if (weight) measurementsObj.weight = Number(weight);

    const lifestyleObj: any = {};
    if (sleepHours) lifestyleObj.sleepHours = Number(sleepHours);
    if (sleepQuality) lifestyleObj.sleepQuality = sleepQuality;
    if (waterIntakeLiters) lifestyleObj.waterIntakeLiters = Number(waterIntakeLiters);
    if (physicalActivity) lifestyleObj.physicalActivity = physicalActivity;
    if (sedentaryHours) lifestyleObj.sedentaryHours = Number(sedentaryHours);
    if (stressLevel) lifestyleObj.stressLevel = stressLevel;
    if (dietNotes) lifestyleObj.dietNotes = dietNotes;

    const medAdhList = Object.entries(adherenceMap).map(([medId, val]) => {
      const med = availableMeds.find((m) => m.id === medId);
      return {
        medicationId: medId,
        medicationName: med?.name || 'Unknown Medication',
        status: val.status,
        reason: val.reason,
      };
    });

    const newEntry: DailyHealthEntry = {
      id: entryToEdit?.id || `chk-${Date.now()}`,
      patientId,
      date,
      time,
      wellbeing,
      energy,
      discomfort: discomfort.trim() || undefined,
      notes: notes.trim() || undefined,
      lifestyle: Object.keys(lifestyleObj).length > 0 ? lifestyleObj : undefined,
      symptomsPresent,
      symptomSummary: symptomsPresent ? symptomSummary.trim() : undefined,
      measurements: Object.keys(measurementsObj).length > 0 ? measurementsObj : undefined,
      medicationAdherence: medAdhList.length > 0 ? medAdhList : undefined,
      createdAt: entryToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveCheckin(newEntry);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (entryToEdit && confirm('Are you sure you want to delete this daily health check-in?')) {
      deleteCheckin(entryToEdit.id);
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {entryToEdit ? 'Edit Daily Health Check-in' : 'New Daily Health Check-in'}
              </h2>
              <p className="text-xs text-slate-500">
                Optional fields may remain blank. Unanswered fields are never assumed to be normal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Entry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Time of Entry
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section A: General Wellbeing */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Smile className="w-4 h-4 text-teal-600" />
              A. General Wellbeing & Energy
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Overall Wellbeing Today
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['Great', 'Good', 'Fair', 'Poor', 'Very Poor'] as HealthWellbeing[]).map((wb) => (
                  <button
                    type="button"
                    key={wb}
                    onClick={() => setWellbeing(wb)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                      wellbeing === wb
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {wb}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Energy Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['High', 'Moderate', 'Low', 'Exhausted'] as EnergyLevel[]).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergy(lvl)}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                      energy === lvl
                        ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Discomfort or Bodily Aches (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mild ear fullness, lower back tightness, sinus pressure"
                value={discomfort}
                onChange={(e) => setDiscomfort(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section B: Lifestyle Habits */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Moon className="w-4 h-4 text-teal-600" />
              B. Lifestyle & Sleep
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sleep Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="e.g. 7.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Sleep Quality
                </label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as SleepQuality)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="">(Not recorded)</option>
                  <option value="Restful">Restful</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                  <option value="Restless">Restless</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Water Intake (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 2.0"
                  value={waterIntakeLiters}
                  onChange={(e) => setWaterIntakeLiters(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Physical Activity / Exercise
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30 min brisk walk, yoga"
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Perceived Stress Level
                </label>
                <select
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value as StressLevel)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="">(Not recorded)</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section C: Symptoms */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                C. Symptoms Check
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={symptomsPresent}
                  onChange={(e) => setSymptomsPresent(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
                />
                Symptoms present today?
              </label>
            </div>

            {symptomsPresent && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-semibold text-amber-900">
                  Brief description of symptoms experienced today:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharp right ear pain (7/10), throbbing sensation, dizziness"
                  value={symptomSummary}
                  onChange={(e) => setSymptomSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-amber-700">
                  Tip: For in-depth tracking with severity score and body location, use the dedicated Symptom Tracker.
                </p>
              </div>
            )}
          </div>

          {/* Section D: Measurements & Vitals */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-teal-600" />
              D. Recorded Vitals & Measurements (Optional)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  BP Systolic (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="120"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  BP Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  placeholder="80"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Pulse (bpm)
                </label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.8"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section E: Medication Adherence */}
          {availableMeds.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                E. Medication Status for Today
              </h3>

              <div className="space-y-2">
                {availableMeds.map((med) => {
                  const currentAdh = adherenceMap[med.id] || { status: 'not_recorded' };
                  return (
                    <div
                      key={med.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {med.name}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            ({med.dose} {med.units} - {med.schedule})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {(['taken', 'missed', 'skipped'] as const).map((st) => (
                            <button
                              type="button"
                              key={st}
                              onClick={() =>
                                setAdherenceMap((prev) => ({
                                  ...prev,
                                  [med.id]: { ...prev[med.id], status: st },
                                }))
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                currentAdh.status === st
                                  ? st === 'taken'
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-red-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      {currentAdh.status === 'missed' && (
                        <div>
                          <input
                            type="text"
                            placeholder="Reason for missed dose (e.g. side effects, forgot on trip, ran out)"
                            value={currentAdh.reason || ''}
                            onChange={(e) =>
                              setAdherenceMap((prev) => ({
                                ...prev,
                                [med.id]: { ...prev[med.id], reason: e.target.value },
                              }))
                            }
                            className="w-full px-2.5 py-1 bg-white border border-red-200 rounded-md text-xs focus:ring-1 focus:ring-red-400"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1 pt-4 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700">
              Additional Notes or Observations
            </label>
            <textarea
              rows={2}
              placeholder="Any context, triggers, changes in diet or routine..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {entryToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Entry
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                {entryToEdit ? 'Save Changes' : 'Save Check-in'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
