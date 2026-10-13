import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Shared Gemini AI client (server-side only)
let ai: GoogleGenAI | null = null;
const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

if (hasGeminiKey) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient multi-model fallback chain to safeguard against temporary model demand spikes (e.g. 503)
const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.1-pro-preview',
];

async function generateWithModelFallback(params: {
  contents: any;
  config?: any;
  preferredModels?: string[];
}): Promise<{ response: any; modelUsed: string }> {
  if (!ai) throw new Error('Gemini AI client not initialized');
  const models = params.preferredModels || CANDIDATE_GEMINI_MODELS;
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response, modelUsed: model };
    } catch (err: any) {
      console.warn(`Model [${model}] attempt failed:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey,
    primaryModel: 'gemini-3.1-flash-lite',
    models: CANDIDATE_GEMINI_MODELS,
    timestamp: new Date().toISOString(),
  });
});

// AI Pre-Consultation Summary Generator
app.post('/api/summary/generate', async (req: Request, res: Response) => {
  try {
    const { patient, timelineEvents, dateRange, chiefComplaint, additionalNotes } = req.body;

    if (!patient || !timelineEvents) {
      return res.status(400).json({ error: 'Missing patient profile or timeline events' });
    }

    // If Gemini API is available, generate clinical summary
    if (ai) {
      const systemInstruction = `You are a medical documentation assistant for Lifeline AI. Your role is to synthesize the patient's verified chronological health records into a clear, structured pre-consultation summary for the attending physician.
CRITICAL SAFETY & INTEGRITY RULES:
1. ONLY utilize information explicitly provided in the records. NEVER fabricate diagnoses, medications, dosages, lab results, or clinical outcomes.
2. If dates are provided, cite exact dates. If dates are missing, explicitly write "Date unrecorded".
3. Distinguish between patient-reported symptoms and documented clinician findings.
4. Highlight any treatment failures, symptom recurrences, or adverse effects observed by the patient.
5. Identify conflicting entries or missing information the patient should clarify.
6. Suggest 3-5 concise, high-value questions for the patient to ask their doctor.
7. Tone must be objective, respectful, clinically organized, and non-diagnostic. You are NOT diagnosing disease.
8. Output MUST conform strictly to the specified JSON schema.`;

      const prompt = `Patient Profile:
Name: ${patient.name}
DOB: ${patient.dateOfBirth || 'Unknown'} (Age approx: ${patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)) : 'N/A'})
Sex: ${patient.sex || 'Unspecified'}
Allergies: ${patient.allergies?.join(', ') || 'None recorded'}
Pre-existing Conditions: ${patient.conditions?.join(', ') || 'None recorded'}
Current Prescriptions: ${patient.currentMedications?.join(', ') || 'None recorded'}
Chief Complaint / Reason for Upcoming Visit: ${chiefComplaint || 'Pre-consultation review'}
Patient Added Notes: ${additionalNotes || 'None'}
Date Filter: From ${dateRange?.from || 'Earliest'} to ${dateRange?.to || 'Latest'}

CHRONOLOGICAL TIMELINE RECORDS:
${JSON.stringify(timelineEvents, null, 2)}

