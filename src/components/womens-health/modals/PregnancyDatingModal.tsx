import React, { useState } from 'react';
import { X, Calendar, Baby, AlertCircle, CheckCircle2, Info, FileText } from 'lucide-react';
import { PregnancyProfile, PregnancyDatingMethod } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialProfile?: PregnancyProfile | null;
  patientId: string;
  onSave: (profile: PregnancyProfile) => void;
}

export const PregnancyDatingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialProfile,
  patientId,
  onSave,
}) => {
  const [isActive, setIsActive] = useState(initialProfile ? initialProfile.isActive : true);
  const [datingMethod, setDatingMethod] = useState<PregnancyDatingMethod>(
    initialProfile?.datingMethod || 'edd_clinician'
  );
  const [lmpDate, setLmpDate] = useState(initialProfile?.lmpDate || '');
  const [clinicianEdd, setClinicianEdd] = useState(initialProfile?.clinicianEdd || '');
  const [clinicianWeeks, setClinicianWeeks] = useState(
    initialProfile?.clinicianGestationalWeeks?.toString() || '20'
  );
  const [clinicianDays, setClinicianDays] = useState(
    initialProfile?.clinicianGestationalDays?.toString() || '0'
  );
  const [clinicianAssessmentDate, setClinicianAssessmentDate] = useState(
    initialProfile?.clinicianAssessmentDate || new Date().toISOString().split('T')[0]
  );
  const [datingSourceNotes, setDatingSourceNotes] = useState(
    initialProfile?.datingSourceNotes || 'Ultrasound scan by obstetrician'
  );
  const [hospitalName, setHospitalName] = useState(
    initialProfile?.hospitalMaternityContact?.hospitalName || ''
  );
  const [triagePhone, setTriagePhone] = useState(
    initialProfile?.hospitalMaternityContact?.triagePhone || ''
  );
  const [bloodType, setBloodType] = useState(initialProfile?.bloodType || 'O+');
  const [rhFactor, setRhFactor] = useState(initialProfile?.rhFactor || 'Positive');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const profile: PregnancyProfile = {
      id: initialProfile?.id || `preg-${Date.now()}`,
      patientId,
      isActive,
      datingMethod,
      lmpDate: lmpDate.trim() || undefined,
      clinicianEdd: clinicianEdd.trim() || undefined,
      clinicianGestationalWeeks: clinicianWeeks ? parseInt(clinicianWeeks, 10) : undefined,
      clinicianGestationalDays: clinicianDays ? parseInt(clinicianDays, 10) : 0,
      clinicianAssessmentDate: clinicianAssessmentDate.trim() || undefined,
      datingSourceNotes: datingSourceNotes.trim() || 'Patient configured dates',
      bloodType: bloodType.trim() || undefined,
      rhFactor: rhFactor as any,
      hospitalMaternityContact: hospitalName.trim()
        ? {
            hospitalName: hospitalName.trim(),
            triagePhone: triagePhone.trim() || '+1 (555) 000-0000',
          }
        : undefined,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pregnancy Profile & Dating Setup
              </h2>
              <p className="text-xs text-slate-500">
                Configure your estimated due date, dating method, and maternity contacts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 text-sm">
          {/* Active Status Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Pregnancy Journey Active
              </p>
              <p className="text-xs text-slate-500">
                Enables gestational tracking, trimester milestones, and prenatal appointment tools.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Dating Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Choose Pregnancy Dating Method:
            </label>
            <p className="text-[11px] text-slate-500">
              Do not assume LMP is reliable for every user. Dating ultrasound or clinician confirmation is preferred.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  datingMethod === 'edd_clinician'
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="datingMethod"
                  value="edd_clinician"
                  checked={datingMethod === 'edd_clinician'}
                  onChange={() => setDatingMethod('edd_clinician')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Estimated Due Date (EDD) Provided by Clinician (Recommended)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Confirmed via early ultrasound scan or clinical obstetric examination.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  datingMethod === 'gestational_age_clinician'
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="datingMethod"
                  value="gestational_age_clinician"
                  checked={datingMethod === 'gestational_age_clinician'}
                  onChange={() => setDatingMethod('gestational_age_clinician')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Gestational Age Documented on a Specific Scan Date
                  </span>
                  <span className="text-[11px] text-slate-500">
                    e.g. Scan report states "12 weeks 3 days on 15 August".
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  datingMethod === 'lmp'
                    ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="datingMethod"
                  value="lmp"
                  checked={datingMethod === 'lmp'}
                  onChange={() => setDatingMethod('lmp')}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    First Day of Last Menstrual Period (LMP)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Standard 280-day calculation (Naegele's rule). Subject to confirmation by ultrasound.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Date Inputs */}
          {datingMethod === 'edd_clinician' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinician-Confirmed Estimated Due Date (EDD): *
                </label>
                <input
                  type="date"
                  required
                  value={clinicianEdd}
                  onChange={(e) => setClinicianEdd(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {datingMethod === 'gestational_age_clinician' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weeks:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="42"
                    required
                    value={clinicianWeeks}
                    onChange={(e) => setClinicianWeeks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Days (0-6):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={clinicianDays}
                    onChange={(e) => setClinicianDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Examination / Scan: *
                </label>
                <input
                  type="date"
                  required
                  value={clinicianAssessmentDate}
                  onChange={(e) => setClinicianAssessmentDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {datingMethod === 'lmp' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Day of Last Menstrual Period (LMP): *
                </label>
                <input
                  type="date"
                  required
                  value={lmpDate}
                  onChange={(e) => setLmpDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          )}

          {/* Dating Source Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source of Dating Information:
            </label>
            <input
              type="text"
              placeholder="e.g. 12-week dating scan by Dr. Rao at City Hospital"
              value={datingSourceNotes}
              onChange={(e) => setDatingSourceNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Retaining the clinical source ensures your doctor understands how dates were established.
            </p>
          </div>

          {/* Maternal Blood Type & Rh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group:
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
                <option value="Unknown">Unrecorded / Not yet tested</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rh Factor:
              </label>
              <select
                value={rhFactor}
                onChange={(e) => setRhFactor(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm"
              >
                <option value="Positive">Rh Positive (+)</option>
                <option value="Negative">Rh Negative (-)</option>
                <option value="Unknown">Unknown / Pending</option>
              </select>
            </div>
          </div>

          {/* Hospital Maternity Contacts */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide block">
              Maternity Hospital & Emergency Triage:
            </span>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Hospital / Maternity Unit Name"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
              <input
                type="tel"
                placeholder="24/7 Labor & Delivery Triage Phone (e.g. +1 555-432-8900)"
                value={triagePhone}
                onChange={(e) => setTriagePhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Estimated dates may change following clinical obstetric assessment. Lifeline AI does not guarantee delivery dates or pregnancy outcomes.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Pregnancy Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
