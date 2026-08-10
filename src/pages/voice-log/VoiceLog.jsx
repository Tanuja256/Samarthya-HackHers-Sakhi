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
  const [supportError, setSupportError] = useState('');

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Set language based on active i18n
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

    const data = await callGemini(prompt, { 
      jsonMode: true,
      fallbackData: { symptoms: [], mood: null, energy: null } 
    });

    setParsedData(data);
    setIsProcessing(false);
  };

  const handleSave = async () => {
    if (!user || !parsedData) return;
    setIsSaving(true);
    
    const today = new Date().toISOString().split('T')[0];

    try {
      // 1. Save Symptoms
      if (parsedData.symptoms && parsedData.symptoms.length > 0) {
        // Typically, symptom_logs expects one row per symptom or an array. 
        // We'll assume a structure where we can insert an array of objects or a single row with JSON.
        // Assuming standard normalized table: user_id, date, symptom
        const symptomInserts = parsedData.symptoms.map(s => ({
          user_id: user.id,
          date: today,
          symptom: s,
          severity: 'moderate', // default
          source: 'voice'
        }));
        await supabase.from('symptom_logs').insert(symptomInserts);
      }

      // 2. Save Mood/Energy
      if (parsedData.mood || parsedData.energy) {
        await supabase.from('mood_logs').insert({
          user_id: user.id,
          date: today,
          mood: parsedData.mood,
          energy_level: parsedData.energy,
          source: 'voice'
        });
      }

      setSaveSuccess(true);
      setTranscript('');
      setParsedData(null);
    } catch (err) {
      console.error('Error saving logs', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-accent mb-2">
        {t('voice_title')}
      </h1>
      <p className="text-text/60 mb-8">{t('voice_subtitle')}</p>

      {/* Mic Area */}
      <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 text-center shadow-sm mb-6">
        <button
          onClick={toggleRecording}
          disabled={!!supportError && !isRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-md
            ${isRecording ? 'bg-accent text-white scale-110 animate-pulse shadow-accent/40' : 'bg-primary text-white hover:bg-primary/90'}
            ${!!supportError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </button>
        <p className={`font-medium ${isRecording ? 'text-accent' : 'text-text/70'}`}>
          {isRecording ? t('voice_listening') : t('voice_tap_to_speak')}
        </p>
        {supportError && <p className="text-xs text-warning mt-2">{supportError}</p>}
      </div>

      {/* Text Fallback / Transcript */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text mb-2">
          {t('voice_fallback_label')}
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={t('voice_fallback_placeholder')}
          className="w-full px-4 py-3 rounded-[var(--radius-button)] border border-text/15 bg-white
                     focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                     transition-all text-base min-h-[120px] resize-y"
        />
      </div>

      <button
        onClick={processTranscript}
        disabled={isProcessing || !transcript.trim()}
        className="w-full py-3.5 rounded-[var(--radius-button)] bg-text text-white font-semibold
                   hover:bg-text/90 active:scale-[0.98] transition-all duration-200 shadow-md
                   disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-8 flex justify-center items-center"
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

      {/* Results Confirmation */}
      {parsedData && (
        <div className="bg-primary/5 border border-primary/20 rounded-[var(--radius-card)] p-6 animate-fade-in mb-6">
          <h2 className="font-heading text-lg font-semibold text-text mb-4">
            {t('voice_review_title')}
          </h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs font-medium text-text/50 uppercase tracking-wide mb-1">{t('voice_tags_symptoms')}</p>
              <div className="flex flex-wrap gap-2">
                {parsedData.symptoms?.length > 0 ? (
                  parsedData.symptoms.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-primary/30 rounded-full text-sm text-text">
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
                <p className="text-xs font-medium text-text/50 uppercase tracking-wide mb-1">{t('voice_tags_mood')}</p>
                <p className="text-sm font-medium text-text">{parsedData.mood || <span className="text-text/50 italic">{t('voice_none')}</span>}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-text/50 uppercase tracking-wide mb-1">{t('voice_tags_energy')}</p>
                <p className="text-sm font-medium text-text">{parsedData.energy || <span className="text-text/50 italic">{t('voice_none')}</span>}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || !user}
            className="w-full py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                       hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? '...' : t('voice_save_button')}
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-secondary/10 text-secondary border border-secondary/20 p-4 rounded-[var(--radius-button)] text-center animate-fade-in font-medium">
          {t('voice_save_success')}
        </div>
      )}

      {/* Warn if not logged in (since we need user.id to save) */}
      {!user && (
        <div className="mt-4 text-center">
          <p className="text-sm text-warning">You must be logged in to save logs.</p>
        </div>
      )}
    </div>
  );
}