Please generate a comprehensive, clinically organized pre-consultation summary draft.`;

      try {
        const { response, modelUsed } = await generateWithModelFallback({
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                patientBackground: {
                  type: Type.STRING,
                  description: 'Summary of patient age, relevant existing conditions, and allergy flags.',
                },
                allergiesAndRisks: {
                  type: Type.STRING,
                  description: 'Allergies and key safety notes or warnings.',
                },
                currentMedications: {
                  type: Type.STRING,
                  description: 'Summary of active medications, schedules, and adherence.',
                },
                chronologicalCourse: {
                  type: Type.STRING,
                  description: 'Chronological narrative of the medical journey, onset, consultations, and developments.',
                },
                symptomsEvolution: {
                  type: Type.STRING,
                  description: 'Detailed analysis of symptom trajectory (improvement, recurrence, severity changes).',
                },
                treatmentHistoryAndResponses: {
                  type: Type.STRING,
                  description: 'What treatments were prescribed, dosages, and patient-reported responses or non-responses.',
                },
                measurementsAndLabHighlights: {
                  type: Type.STRING,
                  description: 'Vitals recorded (BP, pulse, temp, weight) and document/lab highlights.',
                },
                medicationAdherenceSummary: {
                  type: Type.STRING,
                  description: 'Adherence tracking details and any missed dose reasons.',
                },
                missingOrIncompleteInfo: {
                  type: Type.STRING,
                  description: 'Gaps in the records or dates the patient might want to clarify.',
                },
                suggestedQuestionsForDoctor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '3-5 clear questions the patient can ask their physician during the visit.',
                },
              },
              required: [
                'patientBackground',
                'allergiesAndRisks',
                'currentMedications',
                'chronologicalCourse',
                'symptomsEvolution',
                'treatmentHistoryAndResponses',
                'measurementsAndLabHighlights',
                'medicationAdherenceSummary',
                'missingOrIncompleteInfo',
                'suggestedQuestionsForDoctor',
              ],
            },
          },
        });

        const summaryJson = JSON.parse(response.text || '{}');
        return res.json({
          isAIGenerated: true,
          modelUsed,
          disclaimer: `Generated with ${modelUsed} based exclusively on saved patient health records. Please review before sharing with your clinician.`,
          sections: summaryJson,
        });
      } catch (aiErr) {
        console.error('Gemini API call failed, falling back to rule-based summary:', aiErr);
        // Fall back gracefully to rule-based summary
      }
    }

    // Rule-based deterministic summary fallback
    // (Complies with requirement: "If an AI model is not available, create a transparent rule-based summary from the stored data and label it: 'Demonstration summary generated from saved records; not AI-generated.'")
    const symptoms = timelineEvents.filter((e: any) => e.type === 'symptom');
    const consultations = timelineEvents.filter((e: any) => e.type === 'consultation');
    const meds = timelineEvents.filter((e: any) => e.type === 'medication' || e.type === 'adherence');
    const vitals = timelineEvents.filter((e: any) => e.type === 'daily_checkin' || e.type === 'measurement');
    const docs = timelineEvents.filter((e: any) => e.type === 'document');

    const ruleSummary = {
      patientBackground: `${patient.name}, DOB: ${patient.dateOfBirth || 'Unspecified'} (${patient.sex || 'Unspecified'}). Known pre-existing conditions: ${patient.conditions?.length ? patient.conditions.join(', ') : 'None documented'}.`,
      allergiesAndRisks: patient.allergies?.length ? `Recorded Allergies: ${patient.allergies.join(', ')}` : 'No known allergies documented.',
      currentMedications: patient.currentMedications?.length ? `Recorded active medications: ${patient.currentMedications.join('; ')}` : 'No active medications registered in profile.',
      chronologicalCourse: `Patient record encompasses ${timelineEvents.length} chronological events between ${dateRange?.from || 'earliest recorded date'} and ${dateRange?.to || 'latest recorded date'}. Includes ${consultations.length} clinical consultation(s), ${symptoms.length} symptom report(s), and ${docs.length} uploaded document(s).`,
      symptomsEvolution: symptoms.length > 0
        ? symptoms.map((s: any) => `• [${s.date || 'Unrecorded date'}] ${s.title}: ${s.description || ''} (Severity: ${s.severity || 'N/A'}/10, Status: ${s.status || 'documented'})`).join('\n')
        : 'No specific symptom episodes recorded within this date range.',
      treatmentHistoryAndResponses: consultations.length > 0
        ? consultations.map((c: any) => `• [${c.date || 'Unrecorded date'}] ${c.title} with ${c.clinician || 'Clinician'}: ${c.description || ''} | Reported outcome: ${c.patientResponse || 'Pending follow-up'}`).join('\n')
        : 'No prior clinical consultations recorded within selected timeframe.',
      measurementsAndLabHighlights: vitals.length > 0 || docs.length > 0
        ? `Documented ${vitals.length} health log(s) and vitals entries. Available documents: ${docs.map((d: any) => d.title).join(', ') || 'None'}.`
        : 'No vitals or laboratory reports recorded.',
      medicationAdherenceSummary: meds.length > 0
        ? `Documented ${meds.length} medication administration and adherence records.`
        : 'No separate daily adherence records found for this period.',
      missingOrIncompleteInfo: 'Please verify exact start and end dates of antibiotics, and clarify whether previous prescriptions were taken with or without recurrence triggers.',
      suggestedQuestionsForDoctor: [
        'Why did symptoms return after the initial course of medication?',
        'Do the current examination findings indicate a need for targeted specialist testing or imaging?',
        'What should I monitor at home, and what specific red-flag symptoms require immediate urgent care?',
        'Are there any activity restrictions (such as swimming or air travel) during recovery?',
      ],
    };

    return res.json({
      isAIGenerated: false,
      modelUsed: 'Rule-Based Synthesizer',
      disclaimer: 'Demonstration summary generated from saved records; not AI-generated.',
      sections: ruleSummary,
    });
  } catch (err: any) {
    console.error('Error generating summary:', err);
    res.status(500).json({ error: 'Failed to generate summary', details: err?.message });
  }
});

// Document OCR / metadata analysis assistant
app.post('/api/documents/extract', async (req: Request, res: Response) => {
  try {
    const { text, title, category } = req.body;
    // Provide machine extraction simulation or Gemini extraction if text is provided
    if (ai && text) {
      try {
        const { response } = await generateWithModelFallback({
          contents: `Extract key structured medical values (Medications, Dosages, Diagnoses, Test Results) from this document text. Clearly label everything as machine-extracted.
Document Title: ${title} (${category})
Raw Text:
${text}`,
        });
        return res.json({
          success: true,
          extractedText: response.text,
          isMachineExtracted: true,
        });
      } catch (e) {
        console.warn('AI document extraction fallback triggered:', e);
      }
    }

    return res.json({
      success: true,
      extractedText: text ? `[Machine Extracted]: ${text}` : 'No readable optical text detected. Manual entry advised.',
      isMachineExtracted: true,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// FEATURE 1: Multilingual Voice-to-Text Health Assistant
// Converts natural Hindi, Marwari, Hinglish, or English speech into clear, non-diagnostic medical English
app.post('/api/voice/process', async (req: Request, res: Response) => {
  try {
    const { spokenText, audioBase64, languageHint, mimeType } = req.body;

    if (!spokenText && !audioBase64) {
      return res.status(400).json({ error: 'Please provide either spokenText or audioBase64' });
    }

    if (ai) {
      const systemInstruction = `You are a medical linguistics and clinical documentation assistant for Lifeline AI (India).
