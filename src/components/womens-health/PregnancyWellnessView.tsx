import React from 'react';
import {
  Heart,
  Plus,
  Utensils,
  Droplets,
  Moon,
  Activity,
  Smile,
  Baby,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { PregnancyWellnessLog, PatientProfile } from '../../types';

interface Props {
  patient: PatientProfile;
  wellnessLogs: PregnancyWellnessLog[];
  onOpenLogModal: (log?: PregnancyWellnessLog | null) => void;
}

export const PregnancyWellnessView: React.FC<Props> = ({
  patient,
  wellnessLogs,
  onOpenLogModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
            <Heart className="w-3.5 h-3.5 text-teal-200" />
            <span>Maternal Wellness & Daily Lifestyle</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Nutrition, Hydration & Daily Check-in
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Record balanced meals, fluid intake, side-sleeping hours, gentle physical activity, emotional well-being, and fetal movements.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={() => onOpenLogModal(null)}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-teal-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span>Log Daily Wellness</span>
          </button>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Wellness Records List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Wellness Logs ({wellnessLogs.length})
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of daily nutrition, fluids, sleep, and movements.
            </p>
          </div>

          <button
            onClick={() => onOpenLogModal(null)}
            className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Log</span>
          </button>
        </div>

        {wellnessLogs.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <Heart className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No wellness check-ins recorded yet.</p>
            <button
              onClick={() => onOpenLogModal(null)}
              className="text-xs font-bold text-teal-600 underline"
            >
              Log your first check-in
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wellnessLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => onOpenLogModal(log)}
                className="p-5 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span className="font-extrabold text-sm text-slate-900">
                      {log.date}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      Mood: {log.mood?.moodStatus || 'Normal'}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 group-hover:text-teal-600 inline-flex items-center gap-1">
                    <span>Edit Log</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Nutrition */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Nutrition
                    </span>
                    <span className="font-semibold text-slate-800 block truncate">
                      {log.nutrition?.fruitsAndVegetablesServings
                        ? `${log.nutrition.fruitsAndVegetablesServings} veg/fruit servings`
                        : 'Recorded'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Nausea: {log.nutrition?.nauseaSeverity || 'None'}
                    </span>
                  </div>

                  {/* Hydration */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Hydration
                    </span>
                    <span className="font-semibold text-slate-800 block">
                      {log.hydration?.approxLiters ? `${log.hydration.approxLiters} Liters` : 'Logged'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {log.hydration?.glassesCount ? `${log.hydration.glassesCount} glasses` : ''}
                    </span>
                  </div>

                  {/* Sleep */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Sleep
                    </span>
                    <span className="font-semibold text-slate-800 block">
                      {log.sleep?.estimatedDurationHours ? `${log.sleep.estimatedDurationHours} Hours` : 'Logged'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Quality: {log.sleep?.quality || 'Average'}
                    </span>
                  </div>

                  {/* Fetal Kicks */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Fetal Movements
                    </span>
                    <span className="font-semibold text-rose-700 block">
                      {log.fetalMovement?.feltToday
                        ? log.fetalMovement.kickCount
                          ? `${log.fetalMovement.kickCount} kicks in 30m`
                          : 'Active kicks felt'
                        : 'Not felt'}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {log.fetalMovement?.movementPattern?.replace('_', ' ') || 'Normal'}
                    </span>
                  </div>
                </div>

                {log.nutrition?.mealsSummary && (
                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{log.nutrition.mealsSummary}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          General evidence-based wellness guidelines. Ordinary food entries do not indicate nutritional deficiencies. Consult your physician for individualized dietary and supplement requirements.
        </p>
      </div>
    </div>
  );
};
