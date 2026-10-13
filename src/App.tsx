/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// View modules
import { DashboardView } from './components/dashboard/DashboardView';
import { HealthTimelineView } from './components/timeline/HealthTimelineView';
import { DailyCheckinView } from './components/daily-checkin/DailyCheckinView';
import { SymptomTrackerView } from './components/symptoms/SymptomTrackerView';
import { MedicationTrackerView } from './components/medications/MedicationTrackerView';
import { DocumentVaultView } from './components/documents/DocumentVaultView';
import { ConsultationView } from './components/consultations/ConsultationView';
import { DoctorSummaryView } from './components/summary/DoctorSummaryView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { PatientProfileView } from './components/profile/PatientProfileView';
import { HealthEducationAssistantView } from './components/assistant/HealthEducationAssistantView';
import { HealthRisksView } from './components/risks/HealthRisksView';
import { WomensHealthHubView } from './components/womens-health/WomensHealthHubView';

// Modals
import { DailyCheckinModal } from './components/daily-checkin/DailyCheckinModal';
import { SymptomModal } from './components/symptoms/SymptomModal';
import { MedicationModal } from './components/medications/MedicationModal';
import { LogAdherenceModal } from './components/medications/LogAdherenceModal';
import { DocumentUploadModal } from './components/documents/DocumentUploadModal';
import { DocumentDetailModal } from './components/documents/DocumentDetailModal';
import { ConsultationModal } from './components/consultations/ConsultationModal';
import { AppointmentModal } from './components/appointments/AppointmentModal';
import { EmergencyAlertModal } from './components/common/EmergencyAlertModal';
import { MultilingualVoiceModal } from './components/voice/MultilingualVoiceModal';
import { VoiceAssistantView } from './components/voice/VoiceAssistantView';