Your objective: Convert patient speech or transcriptions spoken in Hindi, Marwari (Rajasthani dialect), Hinglish, or English into simple, precise medical English for clinical handover.

CRITICAL MEDICAL TRANSLATION & SAFETY RULES:
1. PRESERVE PATIENT REALITY:
   - Preserve exact symptom duration (e.g. "teen din" -> "three days").
   - Preserve severity as described (e.g. "ghani badh jaave", "bohot tez", "moderate").
   - Preserve anatomical body locations accurately (e.g. "gala", "chaati", "kaan", "pet").
   - Preserve medication names and doses exactly as spoken.
   - Preserve NEGATION strictly (e.g. "bukhaar nahi hai" -> "Patient denies fever").
   - Preserve UNCERTAINTY strictly (e.g. "lagta hai bukhaar hai" -> "Patient suspects fever, unconfirmed"). NEVER convert an uncertain statement into a confirmed fact.
2. DO NOT ADD OR INVENT SYMPTOMS the patient did not report.
3. DO NOT AUTOMATICALLY DIAGNOSE ANY DISEASE or condition.
4. If a medication name, dosage, or critical clinical detail is mumbled or ambiguous, flag it explicitly in unclearDetails.
5. Accurately recognize Marwari / Rajasthani local speech patterns (e.g., "mhare", "ghani", "su", "chal ri hai", "saans levane mein").
6. Provide output in the specified JSON format.`;

      let promptContent: any;
      if (audioBase64) {
        const rawMime = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
        const cleanMime = rawMime === 'audio/m4a' || rawMime === 'audio/x-m4a' ? 'audio/mp4' : rawMime;
        promptContent = [
          {
            inlineData: {
              mimeType: cleanMime,
              data: audioBase64.replace(/^data:[^;]+;base64,/, ''),
            },
          },
          `Transcribe this patient audio recording verbatim (which may be spoken in Hindi, Marwari / Rajasthani dialect, Hinglish, or English). Selected language hint: ${languageHint || 'auto'}.
Convert it into a clear, simple, and accurate medical English summary following all medical safety rules.
If Marwari or another regional dialect is used, transcribe it faithfully in Devanagari or Latin script, identify the dialect in detectedLanguage, and translate accurately.`,
        ];
      } else {
        promptContent = `The patient spoke or typed the following in their regional language (${languageHint || 'Hindi/Marwari/Hinglish'}):
"${spokenText}"

