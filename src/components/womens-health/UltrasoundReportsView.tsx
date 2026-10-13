import React, { useState } from 'react';
import {
  FileText,
  Plus,
  UploadCloud,
  Sparkles,
  Calendar,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  MedicalDocument,
  UltrasoundReportAnalysis,
  PatientProfile,
} from '../../types';

interface Props {
  patient: PatientProfile;
  documents: MedicalDocument[];
  analyses: UltrasoundReportAnalysis[];
  onOpenUploadModal: () => void;
}

export const UltrasoundReportsView: React.FC<Props> = ({
  patient,
  documents,
  analyses,
  onOpenUploadModal,
}) => {
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(
    analyses[0]?.id || null
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/20">
            <FileText className="w-3.5 h-3.5 text-indigo-200" />
            <span>Prenatal Imaging & Lab Reports</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ultrasound & Laboratory Vault
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Upload ultrasound scans and prenatal investigation reports. Review machine-extracted biometrics, anatomical findings, and medical terminology in simple language.
          </p>
        </div>

        <div className="z-10 shrink-0">
          <button
            onClick={onOpenUploadModal}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-indigo-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-transform active:scale-95 inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload Scan / Lab Report</span>
          </button>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Reports and Analysis List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Analyzed Prenatal Reports ({analyses.length})
            </h2>
            <p className="text-xs text-slate-500">
              Structured biometric summaries with plain-language explanations.
            </p>
          </div>

          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Report</span>
          </button>
        </div>

        {analyses.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No ultrasound or lab analyses stored yet.</p>
            <button
              onClick={onOpenUploadModal}
              className="text-xs font-bold text-indigo-600 underline"
            >
              Upload an ultrasound report or load sample data
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((us) => {
              const isExpanded = expandedAnalysisId === us.id;

              return (
                <div
                  key={us.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/40 overflow-hidden shadow-2xs transition-all"
                >
                  {/* Card Header Accordion */}
                  <div
                    onClick={() =>
                      setExpandedAnalysisId(isExpanded ? null : us.id)
                    }
                    className="p-5 bg-white hover:bg-slate-50 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">
                          {us.scanType}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {us.reportDate || 'Date unrecorded'}
                        </span>
                        {us.gestationalAgeByScan && (
                          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            Age by Scan: {us.gestationalAgeByScan}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        {us.placentalDescription
                          ? `Placenta: ${us.placentalDescription}`
                          : 'Ultrasound Biometrics & Findings'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-bold text-indigo-600">
                        {isExpanded ? 'Hide Details' : 'View Full Summary'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Summary Body */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 space-y-4 text-xs bg-slate-50/70 animate-in fade-in">
                      {/* Biometric Measurements Grid */}
                      {us.measurements && us.measurements.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
                            Documented Biometric Values:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {us.measurements.map((m, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl">
                                <span className="text-slate-400 block text-[10px] uppercase">
                                  {m.name}
                                </span>
                                <span className="font-bold text-slate-900 text-xs block">
                                  {m.value}
                                </span>
                                {m.referenceRange && (
                                  <span className="text-[10px] text-teal-700 block">
                                    {m.referenceRange}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Placenta & Fluid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 block text-[11px] uppercase">
                            Placental Description:
                          </span>
                          <p className="text-slate-800 font-medium">
                            {us.placentalDescription || 'Not documented in text'}
                          </p>
                        </div>
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 block text-[11px] uppercase">
                            Amniotic Fluid / AFI:
                          </span>
                          <p className="text-slate-800 font-medium">
                            {us.amnioticFluidDescription || 'Not documented in text'}
                          </p>
                        </div>
                      </div>

                      {/* Plain Language Explanation */}
                      {us.plainLanguageExplanation && (
                        <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1.5">
                          <span className="font-bold text-teal-950 uppercase tracking-wide text-[11px] block">
                            Plain-Language Explanation for Patients:
                          </span>
                          <p className="text-slate-800 leading-relaxed font-sans">
                            {us.plainLanguageExplanation}
                          </p>
                        </div>
                      )}

                      {/* Explicit findings */}
                      {us.findingsExplicit && us.findingsExplicit.length > 0 && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
                            Verbatim Findings Documented in Report:
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700">
                            {us.findingsExplicit.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Questions for Gynecologist */}
                      {us.questionsForGynecologist && us.questionsForGynecologist.length > 0 && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                          <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px] block">
                            Questions to Discuss with Your Gynecologist:
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-slate-700">
                            {us.questionsForGynecologist.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Safety Boundary */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p>
                          AI report summaries assist with organizing and understanding documented findings. They do not replace formal radiologist/obstetrician interpretation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
