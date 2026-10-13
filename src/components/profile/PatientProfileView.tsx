import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  Heart,
  Phone,
  Lock,
} from 'lucide-react';
import { PatientProfile } from '../../types';
import {
  savePatient,
  getPatients,
  setCurrentPatientId,
  resetToDemoData,
} from '../../lib/storage';

interface Props {
  patient: PatientProfile;
  onRefresh: () => void;
}

export const PatientProfileView: React.FC<Props> = ({ patient, onRefresh }) => {
  const [name, setName] = useState(patient.name);
  const [dob, setDob] = useState(patient.dateOfBirth);
  const [sex, setSex] = useState(patient.sex);
  const [bloodType, setBloodType] = useState(patient.bloodType || '');

  // Allergies
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>(patient.allergies || []);

  // Pre-existing conditions
  const [conditionInput, setConditionInput] = useState('');
  const [conditions, setConditions] = useState<string[]>(patient.conditions || []);

  // Family History
  const [familyInput, setFamilyInput] = useState('');
  const [familyHistory, setFamilyHistory] = useState<string[]>(patient.familyHistory || []);

  // Emergency contact
  const [emName, setEmName] = useState(patient.emergencyContact?.name || '');
  const [emRelation, setEmRelation] = useState(patient.emergencyContact?.relation || '');
  const [emPhone, setEmPhone] = useState(patient.emergencyContact?.phone || '');

  // Saved confirmation toast
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setName(patient.name);
    setDob(patient.dateOfBirth);
    setSex(patient.sex);
    setBloodType(patient.bloodType || '');
    setAllergies(patient.allergies || []);
    setConditions(patient.conditions || []);
    setFamilyHistory(patient.familyHistory || []);
    setEmName(patient.emergencyContact?.name || '');
    setEmRelation(patient.emergencyContact?.relation || '');
    setEmPhone(patient.emergencyContact?.phone || '');
  }, [patient]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...patient,
      name: name.trim(),
      dateOfBirth: dob,
      sex,
      bloodType: bloodType.trim() || undefined,
      allergies,
      conditions,
      familyHistory,
      emergencyContact: emName.trim()
        ? { name: emName.trim(), relation: emRelation.trim(), phone: emPhone.trim() }
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    savePatient(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    onRefresh();
  };

  const handleCreateNewProfile = () => {
    const newPatient: PatientProfile = {
      id: `patient-${Date.now()}`,
      name: 'New Patient Profile',
      dateOfBirth: '1995-01-01',
      sex: 'Prefer not to say',
      allergies: [],
      conditions: [],
      familyHistory: [],
      currentMedications: [],
      isDemoPatient: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    savePatient(newPatient);
    setCurrentPatientId(newPatient.id);
    onRefresh();
  };

  const handleExportData = () => {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lifeline_')) {
        backup[key] = JSON.parse(localStorage.getItem(key) || '{}');
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeline_health_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([key, val]) => {
          localStorage.setItem(key, JSON.stringify(val));
        });
        alert('Health data successfully restored!');
        onRefresh();
      } catch (err) {
        alert('Failed to import backup JSON. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (
      confirm(
        'Reset to the October 2025 Ear Pain Demonstration Scenario (Sarah Jenkins)? Any custom entries on the demo profile will be restored.'
      )
    ) {
      resetToDemoData();
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Patient Profile & Privacy</h1>
            {patient.isDemoPatient && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Fictional Demonstration Profile
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Manage your medical demographics, verified allergies, health history, and local data backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewProfile}
            className="px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors"
          >
            + Create New Profile
          </button>
          <button
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demo Scenario
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-sm">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          General Demographics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Biological Sex
            </label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Blood Type (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. O+, A-, B+"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Allergies */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-rose-800">
            Known Drug, Environmental & Food Allergies
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Penicillin (mild rash), Sulfa drugs, Peanuts"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
                    setAllergies([...allergies, allergyInput.trim()]);
                    setAllergyInput('');
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (allergyInput.trim() && !allergies.includes(allergyInput.trim())) {
                  setAllergies([...allergies, allergyInput.trim()]);
                  setAllergyInput('');
                }
              }}
              className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl text-xs hover:bg-rose-100 border border-rose-200"
            >
              Add Allergy
            </button>
          </div>
          {allergies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-900 rounded-full text-xs font-semibold border border-rose-200"
                >
                  {a}
                  <button
                    type="button"
                    onClick={() => setAllergies(allergies.filter((item) => item !== a))}
                    className="text-rose-400 hover:text-rose-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pre-existing Conditions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Existing Medical Conditions / Chronic Diagnoses
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Mild Seasonal Allergic Rhinitis, Asthma, Hypertension"
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (conditionInput.trim() && !conditions.includes(conditionInput.trim())) {
                    setConditions([...conditions, conditionInput.trim()]);
                    setConditionInput('');
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (conditionInput.trim() && !conditions.includes(conditionInput.trim())) {
                  setConditions([...conditions, conditionInput.trim()]);
                  setConditionInput('');
                }
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
            >
              Add Condition
            </button>
          </div>
          {conditions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {conditions.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setConditions(conditions.filter((item) => item !== c))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Family Medical History */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Family Medical History
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Maternal Hypertension, Type 2 Diabetes (Father)"
              value={familyInput}
              onChange={(e) => setFamilyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (familyInput.trim() && !familyHistory.includes(familyInput.trim())) {
                    setFamilyHistory([...familyHistory, familyInput.trim()]);
                    setFamilyInput('');
                  }
                }
              }}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (familyInput.trim() && !familyHistory.includes(familyInput.trim())) {
                  setFamilyHistory([...familyHistory, familyInput.trim()]);
                  setFamilyInput('');
                }
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
            >
              Add Entry
            </button>
          </div>
          {familyHistory.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {familyHistory.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold"
                >
                  {f}
                  <button
                    type="button"
                    onClick={() => setFamilyHistory(familyHistory.filter((item) => item !== f))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Designated Emergency Contact (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Contact Name</label>
              <input
                type="text"
                placeholder="David Jenkins"
                value={emName}
                onChange={(e) => setEmName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Relationship</label>
              <input
                type="text"
                placeholder="Spouse, Sibling, Parent"
                value={emRelation}
                onChange={(e) => setEmRelation(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                value={emPhone}
                onChange={(e) => setEmPhone(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {isSaved ? (
            <span className="text-xs font-bold text-teal-700">✓ Profile saved successfully!</span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            Save Profile Changes
          </button>
        </div>
      </form>

      {/* Privacy and Patient Data Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">
            Patient Privacy & Data Ownership
          </h2>
        </div>

        <p className="text-slate-600 leading-relaxed">
          Lifeline AI puts you in complete control of your health story. Your records are stored securely in local browser storage, protected from public exposure.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Export My Health Records (JSON)
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Backup File (JSON)
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
