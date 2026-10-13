import React from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  symptomName?: string;
}

export const EmergencyAlertModal: React.FC<Props> = ({ isOpen, onClose, symptomName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-950">Important Medical Safety Notice</h3>
              <p className="text-sm text-red-600 font-medium">Potentially Serious Symptoms Recorded</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-slate-700 text-sm space-y-3 bg-red-50/60 p-4 rounded-xl border border-red-100">
          <p>
            You recorded <strong>{symptomName || 'a high-severity symptom'}</strong>. Lifeline AI is a health tracking and pre-consultation organizer and <strong className="text-red-700">CANNOT provide emergency care or diagnosis</strong>.
          </p>
          <p>
            If you are experiencing any of the following <strong>red-flag symptoms</strong>, seek immediate medical attention:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800 text-xs font-medium">
            <li>Severe crushing chest pain or pressure</li>
            <li>Sudden shortness of breath or difficulty breathing</li>
            <li>Sudden weakness, numbness, or paralysis (especially on one side)</li>
            <li>Sudden confusion, speech difficulty, or severe thunderclap headache</li>
            <li>Severe uncontrolled bleeding, high stiff-neck fever, or loss of consciousness</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="tel:911"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-center shadow-md transition-colors"
          >
            <PhoneCall className="w-5 h-5" />
            Call Emergency Services (911)
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-colors"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
};
