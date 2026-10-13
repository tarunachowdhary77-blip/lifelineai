import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { MedicationEntry, PatientProfile } from '../../types';
import { deleteMedication } from '../../lib/storage';

interface Props {
  medications: MedicationEntry[];
  patient: PatientProfile;
  onAddMedication: () => void;
  onEditMedication: (med: MedicationEntry) => void;
  onLogAdherence: (med: MedicationEntry) => void;
  onRefresh: () => void;
}

export const MedicationTrackerView: React.FC<Props> = ({
  medications,
  patient,
  onAddMedication,
  onEditMedication,
  onLogAdherence,
  onRefresh,
}) => {
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = medications.filter((m) => {
    if (filterActive === 'active') return m.active;
    if (filterActive === 'inactive') return !m.active;
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete medication record for "${name}"?`)) {
      deleteMedication(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Medication Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {medications.length} Prescriptions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Log prescribed schedules, track daily adherence, and record observed treatment responses.
          </p>
        </div>

        <button
          onClick={onAddMedication}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Medication
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <strong>Important Medical Safety Policy:</strong>
          <p>
            Lifeline AI does not recommend starting, stopping, or altering medication doses. Never infer an unknown dose, and never treat a missed dose as permission to take double the next dose. Always consult your prescribing clinician or pharmacist when you have questions about your prescriptions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterActive('all')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterActive === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({medications.length})
        </button>
        <button
          onClick={() => setFilterActive('active')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterActive === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active Now ({medications.filter((m) => m.active).length})
        </button>
        <button
          onClick={() => setFilterActive('inactive')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
            filterActive === 'inactive'
              ? 'bg-slate-600 text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Past / Completed ({medications.filter((m) => !m.active).length})
        </button>
      </div>

      {/* Medications List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Pill className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No medication records</h3>
          <p className="text-sm text-slate-500">Add medications from your prescriptions to begin tracking adherence.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((med) => {
            const takenCount = med.adherenceHistory?.filter((a) => a.status === 'taken').length || 0;
            const missedCount = med.adherenceHistory?.filter((a) => a.status === 'missed').length || 0;

            return (
              <div
                key={med.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{med.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            med.active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {med.active ? 'Active' : 'Completed / Discontinued'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-0.5">
                        Dose: {med.dose} {med.units} • {med.schedule}
                      </p>
                    </div>

                    <button
                      onClick={() => onLogAdherence(med)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 transition-colors shrink-0"
                    >
                      Log Dose
                    </button>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="font-medium text-slate-800">{med.startDate}</span>
                    </div>
                    {med.endDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">End Date:</span>
                        <span className="font-medium text-slate-800">{med.endDate}</span>
                      </div>
                    )}
                    {med.prescribingClinician && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Prescriber:</span>
                        <span className="font-medium text-slate-800">{med.prescribingClinician}</span>
                      </div>
                    )}
                    {med.indication && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Indication:</span>
                        <span className="font-medium text-slate-800">{med.indication}</span>
                      </div>
                    )}
                  </div>

                  {med.instructions && (
                    <p className="text-[11px] text-slate-600 italic">
                      <strong>Instructions: </strong>
                      {med.instructions}
                    </p>
                  )}

                  {med.patientObservedResponse && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
                      <strong className="text-amber-900">Patient Response: </strong>
                      {med.patientObservedResponse}
                    </div>
                  )}

                  {/* Adherence summary badges */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-500 text-[11px] font-medium">Recorded Log:</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      <CheckCircle2 className="w-3 h-3" /> {takenCount} Taken
                    </span>
                    {missedCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        <XCircle className="w-3 h-3" /> {missedCount} Missed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 capitalize">Source: {med.source.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditMedication(med)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(med.id, med.name)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
