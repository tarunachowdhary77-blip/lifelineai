import {
  PatientProfile,
  DailyHealthEntry,
  SymptomEntry,
  MedicationEntry,
  MedicalDocument,
  ConsultationEntry,
  AppointmentEntry,
  TimelineEvent,
  DoctorSummaryDraft,
  PregnancyProfile,
  MenstrualCycleEntry,
  PregnancyWellnessLog,
  HealthMeasurement,
  UltrasoundReportAnalysis,
  WarningSignAlert,
} from '../types';
import {
  DEMO_PATIENT,
  DEMO_SYMPTOMS,
  DEMO_MEDICATIONS,
  DEMO_CONSULTATIONS,
  DEMO_DOCUMENTS,
  DEMO_CHECKINS,
  DEMO_APPOINTMENTS,
  DEMO_PREGNANCY_PROFILE,
  DEMO_MENSTRUAL_CYCLES,
  DEMO_PREGNANCY_WELLNESS,
  DEMO_MEASUREMENTS,
  DEMO_ULTRASOUND_ANALYSES,
} from './demoData';

const STORAGE_KEYS = {
  CURRENT_PATIENT_ID: 'lifeline_current_patient_id',
  PATIENTS: 'lifeline_patients_v1',
  CHECKINS: 'lifeline_checkins_v1',
  SYMPTOMS: 'lifeline_symptoms_v1',
  MEDICATIONS: 'lifeline_medications_v1',
  DOCUMENTS: 'lifeline_documents_v1',
  CONSULTATIONS: 'lifeline_consultations_v1',
  APPOINTMENTS: 'lifeline_appointments_v1',
  SUMMARIES: 'lifeline_summaries_v1',
  PREGNANCY_PROFILES: 'lifeline_pregnancy_profiles_v1',
  MENSTRUAL_CYCLES: 'lifeline_menstrual_cycles_v1',
  PREGNANCY_WELLNESS: 'lifeline_pregnancy_wellness_v1',
  HEALTH_MEASUREMENTS: 'lifeline_health_measurements_v1',
  ULTRASOUND_ANALYSES: 'lifeline_ultrasound_analyses_v1',
  WARNING_ALERTS: 'lifeline_warning_alerts_v1',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyStorageChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener error:', e);
    }
  });
}

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChanged();
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

// Initialization of demo data if storage is empty
export function initializeStorageIfEmpty(): void {
  const existingPatients = getItem<PatientProfile[]>(STORAGE_KEYS.PATIENTS, []);
  if (existingPatients.length === 0) {
    resetToDemoData();
  }
}

export function resetToDemoData(): void {
  setItem(STORAGE_KEYS.PATIENTS, [DEMO_PATIENT]);
  setItem(STORAGE_KEYS.CURRENT_PATIENT_ID, DEMO_PATIENT.id);
  setItem(STORAGE_KEYS.SYMPTOMS, DEMO_SYMPTOMS);
  setItem(STORAGE_KEYS.MEDICATIONS, DEMO_MEDICATIONS);
  setItem(STORAGE_KEYS.CONSULTATIONS, DEMO_CONSULTATIONS);
  setItem(STORAGE_KEYS.DOCUMENTS, DEMO_DOCUMENTS);
  setItem(STORAGE_KEYS.CHECKINS, DEMO_CHECKINS);
  setItem(STORAGE_KEYS.APPOINTMENTS, DEMO_APPOINTMENTS);
  setItem(STORAGE_KEYS.SUMMARIES, []);
  setItem(STORAGE_KEYS.PREGNANCY_PROFILES, [DEMO_PREGNANCY_PROFILE]);
  setItem(STORAGE_KEYS.MENSTRUAL_CYCLES, DEMO_MENSTRUAL_CYCLES);
  setItem(STORAGE_KEYS.PREGNANCY_WELLNESS, DEMO_PREGNANCY_WELLNESS);
  setItem(STORAGE_KEYS.HEALTH_MEASUREMENTS, DEMO_MEASUREMENTS);
  setItem(STORAGE_KEYS.ULTRASOUND_ANALYSES, DEMO_ULTRASOUND_ANALYSES);
  setItem(STORAGE_KEYS.WARNING_ALERTS, []);
}

