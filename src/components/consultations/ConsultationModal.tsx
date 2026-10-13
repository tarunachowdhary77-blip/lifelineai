import React, { useState, useEffect } from 'react';
import { X, Stethoscope, AlertCircle, Trash2, Plus } from 'lucide-react';
import { ConsultationEntry } from '../../types';
import { saveConsultation, deleteConsultation, getDocuments } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  consultationToEdit?: ConsultationEntry | null;
  patientId: string;
  onSaved: () => void;
}

export const ConsultationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  consultationToEdit,
  patientId,
  onSaved,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicOrHospital, setClinicOrHospital] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorSpecialty, setDoctorSpecialty] = useState('');
  const [reasonForConsultation, setReasonForConsultation] = useState('');
  const [symptomsReported, setSymptomsReported] = useState('');
  const [examinationNotes, setExaminationNotes] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testsOrdered, setTestsOrdered] = useState<string[]>([]);
  const [treatmentPrescribed, setTreatmentPrescribed] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [patientResponse, setPatientResponse] = useState('');
  const [notesOrigin, setNotesOrigin] = useState<
    'patient_recollection' | 'clinical_discharge_summary' | 'prescription_copy'
  >('patient_recollection');
  const [verifiedByClinician, setVerifiedByClinician] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (consultationToEdit) {
        setDate(consultationToEdit.date);
        setClinicOrHospital(consultationToEdit.clinicOrHospital);
        setDoctorName(consultationToEdit.doctorName);
        setDoctorSpecialty(consultationToEdit.doctorSpecialty);
        setReasonForConsultation(consultationToEdit.reasonForConsultation);
        setSymptomsReported(consultationToEdit.symptomsReported);
        setExaminationNotes(consultationToEdit.examinationNotes);
        setTestsOrdered(consultationToEdit.testsOrdered || []);
        setTreatmentPrescribed(consultationToEdit.treatmentPrescribed);
        setFollowUpDate(consultationToEdit.followUpDate || '');
        setPatientResponse(consultationToEdit.patientResponse);
        setNotesOrigin(consultationToEdit.notesOrigin || 'patient_recollection');
        setVerifiedByClinician(consultationToEdit.verifiedByClinician || false);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setClinicOrHospital('');
        setDoctorName('');
        setDoctorSpecialty('');
        setReasonForConsultation('');
        setSymptomsReported('');
        setExaminationNotes('');
        setTestsOrdered([]);
        setTreatmentPrescribed('');
        setFollowUpDate('');
        setPatientResponse('');
        setNotesOrigin('patient_recollection');
        setVerifiedByClinician(false);
      }
    }
  }, [isOpen, consultationToEdit]);

  if (!isOpen) return null;

  const handleAddTest = () => {
    if (testInput.trim() && !testsOrdered.includes(testInput.trim())) {
      setTestsOrdered([...testsOrdered, testInput.trim()]);
      setTestInput('');
    }
  };

  const handleRemoveTest = (t: string) => {
    setTestsOrdered(testsOrdered.filter((item) => item !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entry: ConsultationEntry = {
      id: consultationToEdit?.id || `con-${Date.now()}`,
      patientId,
      date,
      clinicOrHospital: clinicOrHospital.trim(),
      doctorName: doctorName.trim(),
      doctorSpecialty: doctorSpecialty.trim() || 'General Medicine',
      reasonForConsultation: reasonForConsultation.trim(),
      symptomsReported: symptomsReported.trim(),
      examinationNotes: examinationNotes.trim(),
      testsOrdered,
      treatmentPrescribed: treatmentPrescribed.trim(),
      followUpDate: followUpDate.trim() || undefined,
      patientResponse: patientResponse.trim(),
      verifiedByClinician,
      notesOrigin,
      createdAt: consultationToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveConsultation(entry);
    onSaved();
    onClose();
  };

  const handleDelete = () => {
    if (consultationToEdit && confirm('Are you sure you want to delete this consultation record?')) {
      deleteConsultation(consultationToEdit.id);
      onSaved();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {consultationToEdit ? 'Edit Medical Consultation' : 'Add Doctor Consultation'}
              </h2>
              <p className="text-xs text-slate-500">
                Connect clinic visits, diagnoses, prescribed treatments, and follow-up responses.
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
          {/* Clinic & Doctor Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital or Clinic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Urgent Care, Lakeside ENT Clinic"
                value={clinicOrHospital}
                onChange={(e) => setClinicOrHospital(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ronald Chen, Dr. Angela Davies"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                placeholder="e.g. General Practice, Otolaryngology (ENT), Cardiology"
                value={doctorSpecialty}
                onChange={(e) => setDoctorSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Reason & Reported Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Consultation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acute severe right ear stabbing pain and muffled hearing after swimming"
              value={reasonForConsultation}
              onChange={(e) => setReasonForConsultation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Symptoms Reported to the Doctor
            </label>
            <textarea
              rows={2}
              placeholder="What symptoms you described to the doctor during the visit..."
              value={symptomsReported}
              onChange={(e) => setSymptomsReported(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Examination Findings */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Examination Notes / Doctor's Assessment
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Bulging erythematous right tympanic membrane; no perforation initially noted on pneumatic otoscopy."
              value={examinationNotes}
              onChange={(e) => setExaminationNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tests Ordered */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tests Ordered / Performed
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Otoscopy, Ear swab culture, Audiogram"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTest();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddTest}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
              >
                Add Test
              </button>
            </div>
            {testsOrdered.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {testsOrdered.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 rounded-full text-xs font-medium border border-teal-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTest(t)}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Treatment Prescribed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Treatment Documented / Prescribed <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin 500mg 3x/day for 7 days + Ibuprofen 400mg PRN"
              value={treatmentPrescribed}
              onChange={(e) => setTreatmentPrescribed(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Patient-Observed Response after Treatment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient-Observed Response After Treatment <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Pain initially decreased to 2/10 by day 5, but relapsed severely to 8/10 with ear discharge after air travel to Chicago."
              value={patientResponse}
              onChange={(e) => setPatientResponse(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Critical for your next consultation: Doctors need to understand how prior therapies affected you.
            </p>
          </div>

          {/* Follow-up Date & Notes Origin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Follow-up Date (If Advised)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Record Origin
              </label>
              <select
                value={notesOrigin}
                onChange={(e) => setNotesOrigin(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="patient_recollection">Patient Recollection</option>
                <option value="clinical_discharge_summary">Copied from Discharge Summary</option>
                <option value="prescription_copy">Copied from Prescription Slip</option>
              </select>
            </div>
          </div>

          {/* Distinction Note */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Lifeline AI clearly distinguishes patient-entered recollections from clinician-verified records to maintain clinical transparency.
            </span>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {consultationToEdit ? (
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
                className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                {consultationToEdit ? 'Save Changes' : 'Save Consultation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
