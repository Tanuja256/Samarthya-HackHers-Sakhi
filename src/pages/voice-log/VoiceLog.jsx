import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { callGemini } from '../../lib/callGemini';

export default function VoiceLog() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [supportError, setSupportError] = useState('');
  const [extractFailed, setExtractFailed] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSupportError('Voice logging is not supported in this browser. Please use the text input.');
    }
  }, [i18n.language]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setParsedData(null);
      setSaveSuccess(false);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setSaveSuccess(false);
    setSaveError('');
    setExtractFailed(false);
    
    const prompt = `
      You are a medical data extraction assistant.
      Read the following user transcript and extract health metrics.
      Return the output as strict JSON with this exact schema:
      {
        "symptoms": ["list", "of", "strings", "or empty array"],
        "mood": "a single short string describing mood, or null",
        "energy": "a single short string describing energy level, or null"
      }
      If something is not mentioned, use null or an empty array. Do not invent details.
      Transcript: "${transcript}"
    `;

    const FALLBACK = { symptoms: [], mood: null, energy: null };
    const data = await callGemini(prompt, {
      jsonMode: true,
      fallbackData: FALLBACK,
    });

    // Detect fallback: all three fields are at their default empty state
    const isFallback = (data?.symptoms?.length ?? 0) === 0
      && data?.mood === null
      && data?.energy === null;
    // Only flag as failure if the transcript actually had content to parse
    if (isFallback && transcript.trim().length > 10) {
      setExtractFailed(true);
    }

    setParsedData(data);
    setIsProcessing(false);
  };

  const handleSave = async () => {
    if (!user || !parsedData) return;
    setIsSaving(true);

    // Resolve the internal public.users.id (FK target) — NOT auth user.id
    // symptom_logs.user_id and mood_logs.user_id both reference public.users(id)
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (userErr || !userRow?.id) {
      console.error('[VoiceLog] Could not resolve internal user id:', userErr);
      setSaveError('Could not save — please try again.');
      setIsSaving(false);
      return;
    }

    const internalUserId = userRow.id;
    // Use a full ISO timestamp for logged_at (schema: TIMESTAMPTZ, no `date` column)
    const loggedAt = new Date().toISOString();

    let hasError = false;

    // --- symptom_logs ---
    // severity schema: INTEGER CHECK (severity BETWEEN 1 AND 5) — map string → int
    if (parsedData.symptoms?.length > 0) {
      const symptomInserts = parsedData.symptoms.map((s) => ({
        user_id: internalUserId,
        symptom: s,
        severity: 3,           // 'moderate' maps to 3 (mid of 1–5 scale)
        logged_at: loggedAt,   // correct column name (not `date`)
        source: 'voice',       // schema has: source TEXT CHECK (source IN ('manual','voice'))
      }));

      console.log('[VoiceLog] Inserting symptom_logs:', symptomInserts);
      const { error: sErr } = await supabase.from('symptom_logs').insert(symptomInserts);
      if (sErr) {
        console.error('[VoiceLog] symptom_logs insert error:', sErr);
        hasError = true;
      }
    }

    // --- mood_logs ---
    // mood_logs schema: mood TEXT NOT NULL, energy_level INTEGER CHECK (1–5)
    // No `source` column, no `date` column — use logged_at (TIMESTAMPTZ)
    if (parsedData.mood || parsedData.energy) {
      // Map Gemini's free-text energy string to the 1–5 integer the schema requires
      const energyMap = { high: 5, good: 4, moderate: 3, low: 2, very_low: 1, exhausted: 1 };
      const energyStr = (parsedData.energy ?? '').toLowerCase().replace(/\s+/g, '_');
      const energyInt = energyMap[energyStr] ?? 3; // default to 3 if unmapped

      const moodRow = {
        user_id: internalUserId,
        mood: parsedData.mood ?? 'unspecified',  // NOT NULL in schema
        energy_level: parsedData.energy ? energyInt : null,
        logged_at: loggedAt,   // correct column name (not `date`)
        // No `source` column in mood_logs
      };

      console.log('[VoiceLog] Inserting mood_logs:', moodRow);
      const { error: mErr } = await supabase.from('mood_logs').insert(moodRow);
      if (mErr) {
        console.error('[VoiceLog] mood_logs insert error:', mErr);
        hasError = true;
      }
    }

    if (hasError) {
      setSaveError('Some entries could not be saved. Check the console for details.');
    } else {
      setSaveSuccess(true);
      setTranscript('');
      setParsedData(null);
    }

    setIsSaving(false);
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-body">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-2">
        {t('voice_title')}
      </h1>
      <p className="text-text/60 text-sm sm:text-base mb-10">
        {t('voice_subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ── Left Column: Mic Card ── */}
        <div className="bg-white/60 backdrop-blur-sm border border-text/10 rounded-[var(--radius-card)] p-10 text-center shadow-sm flex flex-col items-center justify-center min-h-[320px]">
          <button
            onClick={toggleRecording}
            disabled={!!supportError && !isRecording}
            className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-sm
              ${isRecording ? 'bg-primary text-white scale-110 animate-pulse' : 'bg-primary/10 text-primary hover:bg-primary/20'}
              ${!!supportError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </button>
          
          <p className={`text-lg font-semibold mb-2 ${isRecording ? 'text-primary' : 'text-text'}`}>
            {isRecording ? t('voice_listening') : t('voice_tap_to_speak')}
          </p>
          <p className="text-xs text-text/50 max-w-[200px] leading-relaxed">
            Nothing is uploaded in this demo — audio stays on your device.
          </p>
          
          {supportError && <p className="text-xs text-warning mt-4">{supportError}</p>}
        </div>

        {/* ── Right Column: What Sakhi heard ── */}
        <div className="bg-white/60 backdrop-blur-sm border border-text/10 rounded-[var(--radius-card)] p-8 shadow-sm min-h-[320px] flex flex-col">
          <h2 className="font-heading text-xl font-bold text-text mb-4">
            What Sakhi heard
          </h2>

          {!transcript && !isRecording && !parsedData ? (
            <p className="text-text/50 text-sm">
              Your transcription and the symptoms Sakhi picks out will appear here.
            </p>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Transcript Textarea */}
              {!parsedData && (
                <>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={t('voice_fallback_placeholder')}
                    className="w-full flex-1 px-4 py-3 rounded-[var(--radius-button)] border border-text/15 bg-white
                               focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                               transition-all text-base min-h-[120px] resize-none mb-4"
                  />
                  <button
                    onClick={processTranscript}
                    disabled={isProcessing || !transcript.trim()}
                    className="w-full py-3.5 rounded-[var(--radius-button)] bg-text text-white font-semibold
                               hover:bg-text/90 active:scale-[0.98] transition-all duration-200 shadow-sm
                               disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('voice_processing')}
                      </span>
                    ) : t('voice_process_button')}
                  </button>
                </>
              )}

              {/* Parsed Data Confirmation */}
              {parsedData && (
                <div className="flex-1 flex flex-col justify-between animate-fade-in">
                  <div>
                    <p className="text-sm text-text/70 mb-4 italic">"{transcript}"</p>

                    {/* Visible error when AI extraction failed */}
                    {extractFailed && (
                      <div className="mb-3 flex items-center gap-2 bg-warning/10 border border-warning/25 text-warning rounded-xl px-3 py-2 text-xs font-medium">
                        <span>⚠️</span>
                        <span>Couldn't extract tags right now — try again or type your entry instead.</span>
                        <button
                          onClick={processTranscript}
                          className="ml-auto underline hover:no-underline text-warning/80 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-4 mb-6 bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <div>
                        <p className="text-[10px] font-bold text-text/40 uppercase tracking-wider mb-1">{t('voice_tags_symptoms')}</p>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.symptoms?.length > 0 ? (
                            parsedData.symptoms.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-white border border-primary/20 rounded-full text-xs text-text font-medium">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-text/50 italic">{t('voice_none')}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-text/40 uppercase tracking-wider mb-1">{t('voice_tags_mood')}</p>
                          <p className="text-sm font-medium text-text">{parsedData.mood || <span className="text-text/50 italic">{t('voice_none')}</span>}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text/40 uppercase tracking-wider mb-1">{t('voice_tags_energy')}</p>
                          <p className="text-sm font-medium text-text">{parsedData.energy || <span className="text-text/50 italic">{t('voice_none')}</span>}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving || !user}
                    className="w-full py-3.5 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                               hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 shadow-sm
                               disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                  >
                    {isSaving ? '...' : t('voice_save_button')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mt-6 bg-secondary/10 text-secondary border border-secondary/20 p-4 rounded-[var(--radius-button)] text-center animate-fade-in font-medium">
          {t('voice_save_success')}
        </div>
      )}

      {saveError && (
        <div className="mt-4 bg-warning/10 text-warning border border-warning/20 p-4 rounded-[var(--radius-button)] text-center text-sm font-medium">
          ⚠️ {saveError}
        </div>
      )}

      {!user && (
        <div className="mt-4 text-center">
          <p className="text-sm text-warning">You must be logged in to save logs.</p>
        </div>
      )}

      {/* Demo Footer Note */}
      <div className="mt-12 pt-6 border-t border-text/10">
        <p className="text-xs text-text/40 leading-relaxed max-w-4xl">
          Demo note: transcription and tag extraction are powered by Web Speech API and Gemini. A production build would use a dedicated cloud speech-to-text service for broader device support.
        </p>
      </div>
    </div>
  );
}
