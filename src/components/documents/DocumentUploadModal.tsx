import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { MedicalDocument, DocumentCategory } from '../../types';
import { saveDocument, getConsultations } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onSaved: () => void;
}

export const DocumentUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  patientId,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Prescription');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [associatedConsultationId, setAssociatedConsultationId] = useState('');
  const [notes, setNotes] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  const consultations = getConsultations(patientId);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(0)} KB`);
    setFileType(file.type || 'application/octet-stream');

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setFileData(dataUrl);

      // Attempt machine text extraction via server API
      setIsProcessing(true);
      try {
        const res = await fetch('/api/documents/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: file.name,
            category,
            text: file.type.includes('text') ? atob(dataUrl.split(',')[1] || '') : '',
          }),
        });
        const data = await res.json();
        if (data.extractedText) {
          setExtractedText(data.extractedText);
        } else {
          setExtractedText(
            `[Machine Extracted Record - Review Required]\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(0)} KB\nExtracted on: ${new Date().toLocaleDateString()}`
          );
        }
      } catch {
        setExtractedText(
          `[Machine Extracted Record - Review Required]\nFile: ${file.name}\nNote: Optical text processing pending review.`
        );
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const doc: MedicalDocument = {
      id: `doc-${Date.now()}`,
      patientId,
      title: title.trim(),
      category,
      date,
      uploadDate: new Date().toISOString(),
      fileName: fileName || `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      fileSize: fileSize || '120 KB',
      fileType,
      fileData,
      notes: notes.trim() || undefined,
      associatedConsultationId: associatedConsultationId || undefined,
      extractedText: extractedText.trim() || undefined,
      isMachineExtracted: Boolean(extractedText),
      isVerifiedByClinician: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveDocument(doc);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload Medical Document</h2>
              <p className="text-xs text-slate-500">
                Prescriptions, laboratory tests, discharge summaries & consultation notes.
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
          {/* File Picker Zone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-teal-50/20 transition-all cursor-pointer relative">
            <input
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <UploadCloud className="w-8 h-8 text-teal-600" />
              {fileName ? (
                <div>
                  <p className="text-xs font-bold text-slate-900">{fileName}</p>
                  <p className="text-[11px] text-teal-700 font-medium">{fileSize} • Click or drag to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Upload prescription, lab report, or clinical note
                  </p>
                  <p className="text-[11px] text-slate-500">PDF, PNG, JPG, or TXT up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Metro Urgent Care Rx - Amoxicillin, Audiogram Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              >
                <option value="Prescription">Prescription</option>
                <option value="Laboratory Report">Laboratory Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Consultation Note">Consultation Note</option>
                <option value="Imaging Report">Imaging Report</option>
                <option value="Vaccination Record">Vaccination Record</option>
                <option value="Other">Other Medical Document</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Linked Consultation */}
          {consultations.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Consultation (Optional)
              </label>
              <select
                value={associatedConsultationId}
                onChange={(e) => setAssociatedConsultationId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="">(None / Standalone Document)</option>
                {consultations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.date}: {c.doctorName} - {c.clinicOrHospital} ({c.reasonForConsultation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Machine Extracted Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Machine-Extracted / OCR Text Content
              </label>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Machine Extracted (Unverified)
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Text extracted from document or entered manually for clinical summary synthesis..."
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Extracted text is clearly labelled as machine-extracted to preserve clinical fidelity.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Notes on this Document
            </label>
            <input
              type="text"
              placeholder="e.g. Given by urgent care doctor; doctor warned to stop taking if rash appears"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
            >
              Save Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
