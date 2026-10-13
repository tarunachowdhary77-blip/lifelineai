import React, { useState, useEffect } from 'react';
import { X, Pill, ShieldAlert, Trash2 } from 'lucide-react';
import { MedicationEntry } from '../../types';
import { saveMedication, deleteMedication } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medicationToEdit?: MedicationEntry | null;
  patientId: string;
  onSaved: () => void;
}

export const MedicationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medicationToEdit,
  patientId,
  onSaved,
}) => {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [units, setUnits] = useState('mg');
  const [schedule, setSchedule] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [prescribingClinician, setPrescribingClinician] = useState('');
  const [indication, setIndication] = useState('');
  const [instructions, setInstructions] = useState('');
  const [active, setActive] = useState(true);
  const [patientObservedResponse, setPatientObservedResponse] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (medicationToEdit) {
        setName(medicationToEdit.name);
        setDose(medicationToEdit.dose);
        setUnits(medicationToEdit.units || 'mg');
        setSchedule(medicationToEdit.schedule);
        setStartDate(medicationToEdit.startDate);
        setEndDate(medicationToEdit.endDate || '');
        setPrescribingClinician(medicationToEdit.prescribingClinician || '');
        setIndication(medicationToEdit.indication || '');
        setInstructions(medicationToEdit.instructions || '');
        setActive(medicationToEdit.active);
        setPatientObservedResponse(medicationToEdit.patientObservedResponse || '');
      } else {
        setName('');
        setDose('');
        setUnits('mg');
        setSchedule('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setPrescribingClinician('');
        setIndication('');
        setInstructions('');
        setActive(true);
        setPatientObservedResponse('');
      }
    }
  }, [isOpen, medicationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: MedicationEntry = {
      id: medicationToEdit?.id || `med-${Date.now()}`,
      patientId,
      name: name.trim(),
      dose: dose.trim(),
      units: units.trim(),
      schedule: schedule.trim(),
      startDate,
      endDate: endDate.trim() || undefined,
      prescribingClinician: prescribingClinician.trim() || undefined,
      indication: indication.trim() || undefined,
      instructions: instructions.trim() || undefined,
      active,
      patientObservedResponse: patientObservedResponse.trim() || undefined,
      adherenceHistory: medicationToEdit?.adherenceHistory || [],
      source: medicationToEdit?.source || 'patient_entered',
      createdAt: medicationToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMedication(entry);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (medicationToEdit && confirm('Are you sure you want to delete this medication?')) {
      deleteMedication(medicationToEdit.id);
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {medicationToEdit ? 'Edit Prescribed Medication' : 'Add Medication'}
              </h2>
              <p className="text-xs text-slate-500">
                Track doses, prescriptions, and your recorded responses.
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

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-sm">
          {/* Important Medical Safety Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Medical Safety Rule:</strong> Never change or stop prescribed medication doses on your own. Never double a dose following a missed dose. Always consult your doctor or pharmacist with medication questions.
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medication Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin, Ciprofloxacin Otic Drops, Ibuprofen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Dose and Units */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dose <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 500, 4, 10"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Units <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. mg, drops, ml, mcg, puffs"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescribed Schedule / Frequency <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Three times daily with meals, 4 drops twice daily into right ear"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Prescribing Clinician & Indication */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescribing Clinician
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Ronald Chen, MD"
                value={prescribingClinician}
                onChange={(e) => setPrescribingClinician(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Indication / Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Acute Otitis Media, Ear Infection"
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescription Instructions / Warnings
            </label>
            <input
              type="text"
              placeholder="e.g. Complete full 7-day course. Take with food and water. Keep ear dry."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Patient Observed Response */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient-Observed Treatment Response
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Pain initially decreased, but symptoms recurred severely after flight. No adverse allergic rash observed."
              value={patientObservedResponse}
              onChange={(e) => setPatientObservedResponse(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="med-active-cb"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <label htmlFor="med-active-cb" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Currently Active (uncheck if completed, discontinued, or replaced)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {medicationToEdit ? (
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
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {medicationToEdit ? 'Save Changes' : 'Save Medication'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
