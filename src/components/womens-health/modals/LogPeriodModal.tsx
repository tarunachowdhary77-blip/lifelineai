import React, { useState } from 'react';
import { X, Calendar, Droplets, CheckCircle2, AlertCircle, Pill, Trash2 } from 'lucide-react';
import { MenstrualCycleEntry, MenstrualFlowLevel, DailyMenstrualFlow } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  initialCycle?: MenstrualCycleEntry | null;
  onSave: (cycle: MenstrualCycleEntry) => void;
  onDelete?: (id: string) => void;
}

export const LogPeriodModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  initialCycle,
  onSave,
  onDelete,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(initialCycle?.startDate || todayStr);
  const [endDate, setEndDate] = useState(initialCycle?.endDate || '');
  const [bleedingDays, setBleedingDays] = useState(
    initialCycle?.bleedingDays?.toString() || '5'
  );

  // Symptoms & Pain
  const [crampsSeverity, setCrampsSeverity] = useState<number>(
    initialCycle?.symptoms?.crampsSeverity ?? 3
  );
  const [lowerAbdominalPain, setLowerAbdominalPain] = useState(
    initialCycle?.symptoms?.lowerAbdominalPain ?? true
  );
  const [backPain, setBackPain] = useState(initialCycle?.symptoms?.backPain ?? false);
  const [headache, setHeadache] = useState(initialCycle?.symptoms?.headache ?? false);
  const [bloating, setBloating] = useState(initialCycle?.symptoms?.bloating ?? false);
  const [fatigue, setFatigue] = useState(initialCycle?.symptoms?.fatigue ?? false);
  const [moodChanges, setMoodChanges] = useState(initialCycle?.symptoms?.moodChanges || '');
  const [nausea, setNausea] = useState(initialCycle?.symptoms?.nausea ?? false);
  const [otherSymptoms, setOtherSymptoms] = useState(initialCycle?.symptoms?.otherSymptoms || '');

  const [interferesWithDaily, setInterferesWithDaily] = useState(
    initialCycle?.symptoms?.interferesWithDailyActivities ?? false
  );
  const [isNewOrDifferent, setIsNewOrDifferent] = useState(
    initialCycle?.symptoms?.isNewOrDifferent ?? false
  );
  const [painTiming, setPainTiming] = useState<'before' | 'during' | 'after'>(
    initialCycle?.symptoms?.timingRelativeToBleeding || 'during'
  );
  const [painTrajectory, setPainTrajectory] = useState<'improving' | 'worsening' | 'unchanged'>(
    initialCycle?.symptoms?.trajectory || 'improving'
  );

  // Flow selection
  const [primaryFlow, setPrimaryFlow] = useState<MenstrualFlowLevel>(
    initialCycle?.dailyFlows?.[0]?.flow || 'moderate'
  );

  // Clots and bleeding patterns
  const [clotsNoticed, setClotsNoticed] = useState(initialCycle?.clotsNoticed ?? false);
  const [clotSize, setClotSize] = useState(initialCycle?.clotSizeCategory || 'none');
  const [bleedingBetweenPeriods, setBleedingBetweenPeriods] = useState(
    initialCycle?.bleedingBetweenPeriods ?? false
  );
  const [bleedingAfterIntercourse, setBleedingAfterIntercourse] = useState(
    initialCycle?.bleedingAfterIntercourse ?? false
  );

  // Medication
  const [usedPainMed, setUsedPainMed] = useState(
    initialCycle?.painReliefMedication?.used ?? false
  );
  const [medName, setMedName] = useState(initialCycle?.painReliefMedication?.name || '');
  const [medDose, setMedDose] = useState(initialCycle?.painReliefMedication?.dose || '');
  const [medEffective, setMedEffective] = useState<'full_relief' | 'partial_relief' | 'no_relief'>(
    initialCycle?.painReliefMedication?.effective || 'partial_relief'
  );
  const [medSideEffects, setMedSideEffects] = useState(
    initialCycle?.painReliefMedication?.sideEffects || ''
  );

  const [notes, setNotes] = useState(initialCycle?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const daysCount = parseInt(bleedingDays, 10) || 5;
    // Build daily flows
    const dailyFlows: DailyMenstrualFlow[] = [];
    const startObj = new Date(startDate);
    for (let i = 0; i < daysCount; i++) {
      const cur = new Date(startObj);
      cur.setDate(cur.getDate() + i);
      dailyFlows.push({
        date: cur.toISOString().split('T')[0],
        flow: i === 0 ? primaryFlow : i === 1 ? 'heavy' : i >= 3 ? 'light' : primaryFlow,
      });
    }

    const entry: MenstrualCycleEntry = {
      id: initialCycle?.id || `cycle-${Date.now()}`,
      patientId,
      startDate,
      endDate: endDate || undefined,
      bleedingDays: daysCount,
      dailyFlows,
      symptoms: {
        crampsSeverity,
        lowerAbdominalPain,
        backPain,
        headache,
        bloating,
        fatigue,
        moodChanges: moodChanges.trim() || undefined,
        nausea,
        otherSymptoms: otherSymptoms.trim() || undefined,
        interferesWithDailyActivities: interferesWithDaily,
        isNewOrDifferent,
        trajectory: painTrajectory,
        timingRelativeToBleeding: painTiming,
      },
      clotsNoticed,
      clotSizeCategory: clotsNoticed ? (clotSize as any) : 'none',
      bleedingBetweenPeriods,
      bleedingAfterIntercourse,
      painReliefMedication: usedPainMed
        ? {
            used: true,
            name: medName.trim() || undefined,
            dose: medDose.trim() || undefined,
            effective: medEffective,
            sideEffects: medSideEffects.trim() || undefined,
          }
        : { used: false },
      notes: notes.trim() || undefined,
      createdAt: initialCycle?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(entry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {initialCycle ? 'Edit Menstrual Cycle Record' : 'Log Menstrual Period'}
              </h2>
              <p className="text-xs text-slate-500">
                Track bleeding dates, flow intensity, cramp severity, and pain medication.
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
          {/* Section A: Dates */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              1. Period Dates & Duration:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Day of Bleeding: *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Day of Bleeding (Optional):
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Bleeding Duration (Days):
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={bleedingDays}
                onChange={(e) => setBleedingDays(e.target.value)}
                className="w-28 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
              />
              <span className="text-[11px] text-slate-500 ml-2">
                (Cycle length is calculated separately from consecutive start dates)
              </span>
            </div>
          </div>

          {/* Section B: Menstrual Flow */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              2. Menstrual Flow Level:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: 'spotting', label: 'Spotting' },
                  { id: 'light', label: 'Light' },
                  { id: 'moderate', label: 'Moderate' },
                  { id: 'heavy', label: 'Heavy' },
                  { id: 'unusually_heavy', label: 'Unusually Heavy' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPrimaryFlow(f.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                    primaryFlow === f.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section C: Symptoms & Pain 0-10 */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                3. Cramps & Menstrual Symptoms:
              </span>
              <span className="font-extrabold text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Pain: {crampsSeverity}/10
              </span>
            </div>

            <div>
              <input
                type="range"
                min="0"
                max="10"
                value={crampsSeverity}
                onChange={(e) => setCrampsSeverity(parseInt(e.target.value, 10))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                <span>0 (No Pain)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe / Debilitating)</span>
              </div>
            </div>

            {/* Symptom checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowerAbdominalPain}
                  onChange={(e) => setLowerAbdominalPain(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Lower Abdominal Pain</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={backPain}
                  onChange={(e) => setBackPain(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Lower Back Pain</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bloating}
                  onChange={(e) => setBloating(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Bloating</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headache}
                  onChange={(e) => setHeadache(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Headache</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fatigue}
                  onChange={(e) => setFatigue(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Fatigue</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nausea}
                  onChange={(e) => setNausea(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>Nausea</span>
              </label>
            </div>

            {/* Pain Context Questions */}
            <div className="space-y-2 pt-2 border-t border-slate-200/80 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interferesWithDaily}
                  onChange={(e) => setInterferesWithDaily(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="font-semibold text-slate-800">
                  Pain interferes with work, school, or daily activities
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewOrDifferent}
                  onChange={(e) => setIsNewOrDifferent(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="text-slate-700">
                  Pain feels new, unusual, or noticeably different from past cycles
                </span>
              </label>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block">Timing:</span>
                  <select
                    value={painTiming}
                    onChange={(e) => setPainTiming(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="during">During bleeding</option>
                    <option value="before">Before bleeding (premenstrual)</option>
                    <option value="after">After bleeding ends</option>
                  </select>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Course:</span>
                  <select
                    value={painTrajectory}
                    onChange={(e) => setPainTrajectory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="improving">Improving over days</option>
                    <option value="unchanged">Unchanged</option>
                    <option value="worsening">Worsening</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section D: Clots & Bleeding Patterns */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wide block">
              4. Clots & Unusual Bleeding (Optional):
            </span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={clotsNoticed}
                onChange={(e) => setClotsNoticed(e.target.checked)}
                className="rounded text-rose-600"
              />
              <span>Noticeable blood clots passed</span>
            </label>

            {clotsNoticed && (
              <div className="pl-6 pt-1 space-y-1">
                <span className="text-[11px] text-slate-500 block">Approximate clot size category:</span>
                <select
                  value={clotSize}
                  onChange={(e) => setClotSize(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="dime_or_smaller">Small (dime or smaller)</option>
                  <option value="quarter_sized">Quarter-sized (approx 2.5 cm)</option>
                  <option value="large_concerning">Large (golf ball size or larger - discuss with doctor)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bleedingBetweenPeriods}
                  onChange={(e) => setBleedingBetweenPeriods(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Bleeding or spotting between periods</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bleedingAfterIntercourse}
                  onChange={(e) => setBleedingAfterIntercourse(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Bleeding after sexual intercourse</span>
              </label>
            </div>
          </div>

          {/* Section E: Medication & Pain Relief */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" />
                5. Pain Relief Medication Used:
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usedPainMed}
                  onChange={(e) => setUsedPainMed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {usedPainMed && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine name (e.g. Ibuprofen, Paracetamol)"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dose (e.g. 400 mg)"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={medEffective}
                    onChange={(e) => setMedEffective(e.target.value as any)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="full_relief">Complete relief</option>
                    <option value="partial_relief">Partial relief</option>
                    <option value="no_relief">No relief</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Reported side effects (if any)"
                    value={medSideEffects}
                    onChange={(e) => setMedSideEffects(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes for Gynecologist:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Started period 2 days early; needed heat pack on day 2."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2">
            {initialCycle && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this menstrual period record?')) {
                    onDelete(initialCycle.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save Menstrual Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
