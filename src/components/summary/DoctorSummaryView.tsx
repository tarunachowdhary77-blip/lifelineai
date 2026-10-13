import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Printer,
  Copy,
  Check,
  Edit3,
  Calendar,
  AlertCircle,
  FileCheck2,
  Stethoscope,
  Pill,
  Activity,
  HeartPulse,
  HelpCircle,
  ShieldCheck,
  Download,
  RefreshCw,
} from 'lucide-react';
import { PatientProfile, TimelineEvent, DoctorSummaryDraft } from '../../types';
import { saveSummary, getSummaries } from '../../lib/storage';

interface Props {
  patient: PatientProfile;
  timelineEvents: TimelineEvent[];
}

export const DoctorSummaryView: React.FC<Props> = ({ patient, timelineEvents }) => {
  const [startDate, setStartDate] = useState<string>('2025-10-01');
  const [endDate, setEndDate] = useState<string>('2025-10-31');
  const [chiefComplaint, setChiefComplaint] = useState<string>(
    'Recurrent severe right ear pain and discharge after air travel and oral amoxicillin course'
  );
  const [additionalNotes, setAdditionalNotes] = useState<string>(
    'Patient preparing for follow-up ENT consultation regarding ear drum perforation healing and culture results.'
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSummary, setCurrentSummary] = useState<DoctorSummaryDraft | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [patientReviewed, setPatientReviewed] = useState<boolean>(false);
  const [patientReviewNotes, setPatientReviewNotes] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Editable sections
  const [editableSections, setEditableSections] = useState<any>({});

  // Load existing summary if available
  useEffect(() => {
    const existing = getSummaries(patient.id);
    if (existing.length > 0) {
      setCurrentSummary(existing[0]);
      setEditableSections(existing[0].sections);
      setPatientReviewed(existing[0].patientReviewed);
      setPatientReviewNotes(existing[0].patientNotes || '');
    }
  }, [patient.id]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Filter events within selected date range
      const selectedEvents = timelineEvents.filter((e) => {
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        return true;
      });

      const res = await fetch('/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          timelineEvents: selectedEvents,
          dateRange: { from: startDate, to: endDate },
          chiefComplaint,
          additionalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate summary');
      }

      const draft: DoctorSummaryDraft = {
        id: `sum-${Date.now()}`,
        patientId: patient.id,
        dateGenerated: new Date().toISOString(),
        dateRange: { from: startDate, to: endDate },
        chiefComplaint,
        isAIGenerated: data.isAIGenerated,
        modelUsed: data.modelUsed,
        disclaimer: data.disclaimer,
        sections: data.sections,
        patientReviewed: false,
        patientNotes: '',
        createdAt: new Date().toISOString(),
      };

      saveSummary(draft);
      setCurrentSummary(draft);
      setEditableSections(draft.sections);
      setPatientReviewed(false);
      setIsEditMode(false);
    } catch (err: any) {
      console.error('Error generating summary:', err);
      alert('Error generating summary: ' + (err.message || 'Please check network and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdits = () => {
    if (!currentSummary) return;
    const updated: DoctorSummaryDraft = {
      ...currentSummary,
      sections: editableSections,
      patientReviewed,
      patientNotes: patientReviewNotes,
    };
    saveSummary(updated);
    setCurrentSummary(updated);
    setIsEditMode(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (!currentSummary) return;
    const s = currentSummary.sections;
    const text = `PRE-CONSULTATION SUMMARY DRAFT (LIFELINE AI)
Patient: ${patient.name} | DOB: ${patient.dateOfBirth} | Sex: ${patient.sex}
Chief Complaint: ${currentSummary.chiefComplaint}
Date Range: ${currentSummary.dateRange.from} to ${currentSummary.dateRange.to}
Synthesis Engine: ${currentSummary.modelUsed} (${currentSummary.isAIGenerated ? 'AI-Assisted' : 'Deterministic Synthesizer'})

1. PATIENT BACKGROUND:
${s.patientBackground}

2. KNOWN ALLERGIES & CLINICAL RISKS:
${s.allergiesAndRisks}

3. ACTIVE MEDICATIONS:
${s.currentMedications}

4. CHRONOLOGICAL MEDICAL JOURNEY:
${s.chronologicalCourse}

5. SYMPTOM TRAJECTORY & EVOLUTION:
${s.symptomsEvolution}

6. TREATMENT HISTORY & PATIENT-REPORTED RESPONSES:
${s.treatmentHistoryAndResponses}

7. MEASUREMENTS & LAB HIGHLIGHTS:
${s.measurementsAndLabHighlights}

8. MEDICATION ADHERENCE SUMMARY:
${s.medicationAdherenceSummary}

9. GAPS & MISSING DETAILS TO CLARIFY:
${s.missingOrIncompleteInfo}

10. SUGGESTED QUESTIONS FOR THE PHYSICIAN:
${s.suggestedQuestionsForDoctor?.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}

Patient Reviewed: ${patientReviewed ? 'Yes - Verified by patient' : 'Draft pending review'}
Patient Notes: ${patientReviewNotes || 'None'}
`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Configuration & Generator Card (Hidden on Print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs no-print space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                AI-Assisted Pre-Consultation Summary
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Synthesize {patient.name}'s verified chronological records into a structured clinical handover draft for your doctor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {currentSummary ? 'Regenerate Summary' : 'Prepare My Doctor Summary'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Parameters Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Chief Complaint for Upcoming Visit
            </label>
            <input
              type="text"
              placeholder="e.g. Ear pain recurrence after flight"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Medical Integrity Rules Banner */}
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Clinical Safety Guarantee:</strong> Lifeline AI uses only your saved health records. It never fabricates diagnoses, dosages, or dates, cites exact chronological timestamps, and highlights patient-observed treatment responses to facilitate doctor-patient dialogue.
          </div>
        </div>
      </div>

      {/* Generated Clinical Document View */}
      {currentSummary ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-container">
          {/* Document Header & Action Bar */}
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Pre-Consultation Clinical Brief
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    currentSummary.isAIGenerated
                      ? 'bg-teal-900 text-teal-200 border border-teal-700'
                      : 'bg-amber-900 text-amber-200 border border-amber-700'
                  }`}
                >
                  {currentSummary.isAIGenerated ? 'AI-Synthesized (Gemini 3.8 Flash)' : 'Rule-Based Synthesizer'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                Health Summary for Medical Consultation
              </h2>
              <p className="text-xs text-slate-400">
                Generated: {new Date(currentSummary.dateGenerated).toLocaleDateString()} • Date Window: {currentSummary.dateRange.from} to {currentSummary.dateRange.to}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isEditMode
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditMode ? 'Done Editing' : 'Edit Sections'}
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
                title="Copy Full Text"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="p-6 sm:p-10 space-y-8 bg-white text-slate-900 text-sm">
            {/* Clinical Sheet Header */}
            <div className="border-b-2 border-slate-900 pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                    LIFELINE AI CLINICAL HANDOVER SUMMARY
                  </h1>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                    Patient-Prepared Health Chronology for Attending Physician
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600 font-mono">
                  <div>Date: {new Date(currentSummary.dateGenerated).toLocaleDateString()}</div>
                  <div>Record Window: {currentSummary.dateRange.from} — {currentSummary.dateRange.to}</div>
                </div>
              </div>

              {/* Patient Demographics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">DOB / Age:</span>
                  <span className="font-bold text-slate-900">
                    {patient.dateOfBirth || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sex / Blood:</span>
                  <span className="font-bold text-slate-900">
                    {patient.sex} {patient.bloodType ? `(${patient.bloodType})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Chief Visit Reason:</span>
                  <span className="font-bold text-teal-800">
                    {currentSummary.chiefComplaint}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer & Transparency Statement */}
            <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 border border-slate-200">
              <strong>Source Notice: </strong>
              {currentSummary.disclaimer}
            </div>

            {/* SECTION 1: Patient Background & Allergies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-slate-50/50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  1. Medical Background
                </h3>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={editableSections.patientBackground || ''}
                    onChange={(e) =>
                      setEditableSections({ ...editableSections, patientBackground: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {editableSections.patientBackground}
                  </p>
                )}
              </div>

              <div className="space-y-2 p-4 bg-rose-50/40 rounded-xl border border-rose-200/80">
                <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  2. Known Allergies & Clinical Alerts
                </h3>
                {isEditMode ? (
                  <textarea
                    rows={3}
                    value={editableSections.allergiesAndRisks || ''}
                    onChange={(e) =>
                      setEditableSections({ ...editableSections, allergiesAndRisks: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-xs text-rose-950 font-medium leading-relaxed whitespace-pre-wrap">
                    {editableSections.allergiesAndRisks}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: Active Medications & Adherence */}
            <div className="space-y-2 p-4 bg-blue-50/30 rounded-xl border border-blue-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-blue-600" />
                3. Current Medications & Adherence Tracking
              </h3>
              {isEditMode ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={editableSections.currentMedications || ''}
                    onChange={(e) =>
                      setEditableSections({ ...editableSections, currentMedications: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <textarea
                    rows={2}
                    value={editableSections.medicationAdherenceSummary || ''}
                    onChange={(e) =>
                      setEditableSections({ ...editableSections, medicationAdherenceSummary: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                  <p>{editableSections.currentMedications}</p>
                  <p className="text-slate-600 italic">{editableSections.medicationAdherenceSummary}</p>
                </div>
              )}
            </div>

            {/* SECTION 3: Chronological Course of Events */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                4. Chronological Course of Medical Events
              </h3>
              {isEditMode ? (
                <textarea
                  rows={4}
                  value={editableSections.chronologicalCourse || ''}
                  onChange={(e) =>
                    setEditableSections({ ...editableSections, chronologicalCourse: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {editableSections.chronologicalCourse}
                </div>
              )}
            </div>

            {/* SECTION 4: Symptom Trajectory & Treatment Responses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  5. Symptom Trajectory & Evolution
                </h4>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={editableSections.symptomsEvolution || ''}
                    onChange={(e) =>
                      setEditableSections({ ...editableSections, symptomsEvolution: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {editableSections.symptomsEvolution}
                  </p>
                )}
              </div>

              <div className="space-y-2 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                  6. Prior Treatments & Patient-Observed Response
                </h4>
                {isEditMode ? (
                  <textarea
                    rows={4}
                    value={editableSections.treatmentHistoryAndResponses || ''}
                    onChange={(e) =>
                      setEditableSections({
                        ...editableSections,
                        treatmentHistoryAndResponses: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-wrap">
                    {editableSections.treatmentHistoryAndResponses}
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 5: Measurements and Lab Highlights */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                7. Measurements, Vitals & Uploaded Document Highlights
              </h3>
              {isEditMode ? (
                <textarea
                  rows={2}
                  value={editableSections.measurementsAndLabHighlights || ''}
                  onChange={(e) =>
                    setEditableSections({
                      ...editableSections,
                      measurementsAndLabHighlights: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {editableSections.measurementsAndLabHighlights}
                </p>
              )}
            </div>

            {/* SECTION 6: Missing Info & Patient Clarifications */}
            <div className="space-y-2 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                8. Gaps or Missing Details to Clarify
              </h3>
              {isEditMode ? (
                <textarea
                  rows={2}
                  value={editableSections.missingOrIncompleteInfo || ''}
                  onChange={(e) =>
                    setEditableSections({ ...editableSections, missingOrIncompleteInfo: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {editableSections.missingOrIncompleteInfo}
                </p>
              )}
            </div>

            {/* SECTION 7: Questions to Ask the Doctor */}
            <div className="space-y-3 p-5 bg-teal-50/50 rounded-xl border border-teal-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                9. Prepared Questions for Your Doctor
              </h3>
              <ul className="list-decimal pl-5 space-y-1.5 text-xs text-teal-950 font-medium">
                {editableSections.suggestedQuestionsForDoctor?.map((q: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* SECTION 8: Patient Review & Sign-off Box */}
            <div className="border-t-2 border-slate-300 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="patient-review-cb"
                    checked={patientReviewed}
                    onChange={(e) => {
                      setPatientReviewed(e.target.checked);
                      if (currentSummary) {
                        saveSummary({ ...currentSummary, patientReviewed: e.target.checked });
                      }
                    }}
                    className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
                  />
                  <label
                    htmlFor="patient-review-cb"
                    className="text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    Patient Review & Approval: I have verified this summary matches my recollection.
                  </label>
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  Status: {patientReviewed ? 'Patient Confirmed' : 'Draft / Unsigned'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Patient Pre-Visit Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified with spouse: drainage started immediately after returning from flight."
                  value={patientReviewNotes}
                  onChange={(e) => setPatientReviewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {isEditMode && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Save All Edits
                  </button>
                </div>
              )}
            </div>

            {/* Document Footer */}
            <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
              Prepared with Lifeline AI • Confidential Health Record • For Attending Clinical Review Only
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Sparkles className="w-12 h-12 text-teal-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">
            No Doctor Summary Prepared Yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Click <strong>"Prepare My Doctor Summary"</strong> above to organize {patient.name}'s recorded symptoms, medications, prior consultations, and responses into a clean medical consultation brief.
          </p>
        </div>
      )}
    </div>
  );
};
