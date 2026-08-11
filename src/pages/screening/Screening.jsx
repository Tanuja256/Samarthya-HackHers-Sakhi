import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { useTranslation } from 'react-i18next';
import { screeningTranslations } from './translations';

/* ─────────────────────────────────────────────────────────────
   QUESTIONS — Rotterdam-criteria-informed, one per screen.
   Each option has a `score` (0–2) used by computeRiskTier().
   Language is deliberately calm and non-alarming.
───────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    key: 'cycle_regularity',

    question: 'How regular have your periods been over the past year?',
    helper: 'Think about how predictable the timing is from month to month.',
    options: [
      { label: 'Very regular — arrives within a few days of when I expect it', value: 'regular', score: 0 },
      { label: 'Usually regular — occasionally a week or two off', value: 'usually_regular', score: 0 },
      { label: 'Sometimes irregular — gaps of 35–60 days are common', value: 'sometimes_irregular', score: 1 },
      { label: 'Often irregular — I rarely know when it will arrive', value: 'often_irregular', score: 2 },
    ],
  },
  {
    key: 'acne_severity',

    question: 'How would you describe your skin and acne recently?',
    helper: 'Focus on the last few months, not occasional breakouts.',
    options: [
      { label: 'Clear or very occasional pimples — nothing I think much about', value: 'none', score: 0 },
      { label: 'Mild — some spots, especially around my period', value: 'mild', score: 0 },
      { label: 'Moderate — noticeable breakouts on my face, jaw, or back', value: 'moderate', score: 1 },
      { label: 'Frequent or persistent — hard to manage, quite visible', value: 'severe', score: 2 },
    ],
  },
  {
    key: 'unusual_hair_growth',

    question: "Have you noticed extra hair growing in places you wouldn't normally expect?",
    helper: 'Things like the upper lip, chin, chest, stomach, or inner thighs.',
    options: [
      { label: 'No — nothing out of the ordinary for me', value: 'no', score: 0 },
      { label: 'A little — I notice it, but it feels minor', value: 'a_little', score: 1 },
      { label: 'Yes, quite noticeable — it bothers me or I manage it regularly', value: 'noticeable', score: 2 },
    ],
  },
  {
    key: 'hair_loss',

    question: 'Has the hair on your scalp been thinning or falling out more than usual?',
    helper: 'Compare to what felt normal for you 1–2 years ago.',
    options: [
      { label: 'No — my hair feels the same as it always has', value: 'no', score: 0 },
      { label: "A little — slightly more shedding, but I'm not sure it's unusual", value: 'a_little', score: 1 },
      { label: 'Yes — I notice clear thinning, or others have mentioned it', value: 'noticeable', score: 2 },
    ],
  },
  {
    key: 'family_history',

    question: 'Has anyone in your close family been told they have PCOS or Type 2 diabetes?',
    helper: 'This includes your mother, sisters, aunts, or grandmothers.',
    options: [
      { label: 'No, not that I know of', value: 'no', score: 0 },
      { label: 'One person — possibly or yes', value: 'one', score: 1 },
      { label: 'More than one person', value: 'multiple', score: 2 },
    ],
  },
];

const TOTAL_STEPS = QUESTIONS.length;

/* ─────────────────────────────────────────────────────────────
   computeRiskTier — standalone scoring function.

   HOW IT WORKS (for demo explanation):
   - Each of the 5 questions is scored 0, 1, or 2 based on the
     answer selected (0 = no sign, 1 = mild sign, 2 = clear sign).
   - We sum all scores (max = 10).
   - Score 0–3  => tier 'low'      (few or no Rotterdam indicators)
   - Score 4–6  => tier 'moderate' (some indicators worth watching)
   - Score 7–10 => tier 'high'     (several indicators; worth discussing
                                    with a doctor)

   This is NOT a diagnostic tool — it is a pattern-recognition
   guide to help the user decide whether to seek professional advice.
───────────────────────────────────────────────────────────── */
export function computeRiskTier(answers) {
  // answers: { [questionKey]: { value, score } }
  const totalScore = Object.values(answers).reduce(
    (sum, ans) => sum + (ans.score ?? 0),
    0
  );

  let tier;
  if (totalScore <= 3) {
    tier = 'low';
  } else if (totalScore <= 6) {
    tier = 'moderate';
  } else {
    tier = 'high';
  }

  return { totalScore, tier };
}

