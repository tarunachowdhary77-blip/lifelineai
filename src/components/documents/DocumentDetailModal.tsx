import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Trash2,
  Calendar,
  Tag,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Edit2,
} from 'lucide-react';
import { MedicalDocument, DocumentCategory } from '../../types';
import { deleteDocument, saveDocument, getConsultations } from '../../lib/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: MedicalDocument | null;
  patientId: string;
  onUpdated: () => void;
}

export const DocumentDetailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  document,
  patientId,
  onUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Prescription');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [extractedText, setExtractedText] = useState('');

  if (!isOpen || !document) return null;

  const handleStartEdit = () => {
    setTitle(document.title);
    setCategory(document.category);
    setDate(document.date);
    setNotes(document.notes || '');
    setExtractedText(document.extractedText || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MedicalDocument = {
      ...document,
      title: title.trim(),
      category,
      date,
      notes: notes.trim() || undefined,
      extractedText: extractedText.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    saveDocument(updated);
    setIsEditing(false);
    onUpdated();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      deleteDocument(document.id);
      onUpdated();
      onClose();
    }
  };

  const handleDownload = () => {
    if (document.fileData) {
      const a = window.document.createElement('a');
      a.href = document.fileData;
      a.download = document.fileName || `${document.title}.pdf`;
      a.click();
    } else {
      // Create text file download with document metadata and extracted text
      const content = `LIFELINE AI MEDICAL DOCUMENT RECORD
====================================
Title: ${document.title}
Category: ${document.category}
Date of Document: ${document.date}
File Name: ${document.fileName}
Size: ${document.fileSize}
Patient Notes: ${document.notes || 'None'}

TEXT EXTRACT:
${document.extractedText || 'No readable text content extracted.'}
`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/\s+/g, '_')}_record.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-sm">
                {document.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-teal-700">{document.category}</span>
                <span>•</span>
                <span>{document.date}</span>
                <span>•</span>
                <span>{document.fileSize}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Laboratory Report">Laboratory Report</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Consultation Note">Consultation Note</option>
                    <option value="Imaging Report">Imaging Report</option>
                    <option value="Vaccination Record">Vaccination Record</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Extracted Text</label>
                <textarea
                  rows={4}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Document Preview Card */}
              {document.fileData && document.fileType?.startsWith('image/') ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center p-2 max-h-64">
                  <img
                    src={document.fileData}
                    alt={document.title}
                    className="max-h-60 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{document.fileName}</p>
                      <p className="text-xs text-slate-500">
                        {document.fileType || 'Medical Document'} • {document.fileSize}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl shadow-2xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              )}

              {/* Machine-Extracted Content Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Document Text & Findings
                  </h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Machine-Extracted (Patient Review)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {document.extractedText || 'No optical text content recorded for this document.'}
                </div>
              </div>

              {/* Notes */}
              {document.notes && (
                <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl text-xs text-teal-900">
                  <strong className="block text-teal-950 mb-0.5">Patient Notes:</strong>
                  {document.notes}
                </div>
              )}
            </>
          )}

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Document
            </button>

            <div className="flex items-center gap-2">
              {!isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Metadata
                </button>
              )}
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Download / Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