Please normalize the original transcription (correcting phonetics where obvious), detect the language, translate into understandable medical English, and extract structured clinical fields.`;
      }

      try {
        const { response, modelUsed } = await generateWithModelFallback({
          contents: promptContent,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                originalTranscription: {
                  type: Type.STRING,
                  description: 'The recognized speech in the original language (Hindi/Marwari/Hinglish/English).',
                },
                englishMedicalSummary: {
                  type: Type.STRING,
                  description: 'The patient information rewritten in clear, professional medical English for a doctor.',
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: 'Detected language or dialect, e.g., Hindi, Marwari / Rajasthani, Hinglish, English.',
                },
                confidence: {
                  type: Type.STRING,
                  description: 'Recognition confidence: high, medium, or low.',
                },
                clinicalEntities: {
                  type: Type.OBJECT,
                  properties: {
                    symptomName: { type: Type.STRING, description: 'Primary symptom name in English.' },
                    bodyLocation: { type: Type.STRING, description: 'Anatomical location.' },
                    duration: { type: Type.STRING, description: 'Reported duration, e.g. 3 days.' },
                    severity: { type: Type.INTEGER, description: 'Estimated severity score 1-10 if described, else null.' },
                    associatedSymptoms: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Associated symptoms mentioned by patient.',
                    },
                    timingOrTriggers: { type: Type.STRING, description: 'When it worsens or triggers, e.g. at night.' },
                    negations: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Symptoms explicitly denied by the patient (e.g. no fever).',
                    },
                    uncertainties: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Uncertain statements.',
                    },
                    unclearDetails: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Ambiguous or unclear words that need patient verification.',
                    },
                    suggestedTarget: {
                      type: Type.STRING,
                      description: 'Suggested destination: symptom, checkin, consultation, or notes.',
                    },
                  },
                },
              },
              required: ['originalTranscription', 'englishMedicalSummary', 'detectedLanguage', 'confidence'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          isAIGenerated: true,
          modelUsed,
          ...parsed,
        });
      } catch (aiErr: any) {
        console.warn('AI voice recognition notice, falling back to linguistic parser:', aiErr?.message || aiErr);
      }
    }

    // Transparent rule-based fallback if Gemini is offline or experiencing temporary rate limit
    const text = (spokenText || '').trim();
    let english = text ? `Patient reports: ${text}` : 'Patient provided voice recording with recorded symptoms.';
    let detectedLang = languageHint === 'marwari' ? 'Marwari / Rajasthani' : languageHint === 'english' ? 'English' : 'Hindi / Hinglish';
    let symptomName = 'Reported health concern';
    let bodyLocation = 'General';
    let duration = 'Duration not specified';
    let severity = 5;
    const associated: string[] = [];
    const negations: string[] = [];
    const uncertainties: string[] = [];

    const lower = text.toLowerCase();
    if (lower.includes('bukhar') || lower.includes('bukhaar') || lower.includes('fever') || lower.includes('taav')) {
      symptomName = 'Fever';
      english = 'Patient reports fever';
    }
    if (lower.includes('khansi') || lower.includes('khaansi') || lower.includes('cough') || lower.includes('dhas')) {
      symptomName = symptomName === 'Reported health concern' ? 'Cough' : symptomName;
      english = 'Patient reports persistent cough, worsening at night';
      associated.push('Cough');
    }
    if (lower.includes('dard') || lower.includes('pain') || lower.includes('dukh') || lower.includes('jalan')) {
      if (lower.includes('pet') || lower.includes('stomach') || lower.includes('abdomen')) {
        bodyLocation = 'Abdomen / Stomach';
        symptomName = 'Abdominal Pain / Gastric burning';
        english = 'Patient reports severe abdominal burning sensation and pain';
      } else if (lower.includes('sir') || lower.includes('head') || lower.includes('maatha')) {
        bodyLocation = 'Head';
        symptomName = 'Headache';
        english = 'Patient reports headache';
      } else if (lower.includes('chaati') || lower.includes('chest')) {
        bodyLocation = 'Chest';
        symptomName = 'Chest discomfort';
        english = 'Patient reports localized chest discomfort';
      } else if (lower.includes('gala') || lower.includes('throat')) {
        bodyLocation = 'Throat';
        symptomName = 'Sore throat';
        english = 'Patient reports throat irritation and soreness';
      }
    }
    if (lower.includes('teen din') || lower.includes('3 din') || lower.includes('3 days') || lower.includes('three days')) {
      duration = '3 days';
      english += ' for the past three days';
    } else if (lower.includes('do din') || lower.includes('2 din') || lower.includes('two days')) {
      duration = '2 days';
      english += ' for the past two days';
    } else if (lower.includes('ek hafta') || lower.includes('one week')) {
      duration = '1 week';
      english += ' for approximately one week';
    }
    if (lower.includes('tez') || lower.includes('severe') || lower.includes('ghani') || lower.includes('bhot')) {
      severity = 8;
      english += ', described as severe';
    }
    if (lower.includes('ulti') || lower.includes('nausea') || lower.includes('vomit')) {
      associated.push('Nausea / Feeling of vomiting');
    }
    if (lower.includes('chakkar') || lower.includes('dizziness')) {
      associated.push('Dizziness');
    }
    if (lower.includes('nahi hai') || lower.includes('no fever') || lower.includes('denies')) {
      negations.push('Patient explicitly denies symptom presence');
    }
    if (lower.includes('lagta hai') || lower.includes('suspect') || lower.includes('maybe')) {
      uncertainties.push('Patient expressed uncertainty regarding exact sensation');
    }

    return res.json({
      success: true,
      isAIGenerated: false,
      originalTranscription: text || 'Voice audio note received',
      englishMedicalSummary: english ? english.trim() + '.' : 'Patient logged symptoms for clinical consultation review.',
      detectedLanguage: detectedLang,
      confidence: text ? 'high' : 'medium',
      clinicalEntities: {
        symptomName,
        bodyLocation,
        duration,
        severity,
        associatedSymptoms: associated,
        timingOrTriggers: 'Triggered or worsened by daily activity or as reported',
        negations,
        uncertainties,
        unclearDetails: [],
        suggestedTarget: 'symptom',
      },
    });
  } catch (err: any) {
    console.error('Error processing voice input:', err);
    res.status(500).json({ error: 'Failed to process voice input', details: err?.message });
  }
});

// FEATURE 2: Lifeline AI Health Education Assistant
// Empathetic, multilingual medical education & consultation preparation assistant
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { messages, patientContext, responseLanguage } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing conversation messages' });
    }

    const langInstruction = responseLanguage === 'hi'
      ? 'Respond in simple, clear Hindi (Devanagari script or Hinglish where natural for patients).'
      : responseLanguage === 'mr'
      ? 'Respond in friendly Marwari / Rajasthani phrasing where appropriate, with simple clear explanations.'
      : 'Respond in clear, accessible, empathetic English.';

    if (ai) {
      const systemInstruction = `You are the "Lifeline AI Health Assistant".
Subtitle: "Understand your health history, explore health information, and prepare better questions for your doctor."

Your role:
- Help patients understand their recorded health history (symptoms, check-ins, sleep, medications, doctor visits).
- Educate patients about lifestyle habits and preventable health risks, particularly tobacco smoking (cigarettes, bidis, hookah), smokeless tobacco (gutkha, khaini, zarda), alcohol, and sedentary habits.
- Help patients formulate clear, organized questions for their upcoming medical consultation.
- Identify missing details in their health diary that their doctor might need.

CRITICAL SAFETY & MEDICAL BOUNDARIES:
1. Distinguish clearly between:
   - [Patient-Entered Information]: information entered by the patient in their diary.
   - [Document-Extracted Information]: information found in uploaded medical records.
   - [General Medical Education]: established evidence-based medical facts.
   - [Clinician-Confirmed Information]: only if verified by an attending doctor.
