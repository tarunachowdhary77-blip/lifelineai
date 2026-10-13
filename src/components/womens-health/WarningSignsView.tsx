import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Droplets,
  Eye,
  Activity,
  Heart,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import { PregnancyProfile, WarningSignAlert } from '../../types';
import { saveWarningAlert } from '../../lib/storage';

interface Props {
  pregnancyProfile?: PregnancyProfile | null;
  onRefresh?: () => void;
}

export const WarningSignsView: React.FC<Props> = ({ pregnancyProfile, onRefresh }) => {
  const [selectedEmergencySign, setSelectedEmergencySign] = useState<string | null>(null);
  const [actionLogged, setActionLogged] = useState(false);

  const emergencyWarningSigns = [
    {
      id: 'amniotic_fluid_leak',
      title: 'Sudden Gush or Trickle of Fluid from Vagina (Possible Water Breaking)',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeColor: 'bg-rose-600 text-white',
      badge: 'IMMEDIATE ACTION REQUIRED',
      description:
        'Leakage of amniotic fluid before labor or at any gestational week requires urgent evaluation. Fluid may be clear, pinkish, or greenish/brown.',
      criticalGuidance:
        'Amniotic fluid leakage cannot be confirmed or excluded by this app. Contact your hospital maternity triage unit or seek urgent obstetric assessment immediately. Do not wait for a diary entry, chatbot reply, or next appointment.',
    },
    {
      id: 'vaginal_bleeding',
      title: 'Vaginal Bleeding in Pregnancy',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeColor: 'bg-rose-600 text-white',
      badge: 'EMERGENCY ASSESSMENT',
      description:
        'Any bright red vaginal bleeding, heavy bleeding with clots, or bleeding accompanied by abdominal pain or cramping.',
      criticalGuidance:
        'Contact your obstetrician or proceed to the nearest emergency hospital maternity unit immediately for ultrasound and clinical examination.',
    },
    {
      id: 'severe_headache_visual_changes',
      title: 'Severe Headache, Flashing Lights, or Blurred Vision (Pre-eclampsia Warning)',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeColor: 'bg-amber-600 text-white',
      badge: 'URGENT MATERNITY ASSESSMENT',
      description:
        'A persistent, throbbing headache that does not respond to resting, seeing spots or flashing lights, new blurred vision, or sudden intense swelling of face/hands.',
      criticalGuidance:
        'These may be red-flag signs of elevated blood pressure or pre-eclampsia. Check your blood pressure and seek prompt emergency maternity assessment.',
    },
    {
      id: 'reduced_fetal_movement',
      title: 'Marked Reduction or Cessation of Fetal Movement',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeColor: 'bg-rose-600 text-white',
      badge: 'IMMEDIATE OBSTETRIC CHECK',
      description:
        'If you are past 24–28 weeks and establish a regular kick pattern, a noticeable slowdown or absence of kicks is a red flag.',
      criticalGuidance:
        'Do not wait until tomorrow or assume the baby is just sleeping. Go directly to your maternity hospital for immediate cardiotocography (CTG) or Doppler fetal heart monitoring.',
    },
    {
      id: 'severe_abdominal_pain',
      title: 'Severe or Persistent Abdominal or Pelvic Pain',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeColor: 'bg-rose-600 text-white',
      badge: 'URGENT CLINICAL CARE',
      description:
        'Intense, unrelenting pain in the lower abdomen, right upper quadrant pain under ribs, or sharp unilateral pain.',
      criticalGuidance:
        'Requires immediate medical evaluation to exclude placental abruption, severe pre-eclampsia (epigastric pain), or acute surgical conditions.',
    },
    {
      id: 'chest_pain_shortness_of_breath',
      title: 'Chest Pain or Sudden Shortness of Breath',
      urgency: 'EMERGENCY_IMMEDIATE' as const,
      color: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeColor: 'bg-rose-600 text-white',
      badge: 'CALL EMERGENCY SERVICES (112 / 911)',
      description:
        'Sudden difficulty breathing, chest tightness, or coughing up blood.',
      criticalGuidance:
        'Call emergency ambulance services (112 / 108 / 911) immediately. Do not drive yourself.',
    },
    {
      id: 'high_fever_chills',
      title: 'High Fever (> 38°C / 100.4°F) with Shivering or Stiff Neck',
      urgency: 'URGENT_ASSESSMENT_SAME_DAY' as const,
      color: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeColor: 'bg-amber-600 text-white',
      badge: 'SAME-DAY ASSESSMENT',
      description:
        'High temperature or chills, which may indicate intrauterine or urinary tract infection.',
      criticalGuidance:
        'Contact your doctor or maternity triage for prompt infection screening and antipyretic guidance.',
    },
    {
      id: 'unilateral_leg_swelling',
      title: 'One-Sided Leg Swelling, Redness, or Calf Tenderness',
      urgency: 'URGENT_ASSESSMENT_SAME_DAY' as const,
      color: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeColor: 'bg-amber-600 text-white',
      badge: 'SAME-DAY ASSESSMENT',
      description:
        'One leg visibly larger or more painful than the other (deep vein thrombosis warning).',
      criticalGuidance:
        'Requires prompt clinical assessment and ultrasound Doppler to rule out blood clots.',
    },
  ];

  const triagePhone =
    pregnancyProfile?.hospitalMaternityContact?.triagePhone ||
    '+1 (555) 432-8900';
  const hospitalName =
    pregnancyProfile?.hospitalMaternityContact?.hospitalName ||
    'St. Jude Maternity Hospital Triage';

  const handleLogWarningAction = (sign: (typeof emergencyWarningSigns)[0]) => {
    if (pregnancyProfile?.patientId) {
      const alertEntry: WarningSignAlert = {
        id: `alert-${Date.now()}`,
        patientId: pregnancyProfile.patientId,
        timestamp: new Date().toISOString(),
        signType: sign.id as any,
        title: sign.title,
        urgency: sign.urgency,
        actionGuidanceGiven: sign.criticalGuidance,
        wasFacilityContacted: true,
      };
      saveWarningAlert(alertEntry);
      setActionLogged(true);
      setTimeout(() => setActionLogged(false), 4000);
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/25">
            <ShieldAlert className="w-4 h-4 text-rose-200" />
            <span>Digital Health Safety Protocol</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pregnancy Warning Signs & Safety Alerts
          </h1>

          <p className="text-sm sm:text-base text-rose-100 max-w-2xl leading-relaxed">
            This is an urgent safety reference tool, not a diagnostic questionnaire. If you experience any of the symptoms below, seek immediate medical care from your hospital maternity unit or local emergency department.
          </p>

          {/* Quick Hotline Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${triagePhone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-950 font-extrabold text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Call Maternity Triage ({triagePhone})</span>
            </a>

            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-950/80 hover:bg-rose-950 text-white font-bold text-sm rounded-xl border border-white/20 transition-all"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Emergency Services (112 / 108 / 911)</span>
            </a>
          </div>
        </div>

        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {actionLogged && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Urgent action guidance recorded to your health timeline for clinician reference.</span>
        </div>
      )}

      {/* Hospital Triage Card */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Your Registered Maternity Facility:
          </span>
          <h3 className="text-base font-bold text-slate-900">{hospitalName}</h3>
          <p className="text-xs text-slate-500">
            Keep this direct labor & delivery triage number saved on your phone's speed dial.
          </p>
        </div>
        <a
          href={`tel:${triagePhone}`}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Speed Dial Triage</span>
        </a>
      </div>

      {/* Critical Red Flag Signs List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
          Urgent Red-Flag Obstetric Symptoms
        </h2>

        <div className="space-y-3.5">
          {emergencyWarningSigns.map((sign) => (
            <div
              key={sign.id}
              className={`p-5 rounded-2xl border transition-all ${sign.color} shadow-xs space-y-3`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-950">
                    {sign.title}
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${sign.badgeColor} uppercase tracking-wider shrink-0 self-start sm:self-auto`}
                >
                  {sign.badge}
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed">
                {sign.description}
              </p>

              <div className="p-3.5 bg-white/90 rounded-xl border border-rose-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-rose-950 uppercase tracking-wider block">
                  Mandatory Action Guidance:
                </span>
                <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                  {sign.criticalGuidance}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`tel:${triagePhone}`}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-2xs inline-flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Hospital Triage Now</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleLogWarningAction(sign)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline"
                >
                  Log symptom to timeline →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medically Reviewed Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Boundary:</strong> Never assume that the absence of these listed warning signs guarantees that everything is completely safe. Always follow your obstetrician's personalized instructions, attend all scheduled prenatal screenings, and seek immediate human medical advice whenever you feel unwell.
        </p>
      </div>
    </div>
  );
};
