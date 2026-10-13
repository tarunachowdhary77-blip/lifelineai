import React from 'react';
import {
  HeartPulse,
  Plus,
  Smile,
  Moon,
  Droplets,
  Activity,
  Thermometer,
  Pill,
  Edit2,
  Trash2,
} from 'lucide-react';
import { DailyHealthEntry, PatientProfile } from '../../types';
import { deleteCheckin } from '../../lib/storage';

interface Props {
  checkins: DailyHealthEntry[];
  patient: PatientProfile;
  onAddCheckin: () => void;
  onEditCheckin: (entry: DailyHealthEntry) => void;
  onRefresh: () => void;
}

export const DailyCheckinView: React.FC<Props> = ({
  checkins,
  patient,
  onAddCheckin,
  onEditCheckin,
  onRefresh,
}) => {
  const handleDelete = (id: string, date: string) => {
    if (confirm(`Delete daily health check-in for ${date}?`)) {
      deleteCheckin(id);
      onRefresh();
    }
  };

  const getWellbeingBadge = (wb: string) => {
    switch (wb) {
      case 'Great':
        return 'bg-emerald-100 text-emerald-800';
      case 'Good':
        return 'bg-teal-100 text-teal-800';
      case 'Fair':
        return 'bg-amber-100 text-amber-800';
      case 'Poor':
      case 'Very Poor':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Daily Health Check-ins
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {checkins.length} Entries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Log your daily energy, sleep, discomfort, vital signs, and medication status between doctor visits.
          </p>
        </div>

        <button
          onClick={onAddCheckin}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Daily Health Entry
        </button>
      </div>

      {/* Checkins List */}
      {checkins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <HeartPulse className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No daily check-ins recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Log how you are feeling each day to maintain a continuous record of your health journey.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {checkins.map((chk) => (
            <div
              key={chk.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {chk.date}
                    </span>
                    {chk.time && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {chk.time}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${getWellbeingBadge(
                      chk.wellbeing
                    )}`}
                  >
                    Wellbeing: {chk.wellbeing}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block text-[11px]">Energy Level:</span>
                    <span className="font-semibold text-slate-800">{chk.energy}</span>
                  </div>
                  {chk.lifestyle?.sleepHours !== undefined && (
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 block text-[11px]">Sleep:</span>
                      <span className="font-semibold text-slate-800">
                        {chk.lifestyle.sleepHours} hrs {chk.lifestyle.sleepQuality ? `(${chk.lifestyle.sleepQuality})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {chk.discomfort && (
                  <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-950">
                    <strong className="text-rose-900">Discomfort: </strong>
                    {chk.discomfort}
                  </div>
                )}

                {/* Vitals Summary */}
                {chk.measurements && Object.keys(chk.measurements).length > 0 && (
                  <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-xs space-y-1">
                    <strong className="text-teal-900 text-[11px] uppercase tracking-wider block">
                      Vitals Recorded:
                    </strong>
                    <div className="flex flex-wrap gap-2 text-[11px] text-teal-950">
                      {chk.measurements.bloodPressureSystolic && (
                        <span>
                          BP: {chk.measurements.bloodPressureSystolic}/{chk.measurements.bloodPressureDiastolic} mmHg
                        </span>
                      )}
                      {chk.measurements.pulse && <span>Pulse: {chk.measurements.pulse} bpm</span>}
                      {chk.measurements.temperature && <span>Temp: {chk.measurements.temperature}°C</span>}
                      {chk.measurements.weight && <span>Weight: {chk.measurements.weight} kg</span>}
                    </div>
                  </div>
                )}

                {/* Medication Adherence Check */}
                {chk.medicationAdherence && chk.medicationAdherence.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Meds Status:</span>
                    <div className="flex flex-wrap gap-1">
                      {chk.medicationAdherence.map((med, i) => (
                        <span
                          key={i}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            med.status === 'taken'
                              ? 'bg-teal-50 text-teal-800'
                              : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {med.medicationName}: {med.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {chk.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic">
                    "{chk.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Patient Recorded Log</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCheckin(chk)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(chk.id, chk.date)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
