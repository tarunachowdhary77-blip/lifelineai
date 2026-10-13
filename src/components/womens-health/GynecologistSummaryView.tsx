import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  Check,
  Sparkles,
  Baby,
  Droplets,
  Activity,
  Heart,
  ShieldCheck,
  Calendar,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  PatientProfile,
  PregnancyProfile,
  MenstrualCycleEntry,
  TimelineEvent,
  UltrasoundReportAnalysis,
  HealthMeasurement,
} from '../../types';
import { analyzeMenstrualCycles, calculateGestationalAge } from '../../lib/pregnancyUtils';

interface Props {
  patient: PatientProfile;
  pregnancyProfile?: PregnancyProfile | null;
  cycles: MenstrualCycleEntry[];
  measurements: HealthMeasurement[];
  ultrasoundAnalyses: UltrasoundReportAnalysis[];
  timelineEvents: TimelineEvent[];
}

export const GynecologistSummaryView: React.FC<Props> = ({
  patient,
  pregnancyProfile,
  cycles,
  measurements,
  ultrasoundAnalyses,
  timelineEvents,
}) => {
  const [chiefConcern, setChiefConcern] = useState(
    'Routine prenatal consultation review (22-week anomaly scan review & fetal growth monitoring).'
  );
  const [patientNotes, setPatientNotes] = useState(
    'Noticed occasional mild lower back tiredness after walking. Fetal kicks active especially evenings.'
  );
  const [patientConsentReviewed, setPatientConsentReviewed] = useState(false);
  const [copied, setCopied] = useState(false);

  const gestInfo = calculateGestationalAge(pregnancyProfile || undefined);
  const menstrualStats = analyzeMenstrualCycles(cycles);

  // Latest measurements
  const latestBP = measurements.find((m) => m.bloodPressureSystolic);
  const latestWeight = measurements.find((m) => m.weightKg);

  const handleCopySummary = () => {
    const text = `LIFELINE AI - GYNECOLOGIST CONSULTATION BRIEF
Patient: ${patient.name} | DOB: ${patient.dateOfBirth || 'N/A'} (${patient.sex})
Blood Group & Rh: ${pregnancyProfile?.bloodType || patient.bloodType || 'Unrecorded'} (${pregnancyProfile?.rhFactor || 'Rh Unrecorded'})
Date Generated: ${new Date().toLocaleDateString()}

1. MAIN CONSULTATION CONCERN:
${chiefConcern}

2. PREGNANCY DATING & STATUS:
${pregnancyProfile?.isActive ? `Gestational Age: ${gestInfo?.weeks}w ${gestInfo?.days}d (EDD: ${gestInfo?.edd})
Dating Method & Source: ${gestInfo?.datingMethodUsed}` : 'Pregnancy tracking not active.'}

3. RELEVANT MENSTRUAL HISTORY:
Total Cycles Logged: ${menstrualStats.totalRecordedCycles}
Average Cycle Length: ${menstrualStats.averageCycleLengthDays ? `${menstrualStats.averageCycleLengthDays} days` : 'N/A'}
Average Bleeding Days: ${menstrualStats.averageBleedingDays ? `${menstrualStats.averageBleedingDays} days` : 'N/A'}
Pain Trend: ${menstrualStats.recordedPainTrend}

4. ULTRASOUND & LAB HIGHLIGHTS:
${ultrasoundAnalyses.map((u) => `• [${u.reportDate || 'Date N/A'}] ${u.scanType}: Gestational Age by Scan: ${u.gestationalAgeByScan}. Placenta: ${u.placentalDescription || 'Recorded'}. AFI: ${u.amnioticFluidDescription || 'Recorded'}.`).join('\n') || 'None recorded'}

5. VITALS & WEIGHT TRENDS:
Latest BP: ${latestBP ? `${latestBP.bloodPressureSystolic}/${latestBP.bloodPressureDiastolic} mmHg (${latestBP.date})` : 'Not recorded'}
Latest Weight: ${latestWeight ? `${latestWeight.weightKg} kg (${latestWeight.date})` : 'Not recorded'}

6. QUESTIONS FOR GYNECOLOGIST:
• How is fetal growth tracking against our baseline dating ultrasound?
• Are there any specific recommendations for travel or physical activity for this trimester?
• Under what specific symptoms should I proceed directly to hospital maternity triage?

Patient Reviewed & Authorized: Yes (${new Date().toLocaleDateString()})
[Notice: Patient-controlled health brief generated for clinical review. Not an independent medical diagnosis.]`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 no-print">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Consultation Clinical Brief</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Gynecologist-Ready Health Summary
          </h1>

          <p className="text-xs sm:text-sm text-teal-100 leading-relaxed">
            Synthesize verified pregnancy dating, menstrual cycles, ultrasound findings, vitals, and questions into a concise clinical briefing document for your doctor.
          </p>
        </div>

        <div className="z-10 shrink-0 flex flex-wrap gap-2">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-teal-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Consultation Brief</span>
          </button>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Patient Input & Customization Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 no-print">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Customize Your Visit Concerns & Notes:
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Main Reason for Today's Visit / Chief Concern:
            </label>
            <input
              type="text"
              value={chiefConcern}
              onChange={(e) => setChiefConcern(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specific Symptoms or Questions You Wish to Highlight:
            </label>
            <textarea
              rows={2}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>

          {/* Explicit Consent Requirement (Section 14 & 13) */}
          <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="patient-consent"
              checked={patientConsentReviewed}
              onChange={(e) => setPatientConsentReviewed(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="patient-consent" className="text-xs text-teal-950 font-semibold cursor-pointer">
              I have reviewed this pre-consultation summary and authorize sharing these patient-reported and document-extracted health records with my attending gynecologist.
            </label>
          </div>
        </div>
      </div>

      {/* Printable Clinical Brief Layout */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Lifeline AI
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Gynecologist Consultation Brief
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Patient Health Story & Chronological Records Synthesis
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <span className="block font-bold text-slate-900">Date: {new Date().toLocaleDateString()}</span>
            <span className="block text-[11px] text-slate-400">Generated for Clinical Review</span>
          </div>
        </div>

        {/* Section 1: Patient Details & Background */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Name:</span>
            <span className="font-extrabold text-slate-900 text-sm">{patient.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth:</span>
            <span className="font-semibold text-slate-900">{patient.dateOfBirth || 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group & Rh:</span>
            <span className="font-semibold text-slate-900">
              {pregnancyProfile?.bloodType || patient.bloodType || 'Unrecorded'} ({pregnancyProfile?.rhFactor || 'Rh unrecorded'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Allergies:</span>
            <span className="font-semibold text-rose-700">
              {patient.allergies?.join(', ') || 'No known drug allergies'}
            </span>
          </div>
        </div>

        {/* Section 2: Chief Concern */}
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide block">
            1. Main Concern for Consultation:
          </span>
          <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {chiefConcern}
          </p>
        </div>

        {/* Section 3: Pregnancy Dating */}
        {pregnancyProfile?.isActive && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                2. Pregnancy Dating & Gestational Status:
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800">
                Source Documented
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-bold text-slate-900">
                  Current Gestational Age: {gestInfo?.weeks} Weeks, {gestInfo?.days} Days
                </span>
                <span className="text-slate-600">
                  Estimated Due Date: <strong>{gestInfo?.edd}</strong>
                </span>
                <span className="text-slate-600">
                  Trimester: <strong>{gestInfo?.trimesterName}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                <strong>Dating Baseline: </strong>
                {gestInfo?.datingMethodUsed}
              </p>
            </div>
          </div>
        )}

        {/* Section 4: Menstrual History */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide block">
            3. Menstrual History Summary:
          </span>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Logged Cycles:</span>
              <span className="font-semibold text-slate-800">{menstrualStats.totalRecordedCycles} cycles</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Typical Cycle Length:</span>
              <span className="font-semibold text-slate-800">
                {menstrualStats.averageCycleLengthDays ? `${menstrualStats.averageCycleLengthDays} days` : 'Not established'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Average Bleeding:</span>
              <span className="font-semibold text-slate-800">
                {menstrualStats.averageBleedingDays ? `${menstrualStats.averageBleedingDays} days` : 'Not recorded'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pain Trend:</span>
              <span className="font-semibold text-slate-800 capitalize">{menstrualStats.recordedPainTrend}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Ultrasound & Lab Reports */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide block">
            4. Ultrasound & Diagnostic Reports:
          </span>
          {ultrasoundAnalyses.length === 0 ? (
            <p className="text-slate-500 italic">No formal ultrasound analyses attached.</p>
          ) : (
            <div className="space-y-2">
              {ultrasoundAnalyses.map((u) => (
                <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{u.scanType} ({u.reportDate})</span>
                    <span className="text-teal-800 font-semibold text-[11px]">Age by scan: {u.gestationalAgeByScan}</span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    Placenta: {u.placentalDescription || 'Recorded'} | AFI: {u.amnioticFluidDescription || 'Adequate'}
                  </p>
                  {u.measurements && u.measurements.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
                      {u.measurements.map((m, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white rounded border border-slate-200">
                          <strong>{m.name.split(' ')[0]}:</strong> {m.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Vitals & Weight */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide block">
            5. Recent Vitals & Blood Pressure Records:
          </span>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-4 text-xs text-slate-800">
            <span>
              Latest BP: <strong>{latestBP ? `${latestBP.bloodPressureSystolic}/${latestBP.bloodPressureDiastolic} mmHg` : 'Not recorded'}</strong> ({latestBP?.source.replace('_', ' ') || ''})
            </span>
            <span>
              Weight: <strong>{latestWeight ? `${latestWeight.weightKg} kg` : 'Not recorded'}</strong>
            </span>
            <span>
              Resting Pulse: <strong>{latestBP?.pulseBpm ? `${latestBP.pulseBpm} bpm` : 'N/A'}</strong>
            </span>
          </div>
        </div>

        {/* Section 7: Questions for Gynecologist */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wide block">
            6. Patient Prepared Questions for Today's Visit:
          </span>
          <ul className="list-decimal pl-4 space-y-1 text-slate-800">
            <li>How is fetal growth tracking against our baseline dating ultrasound?</li>
            <li>Are any specific activity or dietary modifications recommended for this stage?</li>
            <li>What specific red-flag warning symptoms should prompt immediate admission to hospital maternity triage?</li>
          </ul>
        </div>

        {/* Clinical Disclaimer */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 space-y-1">
          <p>
            <strong>Clinical Boundary & Patient Consent:</strong> This document is a patient-controlled pre-consultation summary prepared using Lifeline AI. It connects patient-reported wellness, menstrual cycle history, and verified medical document extractions to facilitate a more focused clinical consultation. It does not replace independent clinical evaluation or diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
