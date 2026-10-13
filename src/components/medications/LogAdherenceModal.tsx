import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MedicationEntry, AdherenceStatus } from '../../types';
import { addMedicationAdherence } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicationEntry | null;
  onSaved: () => void;
}

export const LogAdherenceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medication,
  onSaved,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );
  const [status, setStatus] = useState<AdherenceStatus>('taken');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !medication) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMedicationAdherence(medication.id, {
      date,
      time,
      status,
      reason: status === 'missed' ? reason.trim() : undefined,
      notes: notes.trim() || undefined,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Record Medication Dose Status</h3>
            <p className="text-xs text-slate-500 font-medium">{medication.name} ({medication.dose} {medication.units})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Dose Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('taken')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'taken'
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Taken
              </button>
              <button
                type="button"
                onClick={() => setStatus('missed')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'missed'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Missed
              </button>
              <button
                type="button"
                onClick={() => setStatus('not_recorded')}
                className={`py-2 px-1 text-xs font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  status === 'not_recorded'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                Unsure
              </button>
            </div>
          </div>

          {status === 'missed' && (
            <div>
              <label className="block text-xs font-semibold text-red-700 mb-1">
                Reason for Missed Dose (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Forgot during flight, stomach upset, ran out of pills"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-xs focus:ring-2 focus:ring-red-400"
              />
              <p className="text-[11px] text-red-600 mt-1 font-medium">
                Note: Do not take double doses to make up for a missed dose.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes or Observed Effects
            </label>
            <input
              type="text"
              placeholder="e.g. Mild nausea after taking with water, ear felt warmer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl"
            >
              Record Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