/* ─────────────────────────────────────────────────────────────
   RESULT CONFIG — per-tier copy (warm, non-clinical language)
───────────────────────────────────────────────────────────── */
const RESULT_CONFIG = {
  low: {
    badge: 'Low signs right now',
    badgeColor: 'bg-secondary/20 text-secondary',

    heading: "Your answers don't show many of the common patterns.",
    body: "That's genuinely reassuring. Your cycles, skin, and hair patterns are mostly in the expected range based on what you shared. Bodies are always changing, so it's worth checking in with yourself every few months — Sakhi makes that easy.",
    footnote: 'Keep logging. Patterns over time tell a clearer story than any single moment.',
    showDoctorCTA: false,
  },
  moderate: {
    badge: 'Some signs to be aware of',
    badgeColor: 'bg-warning/20 text-warning',

    heading: 'Your answers suggest a few things worth paying attention to.',
    body: "A few of the patterns you described — like cycle irregularity or skin and hair changes — are things that sometimes appear together with PCOS. That doesn't mean you have it, and it's definitely not something to worry about on its own. What it does mean is that chatting with a doctor could give you clearer answers and real peace of mind.",
    footnote: 'This is a screening tool, not a diagnosis. A doctor conversation is the helpful next step.',
    showDoctorCTA: true,
    doctorCTA: 'Consider chatting with a gynecologist or GP — even a 15-minute visit can bring clarity.',
  },
  high: {
    badge: 'Worth discussing with a doctor',
    badgeColor: 'bg-primary/20 text-accent',

    heading: 'Your answers show several patterns that are worth exploring.',
    body: "Several things you described — irregular cycles, skin and hair changes, family history — are the kinds of patterns doctors look for when thinking about PCOS. Please know this is not alarming at all; PCOS is very common and very manageable. Talking to a doctor is the best way to understand what's actually going on for you personally.",
    footnote: "Sakhi is a screening and support tool. A doctor's assessment is always the right next step.",
    showDoctorCTA: true,
    doctorCTA: "We'd encourage you to make an appointment with a gynecologist or GP soon. They can run a simple test and give you real answers.",
  },
};