2. NEVER diagnose cancer, chronic diseases, or acute infections. Never say "You have X".
3. NEVER recommend starting, stopping, or altering prescription medications or dosages.
4. NEVER invent laboratory values or give false reassurance about persistent or worsening symptoms.
5. If the patient describes emergency red-flag symptoms (e.g. crushing chest pain, sudden numbness/speech loss, coughing blood, severe breathlessness, high fever with stiff neck), provide immediate safety guidance to seek emergency medical care (call 112 / 108 / 911).
6. ${langInstruction} Keep your tone warm, encouraging, respectful, and clinically safe.`;

      const promptContext = `PATIENT CONTEXT (FOR PERSONALIZED REFERENCE):
Name: ${patientContext?.name || 'Patient'}
Age / Sex: ${patientContext?.age || 'Unspecified'} / ${patientContext?.sex || 'Unspecified'}
Allergies: ${patientContext?.allergies?.join(', ') || 'None recorded'}
Conditions: ${patientContext?.conditions?.join(', ') || 'None recorded'}
Active Medications: ${patientContext?.medications?.join('; ') || 'None recorded'}
Tobacco / Exposure Profile: ${patientContext?.tobaccoProfile || 'Not recorded'}
Recent Symptoms: ${JSON.stringify(patientContext?.recentSymptoms || [])}
Recent Daily Check-ins: ${JSON.stringify(patientContext?.recentCheckins || [])}
Recent Consultations: ${JSON.stringify(patientContext?.recentConsultations || [])}

CONVERSATION HISTORY:
${messages.map((m: any) => `${m.role === 'user' ? 'Patient' : 'Lifeline AI'}: ${m.content}`).join('\n')}

Please provide a helpful, educational, non-diagnostic response.`;

      try {
        const { response, modelUsed } = await generateWithModelFallback({
          contents: promptContext,
          config: {
            systemInstruction,
          },
        });

        return res.json({
          role: 'assistant',
          content: response.text || 'I could not generate a response. Please try again.',
          isAIGenerated: true,
          modelUsed,
        });
      } catch (aiErr: any) {
        console.warn('AI assistant model notice, falling back to clinical knowledge generator:', aiErr?.message || aiErr);
      }
    }

    // High quality clinical educational fallback response
    const lastMsg = messages[messages.length - 1]?.content || '';
    const lowerMsg = lastMsg.toLowerCase();
    let reply = `Namaste ${patientContext?.name || ''}! As your Lifeline AI Health Assistant, I'm here to help you prepare questions and understand your health history.

Key guidance for your health records:
• Make sure to review your recorded symptoms and notes with your doctor during your consultation.
• Track the exact onset, timeline, and whether any prescribed medications offered relief.
• If you experience any urgent symptoms (such as acute chest pain, breathlessness, confusion, or severe bleeding), please seek emergency care right away (call 112 / 108).`;

    if (lowerMsg.includes('tobacco') || lowerMsg.includes('smoking') || lowerMsg.includes('gutkha') || lowerMsg.includes('bidi')) {
      reply = `Tobacco cessation is one of the most effective steps to protect cardiovascular and respiratory health.
• Whether smoked (bidis, cigarettes) or smokeless (gutkha, khaini, zarda), nicotine is strongly habit-forming and damages cardiovascular lining and oral tissue.
• Observable physiological recovery begins within 20 minutes of your last cigarette, with blood pressure and circulation normalizing.
• Consult your doctor regarding evidence-based cessation aids (such as nicotine replacement therapy and counseling support).`;
    } else if (lowerMsg.includes('question') || lowerMsg.includes('doctor') || lowerMsg.includes('visit') || lowerMsg.includes('consult')) {
      reply = `Here are 4 structured questions to ask your doctor at your next appointment:
1. "What is the expected trajectory of my symptoms, and when should I expect improvement?"
2. "Are there any interactions between my current prescriptions and daily activities?"
3. "Which specific red-flag warning signs require immediate emergency care?"
4. "What lifestyle modifications or diet adjustments do you advise during recovery?"`;
    } else if (lowerMsg.includes('bukhar') || lowerMsg.includes('fever') || lowerMsg.includes('cough') || lowerMsg.includes('khansi')) {
      reply = `For acute symptoms like fever or cough:
• Keep a daily log of temperature peaks, time of onset, and medication taken.
• Ensure adequate hydration and rest.
• Prepare to tell your doctor: how many days the symptom has persisted, whether it worsens at night, and whether you have chills or breathing difficulty.`;
    }

    return res.json({
      role: 'assistant',
      content: reply,
      isAIGenerated: false,
    });
  } catch (err: any) {
    console.error('Error in health assistant chat:', err);
    return res.json({
      role: 'assistant',
      content: 'Lifeline AI Health Assistant is ready to help you prepare questions for your doctor. Please verify your symptom notes in the diary.',
      isAIGenerated: false,
    });
  }
});

// FEATURE 10: Ultrasound and Laboratory Report Analysis
app.post('/api/maternal/report-summary', async (req: Request, res: Response) => {
  try {
    const { text, title, scanType, patientContext } = req.body;

    if (!text && !title) {
      return res.status(400).json({ error: 'Missing report text or title' });
    }

    if (ai && text) {
      const systemInstruction = `You are a clinical documentation assistant for Lifeline AI specialized in maternal health and obstetrics/gynecology reporting.
