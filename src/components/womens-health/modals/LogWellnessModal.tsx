import React, { useState } from 'react';
import {
  X,
  Heart,
  Droplets,
  Moon,
  Activity,
  Smile,
  Utensils,
  Baby,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PregnancyWellnessLog, EnergyLevel, StressLevel } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  initialLog?: PregnancyWellnessLog | null;
  onSave: (log: PregnancyWellnessLog) => void;
}

export const LogWellnessModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  initialLog,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialLog?.date || todayStr);

  // Nutrition
  const [mealsSummary, setMealsSummary] = useState(
    initialLog?.nutrition?.mealsSummary || ''
  );
  const [fruitsVegServings, setFruitsVegServings] = useState(
    initialLog?.nutrition?.fruitsAndVegetablesServings?.toString() || '4'
  );
  const [proteinList, setProteinList] = useState(
    initialLog?.nutrition?.proteinSources?.join(', ') || 'Eggs, Lentils'
  );
  const [calciumList, setCalciumList] = useState(
    initialLog?.nutrition?.dairyOrCalciumSources?.join(', ') || 'Milk, Yogurt'
  );
  const [nauseaSeverity, setNauseaSeverity] = useState<
    'none' | 'mild' | 'moderate' | 'severe'
  >(initialLog?.nutrition?.nauseaSeverity || 'none');
  const [appetiteChange, setAppetiteChange] = useState<
    'normal' | 'increased' | 'decreased' | 'food_aversions'
  >(initialLog?.nutrition?.appetiteChange || 'normal');

  // Hydration
  const [fluidLiters, setFluidLiters] = useState(
    initialLog?.hydration?.approxLiters?.toString() || '2.5'
  );
  const [glassesCount, setGlassesCount] = useState(
    initialLog?.hydration?.glassesCount?.toString() || '10'
  );
  const [difficultyDrinking, setDifficultyDrinking] = useState(
    initialLog?.hydration?.difficultyDrinkingFluids || false
  );
  const [hydrationReminder, setHydrationReminder] = useState<boolean>(
    initialLog?.hydration?.reminderEnabled ?? true
  );

  // Sleep
  const [bedtime, setBedtime] = useState(initialLog?.sleep?.bedtime || '22:30');
  const [wakeTime, setWakeTime] = useState(initialLog?.sleep?.wakeTime || '07:00');
  const [sleepDuration, setSleepDuration] = useState(
    initialLog?.sleep?.estimatedDurationHours?.toString() || '8.5'
  );
  const [sleepQuality, setSleepQuality] = useState<
    'Restful' | 'Average' | 'Poor' | 'Restless'
  >(initialLog?.sleep?.quality || 'Restful');
  const [nightAwakenings, setNightAwakenings] = useState(
    initialLog?.sleep?.nightAwakenings?.toString() || '1'
  );
  const [sleepNotes, setSleepNotes] = useState(
    initialLog?.sleep?.difficultiesNotes || ''
  );

  // Physical Activity
  const [activityType, setActivityType] = useState(
    initialLog?.activity?.type || 'Walking & prenatal stretching'
  );
  const [activityMinutes, setActivityMinutes] = useState(
    initialLog?.activity?.durationMinutes?.toString() || '30'
  );
  const [steps, setSteps] = useState(initialLog?.activity?.steps?.toString() || '5000');
  const [fatigueLevel, setFatigueLevel] = useState<
    'none' | 'mild' | 'moderate' | 'exhausted'
  >(initialLog?.activity?.fatigueLevel || 'mild');

  // Mood
  const [moodStatus, setMoodStatus] = useState<
    'Happy' | 'Calm' | 'Anxious' | 'Overwhelmed' | 'Sad' | 'Neutral'
  >(initialLog?.mood?.moodStatus || 'Calm');
  const [stressLevel, setStressLevel] = useState<StressLevel>(
    initialLog?.mood?.stressLevel || 'Low'
  );
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(
    initialLog?.mood?.energyLevel || 'Moderate'
  );
  const [moodNotes, setMoodNotes] = useState(initialLog?.mood?.notes || '');

  // Fetal Movements (for mid-to-late pregnancy)
  const [feltKicksToday, setFeltKicksToday] = useState<boolean>(
    initialLog?.fetalMovement?.feltToday ?? true
  );
  const [kickPattern, setKickPattern] = useState<
    'active_normal' | 'reduced_noticeably' | 'not_yet_applicable'
  >(initialLog?.fetalMovement?.movementPattern || 'active_normal');
  const [kickCount, setKickCount] = useState(
    initialLog?.fetalMovement?.kickCount?.toString() || '10'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const log: PregnancyWellnessLog = {
      id: initialLog?.id || `well-${Date.now()}`,
      patientId,
      date,
      nutrition: {
        mealsSummary: mealsSummary.trim() || undefined,
        fruitsAndVegetablesServings: fruitsVegServings ? parseInt(fruitsVegServings, 10) : undefined,
        proteinSources: proteinList ? proteinList.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        dairyOrCalciumSources: calciumList ? calciumList.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        nauseaSeverity,
        appetiteChange,
      },
      hydration: {
        approxLiters: fluidLiters ? parseFloat(fluidLiters) : undefined,
        glassesCount: glassesCount ? parseInt(glassesCount, 10) : undefined,
        difficultyDrinkingFluids: difficultyDrinking,
        reminderEnabled: hydrationReminder,
      },
      sleep: {
        bedtime: bedtime.trim() || undefined,
        wakeTime: wakeTime.trim() || undefined,
        estimatedDurationHours: sleepDuration ? parseFloat(sleepDuration) : undefined,
        quality: sleepQuality,
        nightAwakenings: nightAwakenings ? parseInt(nightAwakenings, 10) : undefined,
        difficultiesNotes: sleepNotes.trim() || undefined,
      },
      activity: {
        type: activityType.trim() || undefined,
        durationMinutes: activityMinutes ? parseInt(activityMinutes, 10) : undefined,
        steps: steps ? parseInt(steps, 10) : undefined,
        fatigueLevel,
      },
      mood: {
        moodStatus,
        stressLevel,
        energyLevel,
        notes: moodNotes.trim() || undefined,
      },
      fetalMovement: {
        feltToday: feltKicksToday,
        movementPattern: kickPattern,
        kickCountPeriodMinutes: 30,
        kickCount: kickCount ? parseInt(kickCount, 10) : undefined,
      },
      createdAt: initialLog?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(log);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pregnancy & Daily Wellness Log
              </h2>
              <p className="text-xs text-slate-500">
                Record nutrition, hydration, sleep, physical activity, mood, and fetal kick patterns.
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Date Picker */}
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Log Date:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold"
            />
          </div>

          {/* 1. Nutrition */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-600" />
              1. Nutrition & Meals:
            </span>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meals & Food Groups Summary:
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Oatmeal with fruit for breakfast, spinach salad with paneer for lunch, vegetable dal for dinner."
                value={mealsSummary}
                onChange={(e) => setMealsSummary(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Fruits & Veg Servings:
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  value={fruitsVegServings}
                  onChange={(e) => setFruitsVegServings(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Nausea Severity:
                </label>
                <select
                  value={nauseaSeverity}
                  onChange={(e) => setNauseaSeverity(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="none">None</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Appetite:
                </label>
                <select
                  value={appetiteChange}
                  onChange={(e) => setAppetiteChange(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="increased">Increased</option>
                  <option value="decreased">Decreased</option>
                  <option value="food_aversions">Food Aversions</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Hydration */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-600" />
              2. Hydration:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Fluid Intake (Liters):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={fluidLiters}
                  onChange={(e) => setFluidLiters(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Glasses / Bottles:
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={glassesCount}
                  onChange={(e) => setGlassesCount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={difficultyDrinking}
                    onChange={(e) => setDifficultyDrinking(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span>Difficulty drinking</span>
                </label>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Fluid needs vary with climate, trimester, and physician advice. Individual pacing is encouraged.
            </p>
          </div>

          {/* 3. Sleep */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-600" />
              3. Sleep & Rest:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Bedtime:</label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Wake Time:</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Duration (Hours):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="18"
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Quality:</label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Restful">Restful</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                  <option value="Restless">Restless</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Physical Activity */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              4. Physical Activity:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-500 mb-0.5">Activity Type:</label>
                <input
                  type="text"
                  placeholder="e.g. Walking, gentle prenatal yoga, swimming"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Duration (Min):</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5. Mood & Emotional Well-being */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-amber-600" />
              5. Mood & Well-being:
            </span>
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Mood:</label>
                <select
                  value={moodStatus}
                  onChange={(e) => setMoodStatus(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Happy">Happy</option>
                  <option value="Calm">Calm</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Overwhelmed">Overwhelmed</option>
                  <option value="Sad">Sad</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Stress:</label>
                <select
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Energy:</label>
                <select
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                >
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                  <option value="Exhausted">Exhausted</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. Fetal Kick Counts (Optional / Mid-Late Pregnancy) */}
          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-3">
            <span className="font-bold text-xs text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-rose-600" />
              6. Fetal Movement & Kick Counting:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feltKicksToday}
                  onChange={(e) => setFeltKicksToday(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span className="font-semibold text-rose-900">
                  Fetal movements felt today
                </span>
              </label>
              <div>
                <select
                  value={kickPattern}
                  onChange={(e) => setKickPattern(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded-xl text-xs"
                >
                  <option value="active_normal">Active & Normal pattern</option>
                  <option value="reduced_noticeably">⚠️ Noticeably reduced movement</option>
                  <option value="not_yet_applicable">Too early to feel kicks (&lt; 18-20w)</option>
                </select>
              </div>
            </div>

            {kickPattern === 'reduced_noticeably' && (
              <div className="p-3 bg-rose-100/90 border border-rose-300 rounded-xl text-xs text-rose-900 font-semibold flex items-start gap-2">
                <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Important Obstetric Notice:</strong> If you are past 24–28 weeks and notice a marked decrease or absence of your baby's regular movement, do not wait. Contact your maternity triage unit or doctor immediately for fetal heart monitoring.
                </div>
              </div>
            )}
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
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Wellness Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