/* ─────────────────────────────────────────────────────────────
   INTRO SCREEN
───────────────────────────────────────────────────────────── */
function IntroScreen({ onStart }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const tLocal = (key, fallback) => screeningTranslations?.[lang]?.[key] || screeningTranslations?.['en']?.[key] || fallback;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-3">
          {tLocal('intro_title', 'PCOS Risk Screening')}
        </h1>
        <p className="text-sm text-text/60 mb-8">
          {tLocal('intro_subtitle', 'Answer honestly — this is private and takes about 2 minutes.')}
        </p>
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-3.5 rounded-[var(--radius-button)] bg-primary text-white font-semibold hover:bg-primary/85 transition-all text-sm cursor-pointer"
        >
          {tLocal('intro_start', 'Begin Screening')}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   OPTION CARD — large, tap-friendly button
───────────────────────────────────────────────────────────── */
function OptionCard({ option, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(option)}
      className={`w-full text-left px-5 py-4 rounded-[var(--radius-card)] border-2 transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-primary bg-primary/10 shadow-md scale-[1.01]'
          : 'border-text/10 bg-white/50 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${selected ? 'border-primary bg-primary' : 'border-text/25'}`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className={`text-base leading-snug transition-colors ${selected ? 'text-text font-medium' : 'text-text/70'}`}>
          {option.label}
        </span>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   QUESTION SCREEN — one question at a time with progress bar
───────────────────────────────────────────────────────────── */
function QuestionScreen({ question, stepIndex, answer, onAnswer, onNext, onBack }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const tLocal = (key, fallback, vars) => {
    let text = screeningTranslations?.[lang]?.[key] || screeningTranslations?.['en']?.[key] || fallback;
    if (vars) {
      Object.keys(vars).forEach(k => {
        text = text.replace(`{{${k}}}`, vars[k]);
      });
    }
    return text;
  };

  const qKeyMap = {
    'cycle_regularity': 'q1',
    'acne_severity': 'q2',
    'unusual_hair_growth': 'q3',
    'hair_loss': 'q4',
    'family_history': 'q5'
  };
  const prefix = qKeyMap[question.key];
  const qText = tLocal(`${prefix}_text`, question.question);
  const qHelp = tLocal(`${prefix}_help`, question.helper);

  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-4 pt-8 pb-12">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-text/45">
              {tLocal('progress_question', `Question ${stepIndex + 1} of ${TOTAL_STEPS}`, { current: stepIndex + 1, total: TOTAL_STEPS })}
            </span>
            <span className="text-xs font-medium text-primary">
              {tLocal('progress_done', `${Math.round(progress)}% done`, { percent: Math.round(progress) })}
            </span>
          </div>
          <div className="w-full h-2.5 bg-text/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-7 sm:p-10 shadow-sm">


          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-2 leading-snug">
            {qText}
          </h2>
          <p className="text-sm text-text/50 mb-7 leading-relaxed">
            {qHelp}
          </p>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <OptionCard
                key={option.value}
                option={{ ...option, label: tLocal(`${prefix}_opt${idx + 1}`, option.label) }}
                selected={answer?.value === option.value}
                onClick={onAnswer}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 rounded-[var(--radius-button)] border border-text/15 text-text/60
                           hover:bg-text/5 hover:text-text transition-all text-sm font-medium cursor-pointer"
              >
                {tLocal('btn_back', 'Back')}
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={!answer}
              onClick={onNext}
              className="px-8 py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                         hover:bg-primary/85 active:scale-[0.98] transition-all duration-200
                         disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              {stepIndex === TOTAL_STEPS - 1 ? tLocal('btn_see_results', 'See my results') : tLocal('btn_next', 'Next')}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-text/35 text-center mt-6 leading-relaxed">
          {tLocal('disclaimer', 'Sakhi is a screening and support tool — not a diagnostic service. Your answers are private.')}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RESULT SCREEN — tier badge, warm copy, CTA buttons
───────────────────────────────────────────────────────────── */
function ResultScreen({ tier, totalScore, onRetake }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const tLocal = (key, fallback, vars) => {
    let text = screeningTranslations?.[lang]?.[key] || screeningTranslations?.['en']?.[key] || fallback;
    if (vars) {
      Object.keys(vars).forEach(k => {
        text = text.replace(`{{${k}}}`, String(vars[k]));
      });
    }
    return text;
  };

  const navigate = useNavigate();
  const safeTier = tier || 'low';
  const config = RESULT_CONFIG[safeTier] ?? RESULT_CONFIG.low;

  return (
    <div className="min-h-[80vh] flex items-start justify-center px-4 pt-8 pb-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <span className="text-xs font-medium text-text/40 tracking-wide uppercase">
            {tLocal('res_complete', 'Screening complete')}
          </span>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 sm:p-10 shadow-md">

          {/* Emoji + tier badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-4 shadow-inner">
              {config.emoji}
            </div>
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-2 ${config.badgeColor}`}>
              {tLocal(`res_${safeTier}_badge`, config.badge)}
            </span>
            <div className="text-xs text-text/35 mt-1">
              {tLocal('res_score', `Score: ${totalScore} / 10`, { score: totalScore })}
            </div>
          </div>

          {/* Heading + body */}
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-4 text-center leading-snug">
            {tLocal(`res_${safeTier}_heading`, config.heading)}
          </h2>
          <p className="text-sm text-text/65 leading-relaxed mb-6">
            {tLocal(`res_${safeTier}_body`, config.body)}
          </p>

          {/* Doctor CTA — moderate/high only */}
          {config.showDoctorCTA && (
            <div className="bg-primary/8 border border-primary/20 rounded-[var(--radius-button)] p-4 mb-6">
              <p className="text-sm text-accent font-medium leading-relaxed">
                {tLocal(`res_${safeTier}_cta`, config.doctorCTA)}
              </p>
            </div>
          )}

          {/* Footnote */}
          <p className="text-xs text-text/40 leading-relaxed text-center mb-7">
            {tLocal(`res_${safeTier}_footnote`, config.footnote)}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            {/*
              "Watch my results explained" button — P4 placeholder.
              Routes to /screening/video-summary which will be wired
              to a real AI video summary feature in Phase 4.
            */}
            <button
              type="button"
              id="screening-watch-video-btn"
              onClick={() => navigate('/screening/video-summary')}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-[var(--radius-button)]
                         bg-accent text-white font-semibold hover:bg-accent/85 active:scale-[0.98]
                         transition-all duration-200 cursor-pointer text-sm"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              {tLocal('res_watch_video', 'Watch my results explained')}
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
              <button
                type="button"
                id="screening-go-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-button)]
                           bg-secondary/15 text-secondary font-semibold hover:bg-secondary/25 active:scale-[0.98]
                           transition-all duration-200 cursor-pointer text-sm border border-secondary/25"
              >
                {tLocal('res_go_dashboard', 'Continue to Dashboard')}
              </button>

              <button
                type="button"
                id="screening-retake-btn"
                onClick={onRetake}
                className="flex-1 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-button)]
                           bg-text/5 text-text/70 font-semibold hover:bg-text/10 active:scale-[0.98]
                           transition-all duration-200 cursor-pointer text-sm border border-text/10"
              >
                {tLocal('res_retake', 'Retake screening')}
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-text/30 text-center mt-6 leading-relaxed">
          {tLocal('res_disclaimer', 'Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.')}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SAVING SCREEN — shown briefly while writing to Supabase
───────────────────────────────────────────────────────────── */
function SavingScreen() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const text = screeningTranslations?.[lang]?.['saving_answers'] || screeningTranslations?.['en']?.['saving_answers'] || 'Saving your answers…';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
        <p className="text-sm text-text/50 font-medium">{text}</p>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   VIDEO SUMMARY PLACEHOLDER — P4 will wire this to real feature
───────────────────────────────────────────────────────────── */
export function VideoSummaryPlaceholder() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-8 sm:p-10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-3xl mx-auto mb-5">
            🎬
          </div>
          <h1 className="font-heading text-2xl font-bold text-accent mb-3">
            Video summary coming soon
          </h1>
          <p className="text-sm text-text/55 leading-relaxed mb-6">
            In Phase 4, Sakhi will generate a personalised video explanation of your screening
            results — narrated calmly in your language, with captions, no medical jargon.
          </p>
          <div className="bg-text/5 border border-text/10 rounded-[var(--radius-button)] p-4 mb-6">
            <p className="text-xs text-text/45 leading-relaxed">
              This feature uses Gemini to write a gentle script based on your answers, then
              synthesises it to audio and adds timed captions — all stored privately in your account.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/screening')}
            className="px-6 py-3 rounded-[var(--radius-button)] bg-primary text-white font-semibold
                       hover:bg-primary/85 transition-all cursor-pointer text-sm"
          >
            Back to screening
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN SCREENING COMPONENT
───────────────────────────────────────────────────────────── */
export default function Screening() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('questions'); // 'questions' | 'saving' | 'result'
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionKey]: { value, score } }
  const [result, setResult] = useState(null); // { totalScore, tier }

  const handleRetake = () => {
    setPhase('questions');
    setStepIndex(0);
    setAnswers({});
    setResult(null);
  };

  const handleAnswer = (option) => {
    const q = QUESTIONS[stepIndex];
    setAnswers((prev) => ({
      ...prev,
      [q.key]: { value: option.value, score: option.score },
    }));
  };

  const handleNext = async () => {
    if (stepIndex < TOTAL_STEPS - 1) {
      setStepIndex((i) => i + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  /* ── Save to Supabase ── */
  const handleSubmit = async () => {
    setPhase('saving');
    const { totalScore, tier } = computeRiskTier(answers);

    try {
      if (user) {
        /*
          Step 1: Ensure a row exists in public.users for this auth user.
          If onboarding was skipped we auto-create a minimal row so FK constraints are satisfied.
        */
        const { data: existingUser, error: userFetchError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        // PGRST116 means "no rows found" — that is expected for new users
        if (userFetchError && userFetchError.code !== 'PGRST116') {
          console.error('[Sakhi Screening] Error fetching user row:', userFetchError);
        }

        let userId = existingUser?.id;

        if (!userId) {
          const { data: newUser, error: insertUserError } = await supabase
            .from('users')
            .upsert(
              { auth_id: user.id, name: user.email?.split('@')[0] ?? 'Sakhi User' },
              { onConflict: 'auth_id' }
            )
            .select('id')
            .single();

          if (insertUserError) {
            console.error('[Sakhi Screening] Error creating user row:', insertUserError);
          } else {
            userId = newUser?.id;
          }
        }

        if (userId) {
          /* Step 2: Insert one row per question into screening_responses */
          await supabase.from('screening_responses').delete().eq('user_id', userId);
          const responseRows = QUESTIONS.map((q) => ({
            user_id: userId,
            question_key: q.key,
            answer: answers[q.key] ?? { value: null, score: 0 },
          }));

          const { error: responsesError } = await supabase
            .from('screening_responses')
            .insert(responseRows);

          if (responsesError) {
            console.error('[Sakhi Screening] Error saving screening_responses:', responsesError);
          }

          /* Step 3: Insert computed risk score into risk_scores */
          await supabase.from('risk_scores').delete().eq('user_id', userId);
          const { error: scoreError } = await supabase
            .from('risk_scores')
            .insert({ user_id: userId, score: totalScore, tier });

          if (scoreError) {
            console.error('[Sakhi Screening] Error saving risk_scores:', scoreError);
          }
        }
      } else {
        // Unauthenticated demo — persist locally so the result is still meaningful
        localStorage.setItem(
          'sakhi_screening_result',
          JSON.stringify({ answers, totalScore, tier, savedAt: new Date().toISOString() })
        );
      }
    } catch (err) {
      console.error('[Sakhi Screening] Unexpected error during submit:', err);
    }

    setResult({ totalScore, tier });
    setPhase('result');
  };

  /* ── Render phases ── */
  if (phase === 'saving') return <SavingScreen />;
  if (phase === 'result' && result) {
    return <ResultScreen tier={result.tier} totalScore={result.totalScore} onRetake={handleRetake} />;
  }

  const currentQuestion = QUESTIONS[stepIndex];
  const currentAnswer = answers[currentQuestion?.key];

  return (
    <QuestionScreen
      question={currentQuestion}
      stepIndex={stepIndex}
      answer={currentAnswer}
      onAnswer={handleAnswer}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}
