import React from 'react';
import {
  Stethoscope,
  Plus,
  Calendar,
  Building,
  User,
  Activity,
  Pill,
  CheckCircle2,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ConsultationEntry, PatientProfile } from '../../types';
import { deleteConsultation } from '../../lib/storage';

interface Props {
  consultations: ConsultationEntry[];
  patient: PatientProfile;
  onAddConsultation: () => void;
  onEditConsultation: (c: ConsultationEntry) => void;
  onRefresh: () => void;
}

export const ConsultationView: React.FC<Props> = ({
  consultations,
  patient,
  onAddConsultation,
  onEditConsultation,
  onRefresh,
}) => {
  const handleDelete = (id: string, doc: string) => {
    if (confirm(`Delete consultation record with ${doc}?`)) {
      deleteConsultation(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Doctor Consultations & Care History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              {consultations.length} Consultations
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Log clinic visits, medical opinions, examinations, tests ordered, and your observed responses after treatment.
          </p>
        </div>

        <button
          onClick={onAddConsultation}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Doctor Consultation
        </button>
      </div>

      {/* Note about clinician distinction */}
      <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Clinical Distinction:</strong> Notes recorded by the patient are labelled as patient recollection to clearly distinguish them from official hospital discharge sheets or clinician-verified records.
        </p>
      </div>

      {/* Consultations List */}
      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No consultations recorded</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Record previous urgent care or specialist visits to build a continuous medical story.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((con, index) => (
            <div
              key={con.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                    #{consultations.length - index}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {con.doctorName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {con.doctorSpecialty} • {con.clinicOrHospital}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {con.date}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {con.notesOrigin.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                      Reason for Consultation:
                    </span>
                    <p className="text-slate-900 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {con.reasonForConsultation}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                      Symptoms Reported:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {con.symptomsReported}
                    </p>
                  </div>

                  {con.examinationNotes && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                        Clinical Examination Findings:
                      </span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {con.examinationNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {con.testsOrdered && con.testsOrdered.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-1">
                        Tests Ordered / Performed:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {con.testsOrdered.map((t) => (
                          <span
                            key={t}
                            className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wider mb-0.5">
                      Treatment Prescribed:
                    </span>
                    <p className="text-slate-900 font-semibold bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-blue-950">
                      {con.treatmentPrescribed}
                    </p>
                  </div>

                  {/* Patient Observed Treatment Response */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl">
                    <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider mb-0.5">
                      Patient-Observed Response After Treatment:
                    </span>
                    <p className="text-amber-900 font-medium leading-relaxed">
                      {con.patientResponse}
                    </p>
                  </div>

                  {con.followUpDate && (
                    <div className="text-[11px] text-slate-600">
                      <strong>Scheduled Follow-Up: </strong> {con.followUpDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  {con.verifiedByClinician ? 'Clinician Verified' : 'Patient-Reported Encounter'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditConsultation(con)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(con.id, con.doctorName)}
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