// Patient Profiles
export function getPatients(): PatientProfile[] {
  return getItem<PatientProfile[]>(STORAGE_KEYS.PATIENTS, []);
}

export function getCurrentPatient(): PatientProfile {
  const patients = getPatients();
  const currentId = getItem<string>(STORAGE_KEYS.CURRENT_PATIENT_ID, DEMO_PATIENT.id);
  const found = patients.find((p) => p.id === currentId);
  return found || patients[0] || DEMO_PATIENT;
}

export function setCurrentPatientId(id: string): void {
  setItem(STORAGE_KEYS.CURRENT_PATIENT_ID, id);
}

export function savePatient(patient: PatientProfile): void {
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.id === patient.id);
  if (idx >= 0) {
    patients[idx] = { ...patient, updatedAt: new Date().toISOString() };
  } else {
    patients.push({
      ...patient,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.PATIENTS, patients);
  setItem(STORAGE_KEYS.CURRENT_PATIENT_ID, patient.id);
}

// Daily Check-ins
export function getCheckins(patientId?: string): DailyHealthEntry[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<DailyHealthEntry[]>(STORAGE_KEYS.CHECKINS, []);
  return all
    .filter((c) => c.patientId === targetId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveCheckin(entry: DailyHealthEntry): void {
  const all = getItem<DailyHealthEntry[]>(STORAGE_KEYS.CHECKINS, []);
  const idx = all.findIndex((c) => c.id === entry.id);
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.CHECKINS, all);
}

export function deleteCheckin(id: string): void {
  const all = getItem<DailyHealthEntry[]>(STORAGE_KEYS.CHECKINS, []);
  setItem(
    STORAGE_KEYS.CHECKINS,
    all.filter((c) => c.id !== id)
  );
}

// Symptoms
export function getSymptoms(patientId?: string): SymptomEntry[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<SymptomEntry[]>(STORAGE_KEYS.SYMPTOMS, []);
  return all
    .filter((s) => s.patientId === targetId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveSymptom(entry: SymptomEntry): void {
  const all = getItem<SymptomEntry[]>(STORAGE_KEYS.SYMPTOMS, []);
  const idx = all.findIndex((s) => s.id === entry.id);
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.SYMPTOMS, all);
}

export function deleteSymptom(id: string): void {
  const all = getItem<SymptomEntry[]>(STORAGE_KEYS.SYMPTOMS, []);
  setItem(
    STORAGE_KEYS.SYMPTOMS,
    all.filter((s) => s.id !== id)
  );
}

// Medications
export function getMedications(patientId?: string): MedicationEntry[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<MedicationEntry[]>(STORAGE_KEYS.MEDICATIONS, []);
  return all
    .filter((m) => m.patientId === targetId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export function saveMedication(entry: MedicationEntry): void {
  const all = getItem<MedicationEntry[]>(STORAGE_KEYS.MEDICATIONS, []);
  const idx = all.findIndex((m) => m.id === entry.id);
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.MEDICATIONS, all);
}

export function deleteMedication(id: string): void {
  const all = getItem<MedicationEntry[]>(STORAGE_KEYS.MEDICATIONS, []);
  setItem(
    STORAGE_KEYS.MEDICATIONS,
    all.filter((m) => m.id !== id)
  );
}

export function addMedicationAdherence(
  medicationId: string,
  adherenceRecord: {
    date: string;
    time: string;
    status: 'taken' | 'missed' | 'skipped' | 'not_recorded';
    reason?: string;
    notes?: string;
  }
): void {
  const all = getItem<MedicationEntry[]>(STORAGE_KEYS.MEDICATIONS, []);
  const med = all.find((m) => m.id === medicationId);
  if (!med) return;
  const newRecord = {
    id: 'adh-' + Date.now(),
    ...adherenceRecord,
  };
  med.adherenceHistory = [newRecord, ...(med.adherenceHistory || [])];
  med.updatedAt = new Date().toISOString();
  setItem(STORAGE_KEYS.MEDICATIONS, all);
}

// Documents
export function getDocuments(patientId?: string): MedicalDocument[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  return all
    .filter((d) => d.patientId === targetId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveDocument(doc: MedicalDocument): void {
  const all = getItem<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  const idx = all.findIndex((d) => d.id === doc.id);
  if (idx >= 0) {
    all[idx] = { ...doc, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.DOCUMENTS, all);
}

export function deleteDocument(id: string): void {
  const all = getItem<MedicalDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  setItem(
    STORAGE_KEYS.DOCUMENTS,
    all.filter((d) => d.id !== id)
  );
}

// Consultations
export function getConsultations(patientId?: string): ConsultationEntry[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<ConsultationEntry[]>(STORAGE_KEYS.CONSULTATIONS, []);
  return all
    .filter((c) => c.patientId === targetId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function saveConsultation(entry: ConsultationEntry): void {
  const all = getItem<ConsultationEntry[]>(STORAGE_KEYS.CONSULTATIONS, []);
  const idx = all.findIndex((c) => c.id === entry.id);
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.CONSULTATIONS, all);
}

export function deleteConsultation(id: string): void {
  const all = getItem<ConsultationEntry[]>(STORAGE_KEYS.CONSULTATIONS, []);
  setItem(
    STORAGE_KEYS.CONSULTATIONS,
    all.filter((c) => c.id !== id)
  );
}

// Appointments
export function getAppointments(patientId?: string): AppointmentEntry[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<AppointmentEntry[]>(STORAGE_KEYS.APPOINTMENTS, []);
  return all
    .filter((a) => a.patientId === targetId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function saveAppointment(entry: AppointmentEntry): void {
  const all = getItem<AppointmentEntry[]>(STORAGE_KEYS.APPOINTMENTS, []);
  const idx = all.findIndex((a) => a.id === entry.id);
  if (idx >= 0) {
    all[idx] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    all.push({
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  setItem(STORAGE_KEYS.APPOINTMENTS, all);
}

export function deleteAppointment(id: string): void {
  const all = getItem<AppointmentEntry[]>(STORAGE_KEYS.APPOINTMENTS, []);
  setItem(
    STORAGE_KEYS.APPOINTMENTS,
    all.filter((a) => a.id !== id)
  );
}

// Summaries
export function getSummaries(patientId?: string): DoctorSummaryDraft[] {
  const targetId = patientId || getCurrentPatient().id;
  const all = getItem<DoctorSummaryDraft[]>(STORAGE_KEYS.SUMMARIES, []);
  return all
    .filter((s) => s.patientId === targetId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveSummary(summary: DoctorSummaryDraft): void {
  const all = getItem<DoctorSummaryDraft[]>(STORAGE_KEYS.SUMMARIES, []);
  const idx = all.findIndex((s) => s.id === summary.id);
  if (idx >= 0) {
    all[idx] = summary;
  } else {
    all.unshift(summary);
  }
  setItem(STORAGE_KEYS.SUMMARIES, all);
}

export function deleteSummary(id: string): void {
  const all = getItem<DoctorSummaryDraft[]>(STORAGE_KEYS.SUMMARIES, []);
  setItem(
    STORAGE_KEYS.SUMMARIES,
    all.filter((s) => s.id !== id)
  );
}

// Chronological Unified Timeline Aggregator
export function getUnifiedTimeline(patientId?: string): TimelineEvent[] {
  const targetId = patientId || getCurrentPatient().id;
  const checkins = getCheckins(targetId);
  const symptoms = getSymptoms(targetId);
  const medications = getMedications(targetId);
  const documents = getDocuments(targetId);
  const consultations = getConsultations(targetId);
  const appointments = getAppointments(targetId);

  const events: TimelineEvent[] = [];

  // 1. Consultations
  consultations.forEach((con) => {
    events.push({
      id: `timeline-con-${con.id}`,
      originalId: con.id,
      patientId: con.patientId,
      date: con.date,
      type: 'consultation',
      title: `Consultation: ${con.doctorName} (${con.doctorSpecialty})`,
      description: `${con.clinicOrHospital}: ${con.reasonForConsultation}. Treatment: ${con.treatmentPrescribed}`,
      clinician: con.doctorName,
      patientResponse: con.patientResponse,
      sourceLabel: 'Doctor Consultation',
      sourceCategory: 'clinician',
      rawPayload: con,
    });
  });

  // 2. Symptoms
  symptoms.forEach((sym) => {
    events.push({
      id: `timeline-sym-${sym.id}`,
      originalId: sym.id,
      patientId: sym.patientId,
      date: sym.date,
      time: sym.time,
      type: 'symptom',
      title: `Symptom: ${sym.name}`,
      description: `Location: ${sym.bodyLocation}. Severity: ${sym.severity}/10. Status: ${sym.status}. Notes: ${sym.notes}`,
      severity: sym.severity,
      status: sym.status,
      sourceLabel: 'Patient Reported',
      sourceCategory: 'patient',
      isFlagged: sym.severity >= 8 || sym.status === 'worsening' || sym.status === 'recurring',
      rawPayload: sym,
    });
  });

  // 3. Medications
  medications.forEach((med) => {
    events.push({
      id: `timeline-med-${med.id}`,
      originalId: med.id,
      patientId: med.patientId,
      date: med.startDate,
      type: 'medication',
      title: `Rx Started: ${med.name} ${med.dose} ${med.units}`,
      description: `Schedule: ${med.schedule}. Prescriber: ${med.prescribingClinician || 'Unspecified'}. Indication: ${med.indication || 'Not recorded'}`,
      patientResponse: med.patientObservedResponse,
      sourceLabel: 'Prescription Document',
      sourceCategory: 'document',
      rawPayload: med,
    });

    // Also include key adherence events if logged
    if (med.adherenceHistory && med.adherenceHistory.length > 0) {
      med.adherenceHistory.forEach((adh) => {
        if (adh.status === 'missed' || adh.reason) {
          events.push({
            id: `timeline-adh-${adh.id}`,
            originalId: med.id,
            patientId: med.patientId,
            date: adh.date,
            time: adh.time,
            type: 'adherence',
            title: `Medication Adherence: ${med.name} (${adh.status})`,
            description: `Dose marked ${adh.status.toUpperCase()}.${adh.reason ? ` Reason: ${adh.reason}` : ''}${adh.notes ? ` Notes: ${adh.notes}` : ''}`,
            sourceLabel: 'Patient Reported',
            sourceCategory: 'patient',
            rawPayload: { ...adh, medicationName: med.name },
          });
        }
      });
    }
  });

  // 4. Documents
  documents.forEach((doc) => {
    events.push({
      id: `timeline-doc-${doc.id}`,
      originalId: doc.id,
      patientId: doc.patientId,
      date: doc.date,
      type: 'document',
      title: `Document Uploaded: ${doc.title}`,
      description: `Category: ${doc.category} (${doc.fileType}). ${doc.notes || ''}`,
      category: doc.category,
      sourceLabel: doc.category === 'Laboratory Report' ? 'Lab Record' : 'Prescription Document',
      sourceCategory: 'document',
      rawPayload: doc,
    });
  });

  // 5. Daily Check-ins
  checkins.forEach((chk) => {
    const hasVitals = chk.measurements && Object.keys(chk.measurements).length > 0;
    const vitalsStr = hasVitals
      ? [
          chk.measurements?.bloodPressureSystolic
            ? `BP: ${chk.measurements.bloodPressureSystolic}/${chk.measurements.bloodPressureDiastolic} mmHg`
            : null,
          chk.measurements?.temperature ? `Temp: ${chk.measurements.temperature}°C` : null,
          chk.measurements?.pulse ? `Pulse: ${chk.measurements.pulse} bpm` : null,
        ]
          .filter(Boolean)
          .join(', ')
      : '';

    events.push({
      id: `timeline-chk-${chk.id}`,
      originalId: chk.id,
      patientId: chk.patientId,
      date: chk.date,
      time: chk.time,
      type: 'daily_checkin',
      title: `Daily Check-in (Wellbeing: ${chk.wellbeing})`,
      description: `Energy: ${chk.energy}.${chk.discomfort ? ` Discomfort: ${chk.discomfort}.` : ''}${vitalsStr ? ` [Vitals: ${vitalsStr}].` : ''} ${chk.notes || ''}`,
      sourceLabel: 'Patient Reported',
      sourceCategory: 'patient',
      rawPayload: chk,
    });
  });

  // 6. Appointments
  appointments.forEach((apt) => {
    events.push({
      id: `timeline-apt-${apt.id}`,
      originalId: apt.id,
      patientId: apt.patientId,
      date: apt.date,
      time: apt.time,
      type: 'appointment',
      title: `Scheduled Visit: ${apt.title}`,
      description: `Doctor: ${apt.doctorName} (${apt.specialty}) at ${apt.location}. Reason: ${apt.reason}`,
      sourceLabel: 'Doctor Consultation',
      sourceCategory: 'clinician',
      rawPayload: apt,
    });
  });

  // 7. Menstrual Cycles
  const menstrualCycles = getMenstrualCycles(targetId);
  menstrualCycles.forEach((cycle) => {
    events.push({
      id: `timeline-cycle-${cycle.id}`,
      originalId: cycle.id,
      patientId: cycle.patientId,
      date: cycle.startDate,
      type: 'menstrual_period',
      title: `Menstrual Period Started (Cycle Length: ${cycle.cycleLengthDays ? `${cycle.cycleLengthDays}d` : 'Recorded'})`,
      description: `Bleeding Duration: ${cycle.bleedingDays || cycle.dailyFlows?.length || 5} days. Max Pain: ${cycle.symptoms?.crampsSeverity !== undefined ? `${cycle.symptoms.crampsSeverity}/10` : 'None reported'}. ${cycle.notes || ''}`,
      severity: cycle.symptoms?.crampsSeverity,
      sourceLabel: 'Patient Reported',
      sourceCategory: 'patient',
      rawPayload: cycle,
    });
  });

  // 8. Pregnancy Wellness Logs
  const wellnessLogs = getPregnancyWellnessLogs(targetId);
  wellnessLogs.forEach((w) => {
    const kickStr = w.fetalMovement?.feltToday
      ? ` | Fetal Kicks: ${w.fetalMovement.kickCount ? `${w.fetalMovement.kickCount} kicks` : 'Active'}`
      : '';
    events.push({
      id: `timeline-well-${w.id}`,
      originalId: w.id,
      patientId: w.patientId,
      date: w.date,
      type: 'pregnancy_wellness',
      title: `Pregnancy Wellness Log (${w.mood?.moodStatus || 'Normal'})`,
      description: `Hydration: ${w.hydration?.approxLiters ? `${w.hydration.approxLiters}L` : 'Logged'} | Sleep: ${w.sleep?.estimatedDurationHours ? `${w.sleep.estimatedDurationHours}h` : 'Logged'}${kickStr}. ${w.nutrition?.mealsSummary ? `Nutrition: ${w.nutrition.mealsSummary.substring(0, 70)}...` : ''}`,
      sourceLabel: 'Patient Reported',
      sourceCategory: 'patient',
      rawPayload: w,
    });
  });

  // 9. Health Measurements (Vitals, Weight, Fundal Height)
  const healthMeasurements = getHealthMeasurements(targetId);
  healthMeasurements.forEach((m) => {
    const bpStr = m.bloodPressureSystolic ? `BP: ${m.bloodPressureSystolic}/${m.bloodPressureDiastolic} mmHg` : '';
    const wtStr = m.weightKg ? `Weight: ${m.weightKg} kg` : '';
    const fhrStr = m.fetalHeartRateBpm ? `FHR: ${m.fetalHeartRateBpm} bpm` : '';
    const details = [bpStr, wtStr, fhrStr].filter(Boolean).join(', ');

    events.push({
      id: `timeline-meas-${m.id}`,
      originalId: m.id,
      patientId: m.patientId,
      date: m.date,
      time: m.time,
      type: 'prenatal_vital',
      title: `Health Measurement (${m.source.replace('_', ' ')})`,
      description: `${details || 'Recorded vitals'}. ${m.notes || ''}`,
      sourceLabel: m.source === 'clinician_recorded' ? 'Doctor Consultation' : 'Patient Reported',
      sourceCategory: m.source === 'clinician_recorded' ? 'clinician' : 'patient',
      isFlagged: Boolean((m.bloodPressureSystolic && m.bloodPressureSystolic >= 140) || (m.bloodPressureDiastolic && m.bloodPressureDiastolic >= 90)),
      rawPayload: m,
    });
  });

  // 10. Ultrasound Report Analyses
  const ultrasoundAnalyses = getUltrasoundAnalyses(targetId);
  ultrasoundAnalyses.forEach((us) => {
    events.push({
      id: `timeline-us-${us.id}`,
      originalId: us.id,
      patientId: us.patientId,
      date: us.reportDate || new Date().toISOString().split('T')[0],
      type: 'ultrasound',
      title: `Ultrasound Analysis: ${us.scanType}`,
      description: `Gestational Age by Scan: ${us.gestationalAgeByScan || 'Unspecified'}. Placenta: ${us.placentalDescription || 'Recorded'}. AFI: ${us.amnioticFluidDescription || 'Recorded'}.`,
      category: 'Imaging Report',
      sourceLabel: 'Lab Record',
      sourceCategory: 'document',
      rawPayload: us,
    });
  });

  // 11. Warning Sign Alerts
  const warningAlerts = getWarningAlerts(targetId);
  warningAlerts.forEach((warn) => {
    events.push({
      id: `timeline-warn-${warn.id}`,
      originalId: warn.id,
      patientId: warn.patientId,
      date: warn.timestamp.split('T')[0],
      type: 'symptom',
      title: `⚠️ Urgent Warning Sign: ${warn.title}`,
      description: `${warn.urgency}: ${warn.actionGuidanceGiven}. ${warn.userNotes ? `Patient note: ${warn.userNotes}` : ''}`,
      sourceLabel: 'Patient Reported',
      sourceCategory: 'patient',
      isFlagged: true,
      rawPayload: warn,
    });
  });

  // Sort descending by default (newest first), but date is standardized YYYY-MM-DD
  return events.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeB.localeCompare(timeA);
  });
}

// ==========================================
// WOMEN'S HEALTH, PREGNANCY & MENSTRUAL CRUD
// ==========================================

export function getPregnancyProfile(patientId: string): PregnancyProfile | null {
  const profiles = getItem<PregnancyProfile[]>(STORAGE_KEYS.PREGNANCY_PROFILES, []);
  const found = profiles.find((p) => p.patientId === patientId);
  return found || null;
}

export function savePregnancyProfile(profile: PregnancyProfile): void {
  const profiles = getItem<PregnancyProfile[]>(STORAGE_KEYS.PREGNANCY_PROFILES, []);
  const idx = profiles.findIndex((p) => p.patientId === profile.patientId);
  if (idx >= 0) {
    profiles[idx] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    profiles.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItem(STORAGE_KEYS.PREGNANCY_PROFILES, profiles);
}

export function getMenstrualCycles(patientId: string): MenstrualCycleEntry[] {
  const cycles = getItem<MenstrualCycleEntry[]>(STORAGE_KEYS.MENSTRUAL_CYCLES, []);
  return cycles
    .filter((c) => c.patientId === patientId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function saveMenstrualCycle(cycle: MenstrualCycleEntry): void {
  const cycles = getItem<MenstrualCycleEntry[]>(STORAGE_KEYS.MENSTRUAL_CYCLES, []);
  const idx = cycles.findIndex((c) => c.id === cycle.id);
  if (idx >= 0) {
    cycles[idx] = { ...cycle, updatedAt: new Date().toISOString() };
  } else {
    cycles.push({ ...cycle, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItem(STORAGE_KEYS.MENSTRUAL_CYCLES, cycles);
}

export function deleteMenstrualCycle(id: string): void {
  const cycles = getItem<MenstrualCycleEntry[]>(STORAGE_KEYS.MENSTRUAL_CYCLES, []);
  setItem(
    STORAGE_KEYS.MENSTRUAL_CYCLES,
    cycles.filter((c) => c.id !== id)
  );
}

export function getPregnancyWellnessLogs(patientId: string): PregnancyWellnessLog[] {
  const logs = getItem<PregnancyWellnessLog[]>(STORAGE_KEYS.PREGNANCY_WELLNESS, []);
  return logs
    .filter((l) => l.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function savePregnancyWellnessLog(log: PregnancyWellnessLog): void {
  const logs = getItem<PregnancyWellnessLog[]>(STORAGE_KEYS.PREGNANCY_WELLNESS, []);
  const idx = logs.findIndex((l) => l.id === log.id || (l.patientId === log.patientId && l.date === log.date));
  if (idx >= 0) {
    logs[idx] = { ...log, updatedAt: new Date().toISOString() };
  } else {
    logs.push({ ...log, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  setItem(STORAGE_KEYS.PREGNANCY_WELLNESS, logs);
}

export function deletePregnancyWellnessLog(id: string): void {
  const logs = getItem<PregnancyWellnessLog[]>(STORAGE_KEYS.PREGNANCY_WELLNESS, []);
  setItem(
    STORAGE_KEYS.PREGNANCY_WELLNESS,
    logs.filter((l) => l.id !== id)
  );
}

export function getHealthMeasurements(patientId: string): HealthMeasurement[] {
  const measurements = getItem<HealthMeasurement[]>(STORAGE_KEYS.HEALTH_MEASUREMENTS, []);
  return measurements
    .filter((m) => m.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveHealthMeasurement(measurement: HealthMeasurement): void {
  const measurements = getItem<HealthMeasurement[]>(STORAGE_KEYS.HEALTH_MEASUREMENTS, []);
  const idx = measurements.findIndex((m) => m.id === measurement.id);
  if (idx >= 0) {
    measurements[idx] = measurement;
  } else {
    measurements.push(measurement);
  }
  setItem(STORAGE_KEYS.HEALTH_MEASUREMENTS, measurements);
}

export function deleteHealthMeasurement(id: string): void {
  const measurements = getItem<HealthMeasurement[]>(STORAGE_KEYS.HEALTH_MEASUREMENTS, []);
  setItem(
    STORAGE_KEYS.HEALTH_MEASUREMENTS,
    measurements.filter((m) => m.id !== id)
  );
}

export function getUltrasoundAnalyses(patientId: string): UltrasoundReportAnalysis[] {
  const analyses = getItem<UltrasoundReportAnalysis[]>(STORAGE_KEYS.ULTRASOUND_ANALYSES, []);
  return analyses.filter((a) => a.patientId === patientId);
}

export function saveUltrasoundAnalysis(analysis: UltrasoundReportAnalysis): void {
  const analyses = getItem<UltrasoundReportAnalysis[]>(STORAGE_KEYS.ULTRASOUND_ANALYSES, []);
  const idx = analyses.findIndex((a) => a.id === analysis.id || a.documentId === analysis.documentId);
  if (idx >= 0) {
    analyses[idx] = analysis;
  } else {
    analyses.push(analysis);
  }
  setItem(STORAGE_KEYS.ULTRASOUND_ANALYSES, analyses);
}

export function deleteUltrasoundAnalysis(id: string): void {
  const analyses = getItem<UltrasoundReportAnalysis[]>(STORAGE_KEYS.ULTRASOUND_ANALYSES, []);
  setItem(
    STORAGE_KEYS.ULTRASOUND_ANALYSES,
    analyses.filter((a) => a.id !== id)
  );
}

export function getWarningAlerts(patientId: string): WarningSignAlert[] {
  const alerts = getItem<WarningSignAlert[]>(STORAGE_KEYS.WARNING_ALERTS, []);
  return alerts.filter((a) => a.patientId === patientId);
}

export function saveWarningAlert(alert: WarningSignAlert): void {
  const alerts = getItem<WarningSignAlert[]>(STORAGE_KEYS.WARNING_ALERTS, []);
  alerts.push(alert);
  setItem(STORAGE_KEYS.WARNING_ALERTS, alerts);
}
