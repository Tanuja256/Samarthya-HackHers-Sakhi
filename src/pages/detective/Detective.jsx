import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { callGemini } from '../../lib/callGemini';

export default function Detective() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [insight, setInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [hasEnoughData, setHasEnoughData] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAnalyzing(false);
      setHasEnoughData(false);
      return;
    }

    async function analyzeData() {
      try {
        // Fetch last 30 days of logs
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

        const [symptomRes, moodRes, cycleRes] = await Promise.all([
          supabase.from('symptom_logs').select('*').eq('user_id', user.id).gte('date', dateStr).order('date', { ascending: true }),
          supabase.from('mood_logs').select('*').eq('user_id', user.id).gte('date', dateStr).order('date', { ascending: true }),
          supabase.from('cycle_logs').select('*').eq('user_id', user.id).gte('date', dateStr).order('date', { ascending: true })
        ]);

        const symptoms = symptomRes.data || [];
        const moods = moodRes.data || [];
        const cycles = cycleRes.data || [];

        // Check data volume
        const uniqueDates = new Set([
          ...symptoms.map(s => s.date),
          ...moods.map(m => m.date),
          ...cycles.map(c => c.date)
        ]);

        if (uniqueDates.size < 3) {
          setHasEnoughData(false);
          setIsAnalyzing(false);
          return;
        }

        setHasEnoughData(true);

        // Group by date for simple correlation
        const dataByDate = {};
        for (const date of uniqueDates) {
          dataByDate[date] = { symptoms: [], mood: null, energy: null, period: false };
        }

        symptoms.forEach(s => dataByDate[s.date].symptoms.push(s.symptom));
        moods.forEach(m => {
          if (m.mood) dataByDate[m.date].mood = m.mood;
          if (m.energy_level) dataByDate[m.date].energy = m.energy_level;
        });
        cycles.forEach(c => {
          // assuming cycle_logs might have a flag like 'is_period' or 'flow'
          dataByDate[c.date].period = true;
        });

        // Prepare a raw text summary for Gemini to read
        const sortedDates = Array.from(uniqueDates).sort();
        let rawLogText = "User's daily logs over the past 30 days:\n";
        sortedDates.forEach(date => {
          const d = dataByDate[date];
          rawLogText += `Date: ${date} | Symptoms: ${d.symptoms.join(', ') || 'None'} | Mood: ${d.mood || 'N/A'} | Energy: ${d.energy || 'N/A'} | Period: ${d.period ? 'Yes' : 'No'}\n`;
        });

        const prompt = `
          You are "Symptom Detective", a supportive health companion for someone managing PCOS.
          Analyze this user's raw log data and find ONE clear, specific correlation or pattern (e.g. "Your acne flares tend to happen on days you report low sleep" or "Your energy dips seem to coincide with high stress").
          Write exactly ONE friendly, empathetic, plain-language sentence describing the pattern you found.
          Do NOT give medical advice or diagnose. Do NOT use markdown.
          
          Data:
          ${rawLogText}
        `;

        const response = await callGemini(prompt, {
          fallbackMessage: "I noticed some patterns in your logs, but I need a bit more time to make sense of them."
        });

        setInsight(response);
      } catch (err) {
        console.error('Error in Symptom Detective:', err);
        setHasEnoughData(false); // Fallback gracefully
      } finally {
        setIsAnalyzing(false);
      }
    }

    analyzeData();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-full flex items-center justify-center text-2xl">
          🕵️‍♀️
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-accent">
          {t('detective_title')}
        </h1>
      </div>
      <p className="text-text/60 mb-8 max-w-xl leading-relaxed">
        {t('detective_subtitle')}
      </p>

      {isAnalyzing ? (
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-10 text-center shadow-sm">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text/70 font-medium">{t('detective_analyzing')}</p>
        </div>
      ) : !hasEnoughData ? (
        <div className="bg-white/60 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-10 text-center shadow-sm">
          <div className="text-4xl mb-4">📈</div>
          <p className="text-text/70 mb-6 leading-relaxed max-w-md mx-auto">
            {t('detective_empty')}
          </p>
          <Link
            to="/tracker"
            className="inline-block px-6 py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                       hover:bg-primary/90 transition-all duration-200 shadow-sm"
          >
            {t('detective_go_log')}
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-[var(--radius-card)] p-8 shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/40 blur-3xl rounded-full"></div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            {t('detective_insight_title')}
          </p>
          <p className="font-heading text-xl sm:text-2xl text-text leading-snug">
            "{insight}"
          </p>
        </div>
      )}
    </div>
  );
}
