/**
 * Pregnancy & Menstrual Cycle Clinical Calculation Utilities
 * Strictly follows non-diagnostic educational standards and conventional obstetric dating conventions.
 */

import {
  PregnancyProfile,
  MenstrualCycleEntry,
  HealthMeasurement,
} from '../types';

export interface GestationalAgeResult {
  weeks: number;
  days: number;
  totalDays: number;
  edd: string; // YYYY-MM-DD
  trimester: 1 | 2 | 3;
  trimesterName: 'First Trimester' | 'Second Trimester' | 'Third Trimester';
  datingMethodUsed: string;
  isDateConfirmed: boolean;
  statusMessage?: string;
  discrepancyNote?: string;
  progressPercent: number; // 0 - 100%
  sizeAnalogy: {
    fruitOrItem: string;
    lengthApprox: string;
    weightApprox: string;
  };
}

/**
 * Calculates Gestational Age and Estimated Due Date according to selected method
 */
export function calculateGestationalAge(
  profile?: PregnancyProfile,
  referenceDateStr: string = new Date().toISOString().split('T')[0]
): GestationalAgeResult | null {
  if (!profile || !profile.isActive) return null;

  const refDate = new Date(referenceDateStr);

  let totalGestationalDays = 0;
  let estimatedDueDate = '';
  let datingMethodUsed = 'Unconfirmed';
  let isDateConfirmed = false;
  let discrepancyNote: string | undefined;

  // 1. Clinician Documented Gestational Age on a specific date
  if (
    profile.datingMethod === 'gestational_age_clinician' &&
    profile.clinicianGestationalWeeks !== undefined &&
    profile.clinicianAssessmentDate
  ) {
    const assessmentDate = new Date(profile.clinicianAssessmentDate);
    const daysSinceAssessment = Math.floor(
      (refDate.getTime() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const baseDays =
      profile.clinicianGestationalWeeks * 7 +
      (profile.clinicianGestationalDays || 0);
    totalGestationalDays = Math.max(0, baseDays + daysSinceAssessment);

    // EDD is 280 days from conception point (baseDays ago)
    const eddDate = new Date(assessmentDate);
    eddDate.setDate(eddDate.getDate() + (280 - baseDays));
    estimatedDueDate = eddDate.toISOString().split('T')[0];
    datingMethodUsed = `Clinician Documented Gestational Age (${profile.datingSourceNotes || 'Medical Record'})`;
    isDateConfirmed = true;
  }
  // 2. Clinician Provided EDD
  else if (profile.datingMethod === 'edd_clinician' && profile.clinicianEdd) {
    const edd = new Date(profile.clinicianEdd);
    estimatedDueDate = profile.clinicianEdd;
    const daysUntilDue = Math.floor(
      (edd.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    totalGestationalDays = Math.max(0, 280 - daysUntilDue);
    datingMethodUsed = `Clinician Confirmed EDD (${profile.datingSourceNotes || 'Ultrasound / Obstetric Assessment'})`;
    isDateConfirmed = true;
  }
  // 3. First Day of Last Menstrual Period (Naegele's Rule)
  else if (profile.datingMethod === 'lmp' && profile.lmpDate) {
    const lmp = new Date(profile.lmpDate);
    totalGestationalDays = Math.max(
      0,
      Math.floor((refDate.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24))
    );

    // EDD = LMP + 280 days
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280);
    estimatedDueDate = edd.toISOString().split('T')[0];
    datingMethodUsed = 'Last Menstrual Period (LMP) Calculation';
    isDateConfirmed = false;

    // Discrepancy note if clinician EDD is also available
    if (profile.clinicianEdd) {
      const clinicianEddDate = new Date(profile.clinicianEdd);
      const diffDays = Math.abs(
        Math.floor(
          (edd.getTime() - clinicianEddDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      if (diffDays >= 7) {
        discrepancyNote = `There is a ${diffDays}-day difference between your LMP calculation (${estimatedDueDate}) and clinician-documented EDD (${profile.clinicianEdd}). Clinical dating is recommended.`;
      }
    }
  } else {
    return {
      weeks: 0,
      days: 0,
      totalDays: 0,
      edd: 'Dates need confirmation',
      trimester: 1,
      trimesterName: 'First Trimester',
      datingMethodUsed: 'Pregnancy dates need confirmation',
      isDateConfirmed: false,
      statusMessage: 'Pregnancy dates need confirmation by a healthcare professional.',
      progressPercent: 0,
      sizeAnalogy: getFetalSizeAnalogy(0),
    };
  }

  const weeks = Math.floor(totalGestationalDays / 7);
  const days = totalGestationalDays % 7;

  // Trimester classification
  let trimester: 1 | 2 | 3 = 1;
  let trimesterName: 'First Trimester' | 'Second Trimester' | 'Third Trimester' =
    'First Trimester';

  if (weeks >= 28) {
    trimester = 3;
    trimesterName = 'Third Trimester';
  } else if (weeks >= 14) {
    trimester = 2;
    trimesterName = 'Second Trimester';
  } else {
    trimester = 1;
    trimesterName = 'First Trimester';
  }

  const progressPercent = Math.min(100, Math.round((totalGestationalDays / 280) * 100));

  return {
    weeks,
    days,
    totalDays: totalGestationalDays,
    edd: estimatedDueDate,
    trimester,
    trimesterName,
    datingMethodUsed,
    isDateConfirmed,
    discrepancyNote,
    progressPercent,
    sizeAnalogy: getFetalSizeAnalogy(weeks),
  };
}

export function getFetalSizeAnalogy(weeks: number) {
  if (weeks < 5) {
    return { fruitOrItem: 'Poppy Seed', lengthApprox: '< 2 mm', weightApprox: '< 1 g' };
  } else if (weeks <= 8) {
    return { fruitOrItem: 'Raspberry', lengthApprox: '1.6 cm', weightApprox: '1 g' };
  } else if (weeks <= 11) {
    return { fruitOrItem: 'Lime', lengthApprox: '4.1 cm', weightApprox: '7 g' };
  } else if (weeks <= 13) {
    return { fruitOrItem: 'Lemon', lengthApprox: '7.4 cm', weightApprox: '23 g' };
  } else if (weeks <= 16) {
    return { fruitOrItem: 'Avocado', lengthApprox: '11.6 cm', weightApprox: '100 g' };
  } else if (weeks <= 20) {
    return { fruitOrItem: 'Banana', lengthApprox: '16.4 cm', weightApprox: '300 g' };
  } else if (weeks <= 24) {
    return { fruitOrItem: 'Corn Cob', lengthApprox: '30 cm', weightApprox: '600 g' };
  } else if (weeks <= 28) {
    return { fruitOrItem: 'Eggplant', lengthApprox: '37 cm', weightApprox: '1.0 kg' };
  } else if (weeks <= 32) {
    return { fruitOrItem: 'Pineapple', lengthApprox: '42 cm', weightApprox: '1.7 kg' };
  } else if (weeks <= 36) {
    return { fruitOrItem: 'Papaya', lengthApprox: '47 cm', weightApprox: '2.6 kg' };
  } else {
    return { fruitOrItem: 'Watermelon', lengthApprox: '50+ cm', weightApprox: '3.3+ kg' };
  }
}

/**
 * Trimester Milestones & Clinical Focus Areas
 */
export interface TrimesterInfo {
  range: string;
  title: string;
  clinicalFocus: string[];
  recommendedInvestigations: string[];
  warningSignsToWatch: string[];
  wellnessTips: string[];
  questionsForClinician: string[];
}

export const TRIMESTER_GUIDES: Record<1 | 2 | 3, TrimesterInfo> = {
  1: {
    range: 'Weeks 1 – 13',
    title: 'First Trimester: Conception & Embryonic Development',
    clinicalFocus: [
      'Initial pregnancy confirmation & early obstetric assessment',
      'Accurate gestational dating (dating ultrasound typically at 8–12 weeks)',
      'Baseline maternal vitals (BP, baseline weight, blood type & Rh factor)',
      'Early blood investigations (CBC, thyroid, infectious screens per clinician)',
    ],
    recommendedInvestigations: [
      'Dating Ultrasound (confirms intrauterine pregnancy & viability)',
      'First Trimester Screening / Nuchal Translucency (NT) Scan (approx 11–13w6d)',
      'Routine prenatal blood panel & urinalysis',
    ],
    warningSignsToWatch: [
      'Vaginal bleeding or spotting with cramping',
      'Severe lower abdominal or unilateral pelvic pain (ectopic risk warning)',
      'Severe intractable nausea/vomiting unable to keep liquids down (hyperemesis)',
      'High fever with chills',
    ],
    wellnessTips: [
      'Folic acid supplementation (typically 400 mcg daily or per doctor advice)',
      'Eat small, frequent meals if experiencing morning sickness',
      'Maintain gentle hydration throughout the day',
      'Rest whenever fatigued; avoid unprescribed over-the-counter medications',
    ],
    questionsForClinician: [
      'What prenatal vitamins are best suited for my health history?',
      'Are any of my current daily medications or supplements contraindicated in pregnancy?',
      'What should I do if nausea prevents me from drinking enough fluids?',
      'When is my first dating ultrasound scheduled?',
    ],
  },
  2: {
    range: 'Weeks 14 – 27',
    title: 'Second Trimester: Rapid Growth & Anatomical Development',
    clinicalFocus: [
      'Detailed fetal anatomy assessment (Level II anomaly scan)',
      'Maternal blood pressure monitoring for gestational hypertension',
      'Fundal height progression and fetal heartbeat monitoring',
      'Fetal movement initiation (quickening, usually between 18–22 weeks)',
    ],
    recommendedInvestigations: [
      'Fetal Anomaly Scan / Level II Target Ultrasound (typically 18–22 weeks)',
      'Oral Glucose Tolerance Test (OGTT) for gestational diabetes (typically 24–28 weeks)',
      'Repeat hemoglobin / complete blood count',
    ],
    warningSignsToWatch: [
      'Any sudden gush or trickle of fluid (possible membrane rupture)',
      'Vaginal bleeding',
      'Persistent severe headache with visual disturbances or epigastric pain',
      'Noticeable decrease in fetal movements after regular movements were established',
    ],
    wellnessTips: [
      'Incorporate calcium-rich and iron-rich foods into meals',
      'Engage in pregnancy-safe activities like walking or prenatal yoga if cleared',
      'Sleep on your side (preferably left side) with supportive pillows',
      'Stay consistently hydrated to prevent constipation and urinary tract infections',
    ],
    questionsForClinician: [
      'Are the anatomical structures and placenta location normal on my scan?',
      'When should I expect to feel regular fetal kicks or flutterings?',
      'How should I prepare for the gestational diabetes screening test?',
      'Are there specific symptoms that warrant calling the labor & delivery unit directly?',
    ],
  },
  3: {
    range: 'Weeks 28 – 40+',
    title: 'Third Trimester: Maturation & Birth Preparation',
    clinicalFocus: [
      'Fetal growth monitoring & position/presentation check (cephalic/breech)',
      'Maternal blood pressure & screening for pre-eclampsia',
      'Regular daily fetal movement awareness (kick counting)',
      'Birth preferences, hospital registration, and emergency preparedness',
    ],
    recommendedInvestigations: [
      'Third Trimester Growth & Doppler Ultrasound (as advised by clinician)',
      'Group B Streptococcus (GBS) swab screen (typically 35–37 weeks)',
      'Regular fortnightly and then weekly prenatal check-ups',
    ],
    warningSignsToWatch: [
      'Amniotic fluid leakage (clear or greenish-brown fluid gush/leak)',
      'Marked reduction in fetal movement',
      'Severe persistent headache, flashing lights, sudden facial/hand swelling',
      'Vaginal bleeding or sudden painful uterine contractions',
    ],
    wellnessTips: [
      'Perform daily fetal kick monitoring (e.g. 10 movements in a 2-hour quiet window)',
      'Pack hospital bag and confirm transportation to maternity hospital',
      'Keep hospital maternity triage phone number on emergency speed-dial',
      'Practice pelvic floor relaxation and gentle breathing exercises',
    ],
    questionsForClinician: [
      'What are my hospital’s instructions for when contractions begin or water breaks?',
      'Is my baby positioned head-down (cephalic)?',
      'What is the direct 24/7 triage phone number for the labor and delivery ward?',
      'Under what specific symptoms should I proceed to hospital triage immediately?',
    ],
  },
};

/**
 * Menstrual Cycle Analytics & Statistics
 */
export interface MenstrualCycleStats {
  totalRecordedCycles: number;
  averageCycleLengthDays: number | null;
  cycleLengthVariationDays: number | null;
  isRegularEstimate: boolean | null;
  averageBleedingDays: number | null;
  recordedPainTrend: 'mild' | 'moderate' | 'severe' | 'none';
  recentCycles: {
    startDate: string;
    endDate?: string;
    bleedingDays: number;
    cycleLengthDays?: number;
    flowSummary: string;
    maxPain: number;
  }[];
}

export function analyzeMenstrualCycles(
  cycles: MenstrualCycleEntry[]
): MenstrualCycleStats {
  if (!cycles || cycles.length === 0) {
    return {
      totalRecordedCycles: 0,
      averageCycleLengthDays: null,
      cycleLengthVariationDays: null,
      isRegularEstimate: null,
      averageBleedingDays: null,
      recordedPainTrend: 'none',
      recentCycles: [],
    };
  }

  // Sort cycles chronologically by startDate
  const sorted = [...cycles].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Compute cycle lengths (difference between consecutive period start dates)
  const computedCycleLengths: number[] = [];
  const bleedingDaysList: number[] = [];
  let totalPainScore = 0;
  let painEntryCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];

    // Compute cycle length from previous period start to this period start
    if (i > 0) {
      const prev = sorted[i - 1];
      const diffDays = Math.round(
        (new Date(cur.startDate).getTime() - new Date(prev.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diffDays >= 15 && diffDays <= 60) {
        computedCycleLengths.push(diffDays);
      }
    }

    // Bleeding duration
    let bleedingDays = cur.bleedingDays;
    if (!bleedingDays && cur.endDate) {
      bleedingDays =
        Math.round(
          (new Date(cur.endDate).getTime() - new Date(cur.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;
    } else if (!bleedingDays && cur.dailyFlows?.length) {
      bleedingDays = cur.dailyFlows.length;
    }
    if (bleedingDays && bleedingDays > 0) {
      bleedingDaysList.push(bleedingDays);
    }

    if (cur.symptoms?.crampsSeverity !== undefined) {
      totalPainScore += cur.symptoms.crampsSeverity;
      painEntryCount++;
    }
  }

  const avgCycleLength =
    computedCycleLengths.length > 0
      ? Math.round(
          computedCycleLengths.reduce((a, b) => a + b, 0) /
            computedCycleLengths.length
        )
      : null;

  const minCycle =
    computedCycleLengths.length > 0 ? Math.min(...computedCycleLengths) : 0;
  const maxCycle =
    computedCycleLengths.length > 0 ? Math.max(...computedCycleLengths) : 0;
  const cycleVariation =
    computedCycleLengths.length >= 2 ? maxCycle - minCycle : null;

  const isRegular =
    cycleVariation !== null ? cycleVariation <= 7 : null;

  const avgBleeding =
    bleedingDaysList.length > 0
      ? Math.round(
          (bleedingDaysList.reduce((a, b) => a + b, 0) /
            bleedingDaysList.length) *
            10
        ) / 10
      : null;

  const avgPain = painEntryCount > 0 ? totalPainScore / painEntryCount : 0;
  let painTrend: 'mild' | 'moderate' | 'severe' | 'none' = 'none';
  if (avgPain >= 7) painTrend = 'severe';
  else if (avgPain >= 4) painTrend = 'moderate';
  else if (avgPain > 0) painTrend = 'mild';

  // Build descending recent cycles view for UI
  const recentCycles = [...sorted]
    .reverse()
    .map((c, idx, arr) => {
      let cycleLength = c.cycleLengthDays;
      if (!cycleLength && idx < arr.length - 1) {
        const nextOlder = arr[idx + 1];
        cycleLength = Math.round(
          (new Date(c.startDate).getTime() -
            new Date(nextOlder.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      let bDays = c.bleedingDays || c.dailyFlows?.length || 5;
      if (!c.bleedingDays && c.endDate) {
        bDays =
          Math.round(
            (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1;
      }

      // Flow summary
      const flows = c.dailyFlows?.map((f) => f.flow) || [];
      const hasHeavy = flows.includes('heavy') || flows.includes('unusually_heavy');
      const flowSummary = hasHeavy
        ? 'Heavy flow recorded'
        : flows.includes('moderate')
        ? 'Moderate flow'
        : 'Light / Spotting';

      return {
        startDate: c.startDate,
        endDate: c.endDate,
        bleedingDays: bDays,
        cycleLengthDays: cycleLength,
        flowSummary,
        maxPain: c.symptoms?.crampsSeverity || 0,
      };
    });

  return {
    totalRecordedCycles: sorted.length,
    averageCycleLengthDays: avgCycleLength,
    cycleLengthVariationDays: cycleVariation,
    isRegularEstimate: isRegular,
    averageBleedingDays: avgBleeding,
    recordedPainTrend: painTrend,
    recentCycles,
  };
}

/**
 * Evaluates clinical safety rule for blood pressure in pregnancy / general health
 */
export function evaluateBloodPressureSafety(
  systolic?: number,
  diastolic?: number,
  isPregnant: boolean = false
): {
  category: 'Normal' | 'Elevated' | 'Stage 1' | 'Stage 2' | 'Severe / Urgent Warning';
  color: string;
  urgentWarning: boolean;
  message: string;
} {
  if (!systolic || !diastolic) {
    return {
      category: 'Normal',
      color: 'text-slate-600',
      urgentWarning: false,
      message: 'Measurement recorded.',
    };
  }

  // Severe obstetric threshold: Systolic >= 160 or Diastolic >= 110
  if (systolic >= 160 || diastolic >= 110) {
    return {
      category: 'Severe / Urgent Warning',
      color: 'text-rose-700 font-bold',
      urgentWarning: true,
      message: isPregnant
        ? 'URGENT SAFETY FLAG: BP ≥ 160/110 mmHg in pregnancy requires immediate emergency obstetric assessment (possible severe pre-eclampsia warning).'
        : 'URGENT: Blood pressure is significantly elevated. Seek prompt medical care.',
    };
  }

  // Pre-eclampsia screening threshold: >= 140/90
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Stage 2',
      color: 'text-amber-700 font-semibold',
      urgentWarning: false,
      message: isPregnant
        ? 'Clinical note: Blood pressure is ≥ 140/90 mmHg. Contact your maternity team or clinician for assessment.'
        : 'Blood pressure is elevated (Stage 2 range). Discuss with your healthcare provider.',
    };
  }

  if (systolic >= 130 || diastolic >= 80) {
    return {
      category: 'Stage 1',
      color: 'text-amber-600',
      urgentWarning: false,
      message: 'Borderline elevated reading. Continue regular monitoring.',
    };
  }

  return {
    category: 'Normal',
    color: 'text-teal-700',
    urgentWarning: false,
    message: 'Within conventional normal resting range (< 120/80 mmHg).',
  };
}