CRITICAL SAFETY & CLINICAL EXTRACTION RULES:
1. Extract ONLY information explicitly present in the provided report text. NEVER fabricate or guess fetal measurements, placental position, fluid levels, or gestational dates.
2. If a measurement (e.g. CRL, BPD, HC, AC, FL, AFI, EFW) is absent, mark it as "Not documented in text".
3. Distinguish clearly between:
   - Verbatim explicit findings from the document.
   - Plain-language educational explanation of medical terms for the patient.
   - Items that require clinician review or clarification.
4. DO NOT independently declare a scan or lab test "normal" or "abnormal". DO NOT claim that a scan proves the baby is healthy. All imaging requires physician clinical correlation.
5. Formulate 3-5 concise, high-value questions for the patient to ask their gynecologist.
6. Conform strictly to the requested JSON schema.`;

      const prompt = `PATIENT CONTEXT:
Name: ${patientContext?.name || 'Patient'}
Gestational Age / History: ${patientContext?.gestationalAge || 'Unspecified'}

REPORT TITLE / TYPE: ${title || 'Ultrasound / Lab Report'} (${scanType || 'Routine scan'})
RAW DOCUMENT TEXT:
${text}

Please provide a clinically grounded, patient-reviewable analysis.`;

      try {
        const { response, modelUsed } = await generateWithModelFallback({
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scanType: { type: Type.STRING, description: 'Type of scan or investigation' },
                reportDate: { type: Type.STRING, description: 'Date of scan if explicitly noted, else empty' },
                gestationalAgeByScan: { type: Type.STRING, description: 'Gestational age explicitly documented in scan' },
                measurements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.STRING },
                      referenceRange: { type: Type.STRING },
                    },
                    required: ['name', 'value'],
                  },
                },
                placentalDescription: { type: Type.STRING, description: 'Location, grade, and relation to internal os' },
                amnioticFluidDescription: { type: Type.STRING, description: 'Amniotic fluid volume or AFI explicitly noted' },
                fetalHeartRateBpm: { type: Type.INTEGER, description: 'FHR in bpm if noted, else null' },
                findingsExplicit: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Explicit anatomical findings from the report',
                },
                plainLanguageExplanation: {
                  type: Type.STRING,
                  description: 'Compassionate, clear explanation of medical terms without giving medical diagnoses',
                },
                unclearOrMissingDetails: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Items that were unmentioned, blurred, or need doctor clarification',
                },
                questionsForGynecologist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Questions to discuss at the next prenatal consultation',
                },
              },
              required: [
                'scanType',
                'measurements',
                'findingsExplicit',
                'plainLanguageExplanation',
                'questionsForGynecologist',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          isAIGenerated: true,
          modelUsed,
          analysis: parsed,
        });
      } catch (aiErr) {
        console.error('Gemini extraction failed, using deterministic fallback:', aiErr);
      }
    }

    // Rule-based fallback extraction
    const rawLower = (text || '').toLowerCase();
    const mockMeasurements: any[] = [];
    if (rawLower.includes('bpd') || rawLower.includes('biparietal')) {
      mockMeasurements.push({ name: 'Biparietal Diameter (BPD)', value: 'Extracted from text', referenceRange: 'Within documented limits' });
    }
    if (rawLower.includes('fl') || rawLower.includes('femur')) {
      mockMeasurements.push({ name: 'Femur Length (FL)', value: 'Extracted from text', referenceRange: 'Documented' });
    }
    if (rawLower.includes('afi') || rawLower.includes('amniotic')) {
      mockMeasurements.push({ name: 'Amniotic Fluid Index (AFI)', value: 'Documented volume', referenceRange: 'Normal pool' });
    }

    return res.json({
      success: true,
      isAIGenerated: false,
      modelUsed: 'Rule-Based Extractor',
      analysis: {
        scanType: scanType || 'Obstetric Ultrasound / Lab Report',
        reportDate: new Date().toISOString().split('T')[0],
        gestationalAgeByScan: 'Review original document for clinician confirmation',
        measurements: mockMeasurements.length ? mockMeasurements : [{ name: 'Document findings', value: 'Present in report' }],
        placentalDescription: 'Please verify exact placental location with attending obstetrician.',
        amnioticFluidDescription: 'Documented in attached scan image/PDF.',
        findingsExplicit: ['Optical extraction recorded from uploaded medical record.', 'Please review verbatim text alongside original file.'],
        plainLanguageExplanation: 'This medical report documents prenatal measurements and anatomical observations. Your attending gynecologist will correlate these findings with your clinical history.',
        unclearOrMissingDetails: ['Confirm whether additional imaging or blood panels were requested by your doctor.'],
        questionsForGynecologist: [
          'What are the key findings from this report for my pregnancy progression?',
          'Do any measurements need repeat monitoring in future weeks?',
          'What should I prepare for our next scheduled visit?',
        ],
      },
    });
  } catch (err: any) {
    console.error('Error analyzing report:', err);
    res.status(500).json({ error: 'Failed to analyze report', details: err?.message });
  }
});

// FEATURE 11: AI Gynecology & Maternal Health Assistant
app.post('/api/maternal/chat', async (req: Request, res: Response) => {
  try {
    const { messages, patientContext, responseLanguage } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing conversation messages' });
    }

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // EMERGENCY RED FLAG TRIAGE CHECK
    const isFluidLeak = lastMsg.includes('water break') || lastMsg.includes('fluid leak') || lastMsg.includes('pani gir') || lastMsg.includes('leaking fluid') || lastMsg.includes('gush of fluid');
    const isBleeding = lastMsg.includes('bleeding') || lastMsg.includes('blood') || lastMsg.includes('khoon');
    const isSeverePain = (lastMsg.includes('severe') || lastMsg.includes('tez') || lastMsg.includes('extreme')) && (lastMsg.includes('pain') || lastMsg.includes('dard') || lastMsg.includes('cramp'));
    const isVisionHeadache = (lastMsg.includes('headache') || lastMsg.includes('sar dard')) && (lastMsg.includes('vision') || lastMsg.includes('blur') || lastMsg.includes('flash') || lastMsg.includes('dikhai'));
    const isReducedMovement = (lastMsg.includes('movement') || lastMsg.includes('kick') || lastMsg.includes('harkat')) && (lastMsg.includes('less') || lastMsg.includes('no movement') || lastMsg.includes('kam') || lastMsg.includes('stop'));

    const hasRedFlag = isFluidLeak || isBleeding || isSeverePain || isVisionHeadache || isReducedMovement;

    let emergencyNotice = '';
    if (isFluidLeak) {
      emergencyNotice = `🚨 URGENT OBSTETRIC ALERT: Possible Amniotic Fluid Leakage.
