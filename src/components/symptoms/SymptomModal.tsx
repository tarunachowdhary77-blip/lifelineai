import React, { useState, useEffect } from 'react';
import { X, Activity, AlertCircle, Trash2 } from 'lucide-react';
import { SymptomEntry, SymptomStatus } from '../../types';
import { saveSymptom, deleteSymptom } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symptomToEdit?: SymptomEntry | null;
  patientId: string;
  onSaved: (savedSymptom?: SymptomEntry) => void;
}

export const SymptomModal: React.FC<Props> = ({
  isOpen,
  onClose,
  symptomToEdit,
  patientId,
  onSaved,
}) => {
  const [name, setName] = useState<string>('');
  const [bodyLocation, setBodyLocation] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [duration, setDuration] = useState<string>('');
  const [severity, setSeverity] = useState<number>(5);
  const [status, setStatus] = useState<SymptomStatus>('worsening');
  const [associatedInput, setAssociatedInput] = useState<string>('');
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [triggersOrContext, setTriggersOrContext] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (symptomToEdit) {
        setName(symptomToEdit.name);
        setBodyLocation(symptomToEdit.bodyLocation);
        setDate(symptomToEdit.date);
        setTime(symptomToEdit.time);
        setDuration(symptomToEdit.duration);
        setSeverity(symptomToEdit.severity);
        setStatus(symptomToEdit.status);
        setAssociatedSymptoms(symptomToEdit.associatedSymptoms || []);
        setNotes(symptomToEdit.notes || '');
        setTriggersOrContext(symptomToEdit.triggersOrContext || '');
      } else {
        setName('');
        setBodyLocation('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
        setDuration('');
        setSeverity(5);
        setStatus('worsening');
        setAssociatedSymptoms([]);
        setNotes('');
        setTriggersOrContext('');
      }
    }
  }, [isOpen, symptomToEdit]);

  if (!isOpen) return null;

  const handleAddAssociated = () => {
    if (associatedInput.trim() && !associatedSymptoms.includes(associatedInput.trim())) {
      setAssociatedSymptoms([...associatedSymptoms, associatedInput.trim()]);
      setAssociatedInput('');
    }
  };

  const handleRemoveAssociated = (sym: string) => {
    setAssociatedSymptoms(associatedSymptoms.filter((s) => s !== sym));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isEmergencyAlertTriggered =
      severity >= 8 ||
      name.toLowerCase().includes('chest pain') ||
      name.toLowerCase().includes('shortness of breath') ||
      name.toLowerCase().includes('stroke') ||
      name.toLowerCase().includes('numbness');

    const entry: SymptomEntry = {
      id: symptomToEdit?.id || `sym-${Date.now()}`,
      patientId,
      name: name.trim(),
      bodyLocation: bodyLocation.trim() || 'General / Unspecified',
      date,
      time,
      duration: duration.trim() || 'Ongoing',
      severity,
      associatedSymptoms,
      status,
      notes: notes.trim(),
      triggersOrContext: triggersOrContext.trim() || undefined,
      isEmergencyAlertTriggered,
      source: 'patient_reported',
      createdAt: symptomToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSymptom(entry);
    onSaved(entry);
    onClose();
  };

  const handleDelete = () => {
    if (symptomToEdit && confirm('Are you sure you want to delete this symptom record?')) {
      deleteSymptom(symptomToEdit.id);
      onSaved();
      onClose();
    }
  };

  // Severity color indicator
  const getSeverityColor = (val: number) => {
    if (val <= 3) return 'bg-emerald-500 text-white';
    if (val <= 6) return 'bg-amber-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {symptomToEdit ? 'Edit Symptom Record' : 'Record a Symptom'}
              </h2>
              <p className="text-xs text-slate-500">
                Chronological symptom tracking helps doctors identify patterns over time.
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-sm">
          {/* Symptom Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Symptom Name or Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sharp Right Ear Stabbing Pain, Migraine, Joint Swelling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Body Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Body Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Right ear canal and temporal region, Lower abdomen, Left knee"
              value={bodyLocation}
              onChange={(e) => setBodyLocation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date Noticed / Started <span className="text-red-500">*</span>
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
                Time (Approximate)
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration or Frequency
            </label>
            <input
              type="text"
              placeholder="e.g. Constant for 3 days, Episodic (lasts 20 mins after eating), Continuous"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Severity Slider (1-10) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Severity Score (1 to 10)
              </label>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${getSeverityColor(
                  severity
                )}`}
              >
                {severity} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>1 - Mild discomfort</span>
              <span>5 - Moderate</span>
              <span>10 - Worst imaginable pain</span>
            </div>
          </div>

          {/* Trajectory Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Current Trajectory / Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'worsening', label: 'Worsening', color: 'border-red-300 text-red-700' },
                  { id: 'improving', label: 'Improving', color: 'border-emerald-300 text-emerald-700' },
                  { id: 'recurring', label: 'Recurring', color: 'border-amber-300 text-amber-700' },
                  { id: 'resolved', label: 'Resolved', color: 'border-blue-300 text-blue-700' },
                ] as const
              ).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setStatus(item.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                    status === item.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : `bg-white hover:bg-slate-50 ${item.color}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Associated Symptoms Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Associated Symptoms (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Muffled hearing, Yellow fluid discharge, Dizziness"
                value={associatedInput}
                onChange={(e) => setAssociatedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAssociated();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddAssociated}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Add
              </button>
            </div>
            {associatedSymptoms.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {associatedSymptoms.map((sym) => (
                  <span
                    key={sym}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium"
                  >
                    {sym}
                    <button
                      type="button"
                      onClick={() => handleRemoveAssociated(sym)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Context / Triggers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Triggers, Events, or Treatments Associated with the Symptom
            </label>
            <input
              type="text"
              placeholder="e.g. Began after swimming; Recurred after flight to Chicago; Improved after 5 days of Amoxicillin"
              value={triggersOrContext}
              onChange={(e) => setTriggersOrContext(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Observations & Additional Notes
            </label>
            <textarea
              rows={2}
              placeholder="Detailed notes on what the pain feels like, when it worsens, sleeping position..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Clinical Non-Diagnosis Banner */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              This is a patient-reported log for communication preparation. Lifeline AI does not diagnose medical conditions.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {symptomToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
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
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {symptomToEdit ? 'Save Changes' : 'Record Symptom'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
