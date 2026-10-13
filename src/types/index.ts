export type HealthWellbeing = 'Great' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
export type EnergyLevel = 'High' | 'Moderate' | 'Low' | 'Exhausted';
export type SleepQuality = 'Restful' | 'Average' | 'Poor' | 'Restless';
export type StressLevel = 'Low' | 'Moderate' | 'High' | 'Severe';
export type SymptomStatus = 'improving' | 'worsening' | 'recurring' | 'resolved' | 'unchanged';
export type AdherenceStatus = 'taken' | 'missed' | 'skipped' | 'not_recorded';
export type DocumentCategory =
  | 'Prescription'
  | 'Laboratory Report'
  | 'Discharge Summary'
  | 'Imaging Report'
  | 'Consultation Note'
  | 'Vaccination Record'
  | 'Other';

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface TobaccoRiskProfile {
  status:
    | 'never'
    | 'current_smoker'
    | 'current_smokeless'
    | 'current_both'
    | 'former_smoker'
    | 'former_smokeless'
    | 'former_both';
  smokingType?: string; // e.g. Bidi, Cigarettes, Hookah
  smokelessType?: string; // e.g. Gutkha, Khaini, Zarda, Paan Masala
  durationYears?: number;
  frequencyPerDay?: string; // e.g. 5 bidis/day, 3 packets gutkha/day
  quitYearsAgo?: number;
  quitMotivation?: string;
  alcoholUse?: 'none' | 'occasional' | 'moderate' | 'heavy';
  physicalActivityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  dietNotes?: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  sex: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  bloodType?: string;
  allergies: string[];
  conditions: string[]; // Pre-existing conditions
  familyHistory: string[];
  emergencyContact?: EmergencyContact;
  currentMedications: string[];
  tobaccoRisk?: TobaccoRiskProfile;
  womensHealthSettings?: {
    enablePregnancyTracking: boolean;
    enableMenstrualTracking: boolean;
  };
  isDemoPatient: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProcessedResult {
  originalTranscription: string;
  englishMedicalSummary: string;
  detectedLanguage: string;
  confidence: 'high' | 'medium' | 'low';
  clinicalEntities?: {
    symptomName?: string;
    bodyLocation?: string;
    duration?: string;
    severity?: number | null;
    associatedSymptoms?: string[];
    timingOrTriggers?: string;
    negations?: string[];
    uncertainties?: string[];
    unclearDetails?: string[];
    suggestedTarget?: 'symptom' | 'checkin' | 'consultation' | 'notes';
  };
}

export interface LifestyleData {
  sleepHours?: number;
  sleepQuality?: SleepQuality;
  waterIntakeLiters?: number;
  physicalActivity?: string;
  sedentaryHours?: number;
  dietNotes?: string;
  stressLevel?: StressLevel;
}

export interface MeasurementsData {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  temperature?: number;
  weight?: number;
  oxygenSaturation?: number;
  bloodGlucose?: number;
}

export interface CheckinMedicationStatus {
  medicationId: string;
  medicationName: string;
  status: AdherenceStatus;
  reason?: string;
}

export interface DailyHealthEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  wellbeing: HealthWellbeing;
  energy: EnergyLevel;
  discomfort?: string;
  notes?: string;
  lifestyle?: LifestyleData;
  symptomsPresent: boolean;
  symptomSummary?: string;
  measurements?: MeasurementsData;
  medicationAdherence?: CheckinMedicationStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface SymptomEntry {
  id: string;
  patientId: string;
  name: string;
  bodyLocation: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string;
  severity: number; // 1-10
  associatedSymptoms: string[];
  status: SymptomStatus;
  notes: string;
  triggersOrContext?: string;
  isEmergencyAlertTriggered?: boolean;
  source: 'patient_reported';
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAdherenceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AdherenceStatus;
  reason?: string;
  notes?: string;
}

export interface MedicationEntry {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  units: string;
  schedule: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  prescribingClinician?: string;
  indication?: string;
  instructions?: string;
  active: boolean;
  adherenceHistory: MedicationAdherenceRecord[];
  patientObservedResponse?: string;
  source: 'prescription_record' | 'patient_entered';
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  category: DocumentCategory;
  date: string; // Document date
  uploadDate: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData?: string; // Base64 or mock thumbnail preview
  notes?: string;
  associatedConsultationId?: string;
  extractedText?: string;
  isMachineExtracted: boolean;
  isVerifiedByClinician: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  clinicOrHospital: string;
  doctorName: string;
  doctorSpecialty: string;
  reasonForConsultation: string;
  symptomsReported: string;
  examinationNotes: string;
  testsOrdered: string[];
  treatmentPrescribed: string;
  followUpDate?: string;
  associatedDocumentIds?: string[];
  patientResponse: string; // Patient-observed response after treatment
  verifiedByClinician: boolean;
  notesOrigin: 'patient_recollection' | 'clinical_discharge_summary' | 'prescription_copy';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentEntry {
  id: string;
  patientId: string;
  title: string;
  doctorName: string;
  specialty: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminderNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TimelineEventType =
  | 'daily_checkin'
  | 'symptom'
  | 'medication'
  | 'adherence'
  | 'document'
  | 'consultation'
  | 'measurement'
  | 'appointment'
  | 'menstrual_period'
  | 'pregnancy_milestone'
  | 'pregnancy_wellness'
  | 'ultrasound'
  | 'prenatal_vital';

export interface TimelineEvent {
  id: string;
  originalId: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: TimelineEventType;
  title: string;
  description: string;
  category?: string;
  severity?: number;
  status?: string;
  clinician?: string;
  patientResponse?: string;
  sourceLabel: 'Patient Reported' | 'Prescription Document' | 'Doctor Consultation' | 'Lab Record' | 'Vitals Device';
  sourceCategory: 'patient' | 'document' | 'clinician';
  isFlagged?: boolean;
  rawPayload: any;
}

export interface DoctorSummaryDraft {
  id: string;
  patientId: string;
  dateGenerated: string;
  dateRange: { from: string; to: string };
  chiefComplaint: string;
  isAIGenerated: boolean;
  modelUsed: string;
  disclaimer: string;
  sections: {
    patientBackground: string;
    allergiesAndRisks: string;
    currentMedications: string;
    chronologicalCourse: string;
    symptomsEvolution: string;
    treatmentHistoryAndResponses: string;
    measurementsAndLabHighlights: string;
    medicationAdherenceSummary: string;
    missingOrIncompleteInfo: string;
    suggestedQuestionsForDoctor: string[];
  };
  patientReviewed: boolean;
  patientNotes?: string;
  createdAt: string;
}

// ==========================================
// WOMEN'S HEALTH, PREGNANCY & MENSTRUAL TYPES
// ==========================================

export type PregnancyDatingMethod =
  | 'lmp' // First day of last menstrual period
  | 'edd_clinician' // Estimated due date provided by clinician
  | 'gestational_age_clinician' // Gestational age documented by clinician
  | 'unconfirmed';

export interface PregnancyProfile {
  id: string;
  patientId: string;
  isActive: boolean;
  datingMethod: PregnancyDatingMethod;
  lmpDate?: string; // YYYY-MM-DD
  clinicianEdd?: string; // YYYY-MM-DD
  clinicianGestationalWeeks?: number;
  clinicianGestationalDays?: number;
  clinicianAssessmentDate?: string; // Date when clinician estimated weeks
  datingSourceNotes: string; // e.g. "Dating ultrasound at 8w3d by Dr. Mehra"
  hasConflictingDates?: boolean;
  conflictExplanation?: string;
  bloodType?: string;
  rhFactor?: 'Positive' | 'Negative' | 'Unknown';
  gravida?: number;
  para?: number;
  hospitalMaternityContact?: {
    hospitalName: string;
    triagePhone: string;
    consultantName?: string;
    location?: string;
  };
  emergencyObstetricContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  birthPlanNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MenstrualFlowLevel = 'spotting' | 'light' | 'moderate' | 'heavy' | 'unusually_heavy';

export interface DailyMenstrualFlow {
  date: string; // YYYY-MM-DD
  flow: MenstrualFlowLevel;
  notes?: string;
}

export interface MenstrualCycleEntry {
  id: string;
  patientId: string;
  startDate: string; // First day of menstrual bleeding (YYYY-MM-DD)
  endDate?: string; // Last day of bleeding (YYYY-MM-DD)
  bleedingDays?: number; // Days of bleeding
  cycleLengthDays?: number; // Days from previous period start to this period start
  isRegular?: boolean;
  dailyFlows: DailyMenstrualFlow[];
  symptoms: {
    crampsSeverity?: number; // 0-10 scale
    lowerAbdominalPain?: boolean;
    backPain?: boolean;
    headache?: boolean;
    bloating?: boolean;
    fatigue?: boolean;
    moodChanges?: string;
    nausea?: boolean;
    otherSymptoms?: string;
    interferesWithDailyActivities?: boolean;
    isNewOrDifferent?: boolean;
    trajectory?: 'improving' | 'worsening' | 'unchanged';
    timingRelativeToBleeding?: 'before' | 'during' | 'after';
  };
  clotsNoticed?: boolean;
  clotSizeCategory?: 'none' | 'dime_or_smaller' | 'quarter_sized' | 'large_concerning';
  unusualBleedingNotes?: string;
  bleedingBetweenPeriods?: boolean;
  bleedingAfterIntercourse?: boolean;
  painReliefMedication?: {
    used: boolean;
    name?: string;
    dose?: string;
    dateTime?: string;
    effective?: 'full_relief' | 'partial_relief' | 'no_relief';
    sideEffects?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PregnancyWellnessLog {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  nutrition: {
    mealsSummary?: string;
    fruitsAndVegetablesServings?: number;
    proteinSources?: string[];
    dairyOrCalciumSources?: string[];
    nauseaSeverity?: 'none' | 'mild' | 'moderate' | 'severe';
    appetiteChange?: 'normal' | 'increased' | 'decreased' | 'food_aversions';
    notes?: string;
  };
  hydration: {
    approxLiters?: number;
    glassesCount?: number;
    difficultyDrinkingFluids?: boolean;
    reminderEnabled?: boolean;
  };
  sleep: {
    bedtime?: string;
    wakeTime?: string;
    estimatedDurationHours?: number;
    quality?: 'Restful' | 'Average' | 'Poor' | 'Restless';
    nightAwakenings?: number;
    difficultiesNotes?: string;
  };
  activity: {
    type?: string; // Walking, prenatal yoga, swimming, etc.
    durationMinutes?: number;
    steps?: number;
    fatigueLevel?: 'none' | 'mild' | 'moderate' | 'exhausted';
    limitationsNotes?: string;
  };
  mood: {
    moodStatus?: 'Happy' | 'Calm' | 'Anxious' | 'Overwhelmed' | 'Sad' | 'Neutral';
    stressLevel?: StressLevel;
    energyLevel?: EnergyLevel;
    notes?: string;
  };
  fetalMovement?: {
    feltToday?: boolean;
    movementPattern?: 'active_normal' | 'reduced_noticeably' | 'not_yet_applicable';
    kickCountPeriodMinutes?: number;
    kickCount?: number;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthMeasurement {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseBpm?: number;
  temperatureC?: number;
  bloodGlucoseMgDl?: number;
  bloodGlucoseContext?: 'fasting' | 'post_prandial_1h' | 'post_prandial_2h' | 'random';
  oxygenSaturationPercent?: number;
  fundalHeightCm?: number;
  fetalHeartRateBpm?: number;
  source: 'patient_entered' | 'device_measured' | 'clinician_recorded';
  referenceReportId?: string;
  notes?: string;
  createdAt: string;
}

export interface UltrasoundMeasurementItem {
  name: string; // e.g. CRL (Crown-Rump Length), BPD, HC, AC, FL, AFI
  value: string; // e.g. "45 mm"
  unit?: string;
  referenceRange?: string; // e.g. "Corresponds to 11w2d +/- 5d"
}

export interface UltrasoundReportAnalysis {
  id: string;
  documentId: string;
  patientId: string;
  reportDate?: string;
  scanType: 'First Trimester Dating / NT' | 'Anomaly Scan (Level II)' | 'Growth / Doppler Scan' | 'Routine Prenatal' | 'Gynecological Pelvic';
  gestationalAgeByScan?: string; // e.g. "20 weeks 3 days"
  measurements: UltrasoundMeasurementItem[];
  placentalDescription?: string; // e.g. "Posterior, high, grade 1, away from internal os"
  amnioticFluidDescription?: string; // e.g. "Adequate, AFI: 14 cm"
  fetalHeartRateBpm?: number;
  findingsExplicit: string[]; // Verbatim from report
  plainLanguageExplanation: string; // Plain language breakdown of terms
  unclearOrMissingDetails: string[];
  questionsForGynecologist: string[];
  requiresClinicianReview: boolean;
  createdAt: string;
}

export interface PrenatalAppointmentDetails {
  id: string;
  patientId: string;
  title: string;
  appointmentType: 'prenatal_consultation' | 'ultrasound' | 'lab_investigation' | 'follow_up' | 'specialist_referral';
  doctorOrFacility: string;
  location?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  gestationalWeekAtVisit?: number;
  preparationInstructions?: string; // e.g. "Drink 1L water 1 hour before scan; do not void"
  remindersConfigured: ('1_week_before' | '1_day_before' | '2_hours_before')[];
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  createdAt: string;
}

export interface WarningSignAlert {
  id: string;
  patientId: string;
  timestamp: string;
  signType:
    | 'amniotic_fluid_leak'
    | 'vaginal_bleeding'
    | 'severe_abdominal_pain'
    | 'severe_headache_visual_changes'
    | 'reduced_fetal_movement'
    | 'seizures_consciousness_loss'
    | 'chest_pain_shortness_of_breath'
    | 'high_fever_chills'
    | 'unilateral_leg_swelling';
  title: string;
  urgency: 'EMERGENCY_IMMEDIATE' | 'URGENT_ASSESSMENT_SAME_DAY';
  userNotes?: string;
  actionGuidanceGiven: string;
  wasFacilityContacted?: boolean;
}