// Storage and types
import {
  initializeStorageIfEmpty,
  subscribeToStorage,
  getPatients,
  getCurrentPatient,
  setCurrentPatientId,
  getCheckins,
  getSymptoms,
  getMedications,
  getDocuments,
  getConsultations,
  getAppointments,
  getUnifiedTimeline,
  resetToDemoData,
  getPregnancyProfile,
  getMenstrualCycles,
  getPregnancyWellnessLogs,
  getHealthMeasurements,
  getUltrasoundAnalyses,
} from './lib/storage';
import {
  PatientProfile,
  DailyHealthEntry,
  SymptomEntry,
  MedicationEntry,
  MedicalDocument,
  ConsultationEntry,
  AppointmentEntry,
  TimelineEvent,
  PregnancyProfile,
  MenstrualCycleEntry,
  PregnancyWellnessLog,
  HealthMeasurement,
  UltrasoundReportAnalysis,
} from './types';
import {
  X,
  Sparkles,
  ShieldAlert,
  Clock,
  Layers,
  HeartPulse,
  Activity,
  Pill,
  FolderLock,
  Stethoscope,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

export default function App() {
  // Initialization
  useEffect(() => {
    initializeStorageIfEmpty();
  }, []);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data states
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(getCurrentPatient());
  const [checkins, setCheckins] = useState<DailyHealthEntry[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [consultations, setConsultations] = useState<ConsultationEntry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentEntry[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Women's Health & Pregnancy States
  const [pregnancyProfile, setPregnancyProfile] = useState<PregnancyProfile | null>(null);
  const [menstrualCycles, setMenstrualCycles] = useState<MenstrualCycleEntry[]>([]);
  const [wellnessLogs, setWellnessLogs] = useState<PregnancyWellnessLog[]>([]);
  const [healthMeasurements, setHealthMeasurements] = useState<HealthMeasurement[]>([]);
  const [ultrasoundAnalyses, setUltrasoundAnalyses] = useState<UltrasoundReportAnalysis[]>([]);

  // Modals state
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinToEdit, setCheckinToEdit] = useState<DailyHealthEntry | null>(null);

  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const [symptomToEdit, setSymptomToEdit] = useState<SymptomEntry | null>(null);

  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState<MedicationEntry | null>(null);

  const [isAdherenceModalOpen, setIsAdherenceModalOpen] = useState(false);
  const [adherenceMedication, setAdherenceMedication] = useState<MedicationEntry | null>(null);

  const [isDocUploadModalOpen, setIsDocUploadModalOpen] = useState(false);
  const [isDocDetailModalOpen, setIsDocDetailModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);

  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationToEdit, setConsultationToEdit] = useState<ConsultationEntry | null>(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentEntry | null>(null);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencySymptomName, setEmergencySymptomName] = useState('');

  // Feature 1: Multilingual Voice Assistant Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Refresh all state from local storage
  const refreshData = useCallback(() => {
    const pts = getPatients();
    setPatients(pts);
    const curr = getCurrentPatient();
    setCurrentPatient(curr);

    const chks = getCheckins(curr.id);
    setCheckins(chks);

    const syms = getSymptoms(curr.id);
    setSymptoms(syms);

    const meds = getMedications(curr.id);
    setMedications(meds);

    const docs = getDocuments(curr.id);
    setDocuments(docs);

    const cons = getConsultations(curr.id);
    setConsultations(cons);

    const apts = getAppointments(curr.id);
    setAppointments(apts);

    const preg = getPregnancyProfile(curr.id);
    setPregnancyProfile(preg);

    const cycles = getMenstrualCycles(curr.id);
    setMenstrualCycles(cycles);

    const logs = getPregnancyWellnessLogs(curr.id);
    setWellnessLogs(logs);

    const meass = getHealthMeasurements(curr.id);
    setHealthMeasurements(meass);

    const uss = getUltrasoundAnalyses(curr.id);
    setUltrasoundAnalyses(uss);

    const timeline = getUnifiedTimeline(curr.id);
    setTimelineEvents(timeline);
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToStorage(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Handle patient switch
  const handleSelectPatient = (patientId: string) => {
    setCurrentPatientId(patientId);
    refreshData();
  };

  // Reset to the October 2025 Ear Pain Demonstration
  const handleResetDemo = () => {
    if (
      confirm(
        'Reset Lifeline AI to the fictional demonstration story (Sarah Jenkins - October 2025 Ear Pain & Recurrence)?'
      )
    ) {
      resetToDemoData();
      refreshData();
    }
  };

  // Timeline Event Click Router
  const handleOpenTimelineEvent = (evt: TimelineEvent) => {
    switch (evt.type) {
      case 'symptom':
        setSymptomToEdit(evt.rawPayload);
        setIsSymptomModalOpen(true);
        break;
      case 'daily_checkin':
        setCheckinToEdit(evt.rawPayload);
        setIsCheckinModalOpen(true);
        break;
      case 'medication':
        setMedicationToEdit(evt.rawPayload);
        setIsMedicationModalOpen(true);
        break;
      case 'adherence':
        // Find parent medication
        const parentMed = medications.find((m) => m.name === evt.rawPayload.medicationName);
        if (parentMed) {
          setAdherenceMedication(parentMed);
          setIsAdherenceModalOpen(true);
        }
        break;
      case 'document':
        setSelectedDoc(evt.rawPayload);
        setIsDocDetailModalOpen(true);
        break;
      case 'consultation':
        setConsultationToEdit(evt.rawPayload);
        setIsConsultationModalOpen(true);
        break;
      case 'appointment':
        setAppointmentToEdit(evt.rawPayload);
        setIsAppointmentModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleSymptomSaved = (saved?: SymptomEntry) => {
    refreshData();
    if (saved && saved.isEmergencyAlertTriggered) {
      setEmergencySymptomName(saved.name);
      setIsEmergencyModalOpen(true);
    }
  };

  // Handle saving confirmed voice-to-text data to patient records
  const handleSaveFromVoice = (target: 'symptom' | 'checkin' | 'consultation' | 'notes', data: any) => {
    if (target === 'symptom') {
      setSymptomToEdit({
        id: `sym-${Date.now()}`,
        patientId: currentPatient.id,
        name: data.entities?.symptomName || 'Voice Reported Symptom',
        bodyLocation: data.entities?.bodyLocation || 'General / Unspecified',
        date: data.date || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        duration: data.entities?.duration || 'Reported via voice',
        severity: data.entities?.severity || 5,
        associatedSymptoms: data.entities?.associatedSymptoms || [],
        status: 'worsening',
        notes: `${data.englishSummary}\n\n[Original ${data.sourceLanguage || 'Speech'}]: "${data.originalText}"`,
        triggersOrContext: data.entities?.timingOrTriggers || undefined,
        source: 'patient_reported',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsSymptomModalOpen(true);
    } else if (target === 'checkin') {
      setCheckinToEdit({
        id: `chk-${Date.now()}`,
        patientId: currentPatient.id,
        date: data.date || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        wellbeing: 'Fair',
        energy: 'Moderate',
        discomfort: data.entities?.symptomName || 'Reported via voice',
        notes: `${data.englishSummary}\n\n[Original]: "${data.originalText}"`,
        symptomsPresent: true,
        symptomSummary: data.englishSummary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsCheckinModalOpen(true);
    } else if (target === 'consultation') {
      setConsultationToEdit({
        id: `con-${Date.now()}`,
        patientId: currentPatient.id,
        date: data.date || new Date().toISOString().split('T')[0],
        clinicOrHospital: 'Upcoming Consultation',
        doctorName: 'Attending Clinician',
        doctorSpecialty: 'General Medicine',
        reasonForConsultation: data.entities?.symptomName || 'Medical visit',
        symptomsReported: `${data.englishSummary}\n\n[Original Speech]: "${data.originalText}"`,
        examinationNotes: '',
        testsOrdered: [],
        treatmentPrescribed: 'To be determined during clinical exam',
        patientResponse: 'Prepared via voice health assistant',
        verifiedByClinician: false,
        notesOrigin: 'patient_recollection',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsConsultationModalOpen(true);
    } else {
      // General Health Notes destination
      setCheckinToEdit({
        id: `chk-${Date.now()}`,
        patientId: currentPatient.id,
        date: data.date || new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        wellbeing: 'Good',
        energy: 'Moderate',
        notes: `Voice Note (${data.sourceLanguage || 'Speech'}):\n${data.englishSummary}\n\nOriginal: "${data.originalText}"`,
        symptomsPresent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setIsCheckinModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentPatient={currentPatient}
        patients={patients}
        onSelectPatient={handleSelectPatient}
        onResetDemo={handleResetDemo}
        onOpenSummary={() => setCurrentTab('summary')}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenProfile={() => setCurrentTab('profile')}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            counts={{
              symptoms: symptoms.length,
              medications: medications.length,
              documents: documents.length,
              consultations: consultations.length,
              checkins: checkins.length,
              timeline: timelineEvents.length,
              cycles: menstrualCycles.length,
            }}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              patient={currentPatient}
              checkins={checkins}
              symptoms={symptoms}
              medications={medications}
              documents={documents}
              consultations={consultations}
              appointments={appointments}
              timelineEvents={timelineEvents}
              onNavigateTab={setCurrentTab}
              onOpenCheckinModal={() => {
                setCheckinToEdit(null);
                setIsCheckinModalOpen(true);
              }}
              onOpenSymptomModal={() => {
                setSymptomToEdit(null);
                setIsSymptomModalOpen(true);
              }}
              onOpenMedicationModal={() => {
                setMedicationToEdit(null);
                setIsMedicationModalOpen(true);
              }}
              onOpenDocumentModal={() => setIsDocUploadModalOpen(true)}
              onOpenConsultationModal={() => {
                setConsultationToEdit(null);
                setIsConsultationModalOpen(true);
              }}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenEvent={handleOpenTimelineEvent}
              onOpenSummary={() => setCurrentTab('summary')}
            />
          )}

          {currentTab === 'womens_health' && (
            <WomensHealthHubView
              patient={currentPatient}
              pregnancyProfile={pregnancyProfile}
              menstrualCycles={menstrualCycles}
              wellnessLogs={wellnessLogs}
              measurements={healthMeasurements}
              ultrasoundAnalyses={ultrasoundAnalyses}
              documents={documents}
              timelineEvents={timelineEvents}
              appointments={appointments}
              initialSubTab="overview"
              onRefresh={refreshData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'pregnancy' && (
            <WomensHealthHubView
              patient={currentPatient}
              pregnancyProfile={pregnancyProfile}
              menstrualCycles={menstrualCycles}
              wellnessLogs={wellnessLogs}
              measurements={healthMeasurements}
              ultrasoundAnalyses={ultrasoundAnalyses}
              documents={documents}
              timelineEvents={timelineEvents}
              appointments={appointments}
              initialSubTab="pregnancy"
              onRefresh={refreshData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'menstrual' && (
            <WomensHealthHubView
              patient={currentPatient}
              pregnancyProfile={pregnancyProfile}
              menstrualCycles={menstrualCycles}
              wellnessLogs={wellnessLogs}
              measurements={healthMeasurements}
              ultrasoundAnalyses={ultrasoundAnalyses}
              documents={documents}
              timelineEvents={timelineEvents}
              appointments={appointments}
              initialSubTab="menstrual"
              onRefresh={refreshData}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'voice' && (
            <VoiceAssistantView
              patient={currentPatient}
              onSaveToDestination={handleSaveFromVoice}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'assistant' && (
            <HealthEducationAssistantView
              patient={currentPatient}
              symptoms={symptoms}
              checkins={checkins}
              medications={medications}
              consultations={consultations}
              documents={documents}
            />
          )}

          {currentTab === 'risks' && (
            <HealthRisksView
              patient={currentPatient}
              onRefresh={refreshData}
              onOpenSummary={() => setCurrentTab('summary')}
            />
          )}

          {currentTab === 'timeline' && (
            <HealthTimelineView
              events={timelineEvents}
              patient={currentPatient}
              onOpenEvent={handleOpenTimelineEvent}
              onOpenSummary={() => setCurrentTab('summary')}
            />
          )}

          {currentTab === 'summary' && (
            <DoctorSummaryView
              patient={currentPatient}
              timelineEvents={timelineEvents}
            />
          )}

          {currentTab === 'checkin' && (
            <DailyCheckinView
              checkins={checkins}
              patient={currentPatient}
              onAddCheckin={() => {
                setCheckinToEdit(null);
                setIsCheckinModalOpen(true);
              }}
              onEditCheckin={(entry) => {
                setCheckinToEdit(entry);
                setIsCheckinModalOpen(true);
              }}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'symptoms' && (
            <SymptomTrackerView
              symptoms={symptoms}
              patient={currentPatient}
              onAddSymptom={() => {
                setSymptomToEdit(null);
                setIsSymptomModalOpen(true);
              }}
              onEditSymptom={(sym) => {
                setSymptomToEdit(sym);
                setIsSymptomModalOpen(true);
              }}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'medications' && (
            <MedicationTrackerView
              medications={medications}
              patient={currentPatient}
              onAddMedication={() => {
                setMedicationToEdit(null);
                setIsMedicationModalOpen(true);
              }}
              onEditMedication={(med) => {
                setMedicationToEdit(med);
                setIsMedicationModalOpen(true);
              }}
              onLogAdherence={(med) => {
                setAdherenceMedication(med);
                setIsAdherenceModalOpen(true);
              }}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentVaultView
              documents={documents}
              patient={currentPatient}
              onUploadDocument={() => setIsDocUploadModalOpen(true)}
              onOpenDocument={(doc) => {
                setSelectedDoc(doc);
                setIsDocDetailModalOpen(true);
              }}
            />
          )}

          {currentTab === 'consultations' && (
            <ConsultationView
              consultations={consultations}
              patient={currentPatient}
              onAddConsultation={() => {
                setConsultationToEdit(null);
                setIsConsultationModalOpen(true);
              }}
              onEditConsultation={(c) => {
                setConsultationToEdit(c);
                setIsConsultationModalOpen(true);
              }}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              patient={currentPatient}
              onAddAppointment={() => {
                setAppointmentToEdit(null);
                setIsAppointmentModalOpen(true);
              }}
              onEditAppointment={(apt) => {
                setAppointmentToEdit(apt);
                setIsAppointmentModalOpen(true);
              }}
              onOpenSummary={() => setCurrentTab('summary')}
              onRefresh={refreshData}
            />
          )}

          {currentTab === 'profile' && (
            <PatientProfileView
              patient={currentPatient}
              onRefresh={refreshData}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMoreMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Mobile Drawer (More menu) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="w-72 bg-white h-full p-5 space-y-5 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900 text-sm">All Sections</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Layers },
                { id: 'timeline', label: 'Health Timeline', icon: Clock },
                { id: 'summary', label: 'Doctor Summary (AI)', icon: Sparkles },
                { id: 'checkin', label: 'Daily Check-in', icon: HeartPulse },
                { id: 'symptoms', label: 'Symptom Tracker', icon: Activity },
                { id: 'medications', label: 'Medications', icon: Pill },
                { id: 'documents', label: 'Document Vault', icon: FolderLock },
                { id: 'consultations', label: 'Doctor Consultations', icon: Stethoscope },
                { id: 'appointments', label: 'Appointments', icon: CalendarDays },
                { id: 'profile', label: 'Patient Profile & Privacy', icon: UserCheck },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id as NavTab);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  handleResetDemo();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-xs font-semibold py-2 px-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 text-left"
              >
                Reset Demo Story (Ear Pain)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <DailyCheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
        entryToEdit={checkinToEdit}
        patientId={currentPatient.id}
        onSaved={refreshData}
      />

      <SymptomModal
        isOpen={isSymptomModalOpen}
        onClose={() => setIsSymptomModalOpen(false)}
        symptomToEdit={symptomToEdit}
        patientId={currentPatient.id}
        onSaved={handleSymptomSaved}
      />

      <MedicationModal
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        medicationToEdit={medicationToEdit}
        patientId={currentPatient.id}
        onSaved={refreshData}
      />

      <LogAdherenceModal
        isOpen={isAdherenceModalOpen}
        onClose={() => setIsAdherenceModalOpen(false)}
        medication={adherenceMedication}
        onSaved={refreshData}
      />

      <DocumentUploadModal
        isOpen={isDocUploadModalOpen}
        onClose={() => setIsDocUploadModalOpen(false)}
        patientId={currentPatient.id}
        onSaved={refreshData}
      />

      <DocumentDetailModal
        isOpen={isDocDetailModalOpen}
        onClose={() => setIsDocDetailModalOpen(false)}
        document={selectedDoc}
        patientId={currentPatient.id}
        onUpdated={refreshData}
      />

      <ConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        consultationToEdit={consultationToEdit}
        patientId={currentPatient.id}
        onSaved={refreshData}
      />

      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        appointmentToEdit={appointmentToEdit}
        patientId={currentPatient.id}
        onSaved={refreshData}
      />

      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        symptomName={emergencySymptomName}
      />

      <MultilingualVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        patient={currentPatient}
        onSaveToDestination={handleSaveFromVoice}
      />
    </div>
  );
}