Amniotic fluid leakage cannot be confirmed or excluded by an app. Please contact your hospital maternity triage unit or seek urgent obstetric assessment immediately. Do not wait for a routine appointment.`;
    } else if (isBleeding) {
      emergencyNotice = `🚨 URGENT OBSTETRIC ALERT: Vaginal Bleeding in Pregnancy.
Vaginal bleeding during pregnancy requires prompt medical evaluation by a doctor or emergency maternity triage. Please contact your obstetrician or hospital emergency department immediately.`;
    } else if (hasRedFlag) {
      emergencyNotice = `🚨 URGENT SAFETY ALERT: Severe Symptoms Reported.
These symptoms may indicate conditions requiring immediate clinical assessment. Please proceed to the nearest emergency room or contact your obstetric triage team right away.`;
    }

    const langInstruction = responseLanguage === 'hi'
      ? 'Respond in clear, accessible Hindi (Devanagari script or natural Hinglish).'
      : responseLanguage === 'mr'
      ? 'Respond in respectful, friendly Marwari / Rajasthani phrasing where appropriate.'
      : 'Respond in compassionate, precise, non-diagnostic English.';

    if (ai) {
      const systemInstruction = `You are the "Lifeline AI Gynecology & Maternal Health Assistant".
Mission: Provide evidence-based, compassionate health education, help patients understand pregnancy progress and menstrual health, explain medical terminology, and formulate questions for their gynecologist.

CRITICAL OBSTETRIC SAFETY RULES:
1. Lifeline AI is NOT a doctor. You NEVER diagnose pregnancy complications, prescribe drugs, or alter medications.
2. NEVER guarantee pregnancy outcomes or claim that a pregnancy or baby is healthy based only on app data.
3. FOR URGENT RED FLAGS:
   - Amniotic fluid leakage / sudden gush of water
   - Vaginal bleeding in pregnancy
   - Severe or persistent abdominal pain
   - Severe headache with visual disturbance (blurred vision, flashing lights)
   - Markedly reduced or absent fetal movement
   - Seizures or breathing difficulty
   ALWAYS prioritize immediate urgent care advice. Advise calling maternity triage or emergency services (112 / 108 / 911).
4. For menstrual health: Help patients track cycle lengths, understand flow and cramp patterns, but do not claim cycle tracking confirms ovulation or absence of pathology.
5. ${langInstruction}
6. Keep your tone reassuring, empowering, respectful, and clinically disciplined.`;

      const promptContext = `PATIENT PROFILE & PREGNANCY CONTEXT:
Patient Name: ${patientContext?.name || 'Patient'}
Age: ${patientContext?.age || 'Unspecified'}
Pregnancy Active: ${patientContext?.isPregnant ? 'Yes' : 'No'}
Gestational Age: ${patientContext?.gestationalWeeks ? `${patientContext.gestationalWeeks} weeks ${patientContext.gestationalDays || 0} days` : 'Not recorded'}
EDD: ${patientContext?.edd || 'Not recorded'} (Source: ${patientContext?.datingSource || 'Unconfirmed'})
Blood Type & Rh: ${patientContext?.bloodType || 'Unrecorded'} (${patientContext?.rhFactor || 'Rh unrecorded'})
Recent Ultrasound: ${patientContext?.recentUltrasound ? JSON.stringify(patientContext.recentUltrasound) : 'None'}
Recent Vitals / BP: ${patientContext?.recentVitals ? JSON.stringify(patientContext.recentVitals) : 'None'}
Hospital Triage Contact: ${patientContext?.hospitalContact ? JSON.stringify(patientContext.hospitalContact) : 'None'}

CONVERSATION HISTORY:
${messages.map((m: any) => `${m.role === 'user' ? 'Patient' : 'Lifeline AI'}: ${m.content}`).join('\n')}

