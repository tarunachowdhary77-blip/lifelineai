# Implementation Plan: Fix Microphone Feature & Multilingual Voice Input Fallback

## 1. Problem Diagnosis
In Lifeline AI, users reported that clicking the microphone button produces an error or microphone access fails on Google Chrome.
The root causes identified:
1. **Web Speech API (`webkitSpeechRecognition`) Vulnerability**: In Chrome (especially inside iframes, sandbox environments, or corporate networks), `webkitSpeechRecognition` frequently throws `not-allowed`, `service-not-allowed`, or `network` errors because it relies on Google's remote speech recognition socket service.
2. **Double Permission / Concurrency Conflicts**: When `startRecording()` triggered `recognition.start()` while simultaneously requesting `navigator.mediaDevices.getUserMedia()`, Chrome would reject or lock the audio hardware stream.
3. **Lack of Server-side Audio Fallback**: If browser speech recognition failed, the app had no fallback to capture raw audio chunks via `MediaRecorder` and send them to Gemini for transcription.
4. **Missing Audio File Upload Fallback**: Users who recorded voice notes on phone/WhatsApp (e.g., family members explaining symptoms in Marwari or Hindi) could not upload audio files directly.

---

## 2. Solution Architecture

We will implement a resilient, multi-tiered voice-to-text pipeline that guarantees reliable recording and transcription across all environments:

### Tier 1: Dual-Engine Live Microphone Recording
- **Primary Engine (Resilient MediaRecorder + Server Gemini Audio Transcription)**:
  - Uses standard browser `navigator.mediaDevices.getUserMedia({ audio: true })`.
  - Captures clean audio with `MediaRecorder` (supported across Chrome, Edge, Safari, Firefox, and mobile browsers).
  - Encodes recorded audio (WebM/MP4/WAV) and sends it directly to our backend endpoint `/api/voice/transcribe-audio`.
  - Gemini Flash processes the audio directly: natively transcribes local Indian languages (Hindi, Marwari, Rajasthani, Hinglish, Bengali, Tamil, Telugu, etc.) with high fidelity without relying on fragile browser-only recognition sockets.
- **Secondary Engine (Web Speech API)**:
  - Kept as an optional real-time live preview where supported, isolated from media capture errors.
  - If Web Speech API fails or is denied by browser policy, the app automatically relies on the `MediaRecorder` buffer without throwing a blocking UI error.

### Tier 2: Audio File Upload & Voice Memo Fallback
- Adds an audio file dropzone (`.mp3`, `.m4a`, `.wav`, `.ogg`, `.webm`, `.aac`).
- Allows users to drag and drop or select voice memos (e.g., patient voice notes recorded on WhatsApp or smartphone voice recorder).
- Displays audio duration, player preview, and single-click transcription & medical translation.

### Tier 3: Browser Permission Guidance & Diagnostics
- Detects Chrome permission state via `navigator.permissions.query({ name: 'microphone' })`.
- Provides actionable inline instructions if permission is blocked (e.g. click Chrome site settings icon / lock icon in address bar -> Permissions -> Allow Microphone).
- Graceful degraded state with clear options: "Try Again", "Upload Voice Recording", or "Type Symptoms".

---

## 3. Detailed Proposed Changes

### Backend (`server.ts`)
- Add `POST /api/voice/transcribe-audio`:
  - Accepts `{ audioBase64: string, mimeType: string, languageHint?: string }`.
  - Uses `@google/genai` with `gemini-2.5-flash` model to analyze audio chunks.
  - System prompt instructs Gemini to:
    1. Transcribe verbatim spoken words in the source script (Devanagari for Hindi/Marwari, or Latin for Hinglish/English).
    2. Identify the language/dialect with confidence estimation.
    3. Generate a structured English medical summary (chief complaints, duration, severity, modifying factors).
    4. Provide safety flags for red-flag warning symptoms.
  - Returns structured JSON: `{ originalTranscription, detectedLanguage, englishSummary, keySymptoms, safetyFlags }`.

### Frontend Components
1. **`src/components/voice/VoiceAssistantView.tsx`**:
   - Refactor `startRecording` to cleanly isolate microphone permission handling.
   - Implement `MediaRecorder` recording with audio visualizer / sound level wave.
   - Add "Upload Audio File" tab / toggle alongside live microphone.
   - Add clear permission error guides with instant alternative actions.
2. **`src/components/voice/MultilingualVoiceModal.tsx`**:
   - Apply matching robust recording, audio file upload, and permission fallback so quick-record modals from the Dashboard and Women's Health sections work seamlessly.
3. **`src/components/voice/AudioUploadFallback.tsx`**:
   - Reusable dropzone component supporting audio file drag-and-drop, play preview, and direct processing.

---

## 4. Verification Plan
- **Verification Tests**:
  - Test live microphone recording in Chrome.
  - Test refusal / denial scenario to ensure clear guidance and fallback activation.
  - Test audio file upload with sample speech files (`.mp3`, `.wav`, `.webm`, `.m4a`).
  - Verify transcription and translation fidelity for Hindi, Marwari, Hinglish, and English.
  - Verify saving confirmed records to Daily Check-in, Symptom Tracker, and Women's Health Hub.
  - Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
