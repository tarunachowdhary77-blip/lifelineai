import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { SymptomEntry, PatientProfile } from '../../types';
import { deleteSymptom } from '../../lib/storage';

interface Props {
  symptoms: SymptomEntry[];
  patient: PatientProfile;
  onAddSymptom: () => void;
  onEditSymptom: (sym: SymptomEntry) => void;
  onRefresh: () => void;
}

export const SymptomTrackerView: React.FC<Props> = ({
  symptoms,
  patient,
  onAddSymptom,
  onEditSymptom,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = symptoms.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.bodyLocation.toLowerCase().includes(q) ||
        s.notes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete symptom "${name}"?`)) {
      deleteSymptom(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Symptom Tracker</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              {symptoms.length} Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Record symptom onset, location, severity (1-10), changes over time, and triggers.
          </p>
        </div>

        <button
          onClick={onAddSymptom}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Record a Symptom
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Reminder:</strong> Symptoms are recorded for preparation and communication with your doctor. Lifeline AI does not diagnose illnesses. For acute chest pain, sudden numbness, or shortness of breath, call emergency services immediately.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
          />
        </div>

        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
          >
            <option value="all">All Trajectories</option>
            <option value="worsening">Worsening</option>
            <option value="improving">Improving</option>
            <option value="recurring">Recurring</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Symptoms List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Activity className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No symptoms found</h3>
          <p className="text-sm text-slate-500">Record a symptom to track its trajectory over time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sym) => (
            <div
              key={sym.id}
              className={`p-5 bg-white rounded-2xl border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                sym.severity >= 8 || sym.status === 'recurring' || sym.status === 'worsening'
                  ? 'border-red-200 bg-red-50/15'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {sym.date} {sym.time && `• ${sym.time}`}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      {sym.name}
                    </h3>
                    <span className="text-xs text-teal-700 font-semibold">
                      Location: {sym.bodyLocation}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black shrink-0 ${
                      sym.severity >= 7
                        ? 'bg-red-600 text-white'
                        : sym.severity >= 4
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Pain: {sym.severity}/10
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      sym.status === 'worsening'
                        ? 'bg-red-100 text-red-800'
                        : sym.status === 'recurring'
                        ? 'bg-amber-100 text-amber-800'
                        : sym.status === 'improving'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    Trajectory: {sym.status}
                  </span>

                  {sym.duration && (
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Duration: {sym.duration}
                    </span>
                  )}
                </div>

                {sym.associatedSymptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {sym.associatedSymptoms.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        +{a}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {sym.notes}
                </p>

                {sym.triggersOrContext && (
                  <p className="text-[11px] text-amber-900">
                    <strong>Context / Triggers: </strong>
                    {sym.triggersOrContext}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">Source: Patient Reported</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditSymptom(sym)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sym.id, sym.name)}
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