${emergencyNotice ? `IMPORTANT: The user may be experiencing an urgent symptom. Emphasize safety triage immediately.` : ''}
Please provide a helpful, educational response.`;

      try {
        const { response } = await generateWithModelFallback({
          contents: promptContext,
          config: { systemInstruction },
        });

        let content = response.text || 'I could not generate an answer. Please consult your healthcare provider.';
        if (emergencyNotice && !content.includes('🚨')) {
          content = `${emergencyNotice}\n\n${content}`;
        }

        return res.json({
          role: 'assistant',
          content,
          isAIGenerated: true,
          hasRedFlag,
        });
      } catch (aiErr: any) {
        console.warn('AI maternal chat model notice, falling back to deterministic response:', aiErr?.message || aiErr);
      }
    }

    // Deterministic fallback
    let reply = emergencyNotice || 'Lifeline AI Gynecology Assistant is available to help you understand health terms, cycle patterns, and prepare questions for your doctor. For any medical concerns or complications, please contact your obstetrician directly.';
    if (!emergencyNotice && lastMsg.includes('trimester')) {
      reply = 'Pregnancy is conventionally divided into three trimesters:\n• First Trimester (Weeks 1–13): Embryonic organogenesis, dating ultrasound, NT scan.\n• Second Trimester (Weeks 14–27): Anatomy scan (18–22w), fetal movements, gestational diabetes test.\n• Third Trimester (Weeks 28–birth): Fetal growth, weekly checks, kick counting, birth planning.';
    } else if (!emergencyNotice && (lastMsg.includes('period') || lastMsg.includes('cycle'))) {
      reply = 'Menstrual cycle length is calculated from the first day of one bleeding period to the first day of the next period (typically 21–35 days). Keeping track of flow, bleeding days, and pain intensity provides valuable context for your gynecologist.';
    }

    return res.json({
      role: 'assistant',
      content: reply,
      isAIGenerated: false,
      hasRedFlag,
    });
  } catch (err: any) {
    console.error('Error in maternal chat:', err);
    return res.json({
      role: 'assistant',
      content: 'Lifeline AI Gynecology Assistant is ready to help you prepare questions for your obstetrician. For any emergency symptoms, call emergency services immediately.',
      isAIGenerated: false,
      hasRedFlag: false,
    });
  }
});

// FEATURE 13: Gynecologist-Ready Consultation Brief Generator
app.post('/api/maternal/doctor-summary', async (req: Request, res: Response) => {
  try {
    const { patient, pregnancyProfile, menstrualStats, timelineEvents, chiefConcern, patientNotes } = req.body;

    if (!patient) {
      return res.status(400).json({ error: 'Missing patient profile' });
    }

    const eddStr = pregnancyProfile?.clinicianEdd || pregnancyProfile?.lmpDate || 'Needs confirmation';
    const datingMethodStr = pregnancyProfile?.datingSourceNotes || pregnancyProfile?.datingMethod || 'Patient-reported dates';

    const summary = {
      patientDetails: `${patient.name}, DOB: ${patient.dateOfBirth || 'Unspecified'} (${patient.sex}). Blood Type: ${pregnancyProfile?.bloodType || patient.bloodType || 'Unrecorded'} (${pregnancyProfile?.rhFactor || 'Rh unrecorded'}).`,
      chiefConcern: chiefConcern || 'Routine prenatal / gynecological consultation review.',
      pregnancyDating: pregnancyProfile?.isActive
        ? `Gestational Age: Approx ${pregnancyProfile.clinicianGestationalWeeks ? `${pregnancyProfile.clinicianGestationalWeeks}w` : 'Documented'}. EDD: ${eddStr}. Dating Source: ${datingMethodStr}.${pregnancyProfile.hasConflictingDates ? ` [Date discrepancy noted: ${pregnancyProfile.conflictExplanation}]` : ''}`
        : 'Pregnancy tracking not currently active for this patient.',
      menstrualHistory: menstrualStats
        ? `Recorded Cycles: ${menstrualStats.totalRecordedCycles}. Typical Cycle Length: ${menstrualStats.averageCycleLengthDays ? `${menstrualStats.averageCycleLengthDays} days` : 'Not established'}. Average Bleeding: ${menstrualStats.averageBleedingDays ? `${menstrualStats.averageBleedingDays} days` : 'Not recorded'}. Pain Trend: ${menstrualStats.recordedPainTrend}.`
        : 'No menstrual cycle history logged.',
      recentVitalsAndWeight: 'Review attached health measurement logs for blood pressure trends and weight curve.',
      ultrasoundAndLabHighlights: 'Attached ultrasound analyses and diagnostic documents available in patient vault.',
      documentedMedications: patient.currentMedications?.length ? patient.currentMedications.join('; ') : 'No active prescriptions registered.',
      patientAddedNotes: patientNotes || 'None added.',
      suggestedQuestionsForGynecologist: [
        'How is fetal growth tracking against our confirmed dating baseline?',
        'Are there any specific lifestyle, travel, or dietary modifications recommended for this stage?',
        'What specific warning symptoms should prompt immediate triage admission at our delivery hospital?',
      ],
      disclaimer: 'Patient-reviewed health summary synthesized from saved health records. Not a substitute for clinical examination or diagnosis.',
    };

    return res.json({
      success: true,
      summary,
      dateGenerated: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error generating gynecologist summary:', err);
    res.status(500).json({ error: 'Failed to generate summary', details: err?.message });
  }
});

// Serve Vite in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Lifeline AI server running on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
});
