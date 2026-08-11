import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { callGemini } from '../../lib/callGemini';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

import BackButton from '../../components/BackButton';

/* ══════════════════════════════════════════════════════════════════
   STATIC DATA — Weekly Meal Plan
   ══════════════════════════════════════════════════════════════════ */
const getWeeklyPlan = (t) => [
  {
    day: t('diet_day_1'),
    meals: [t('diet_day_1_m1'), t('diet_day_1_m2'), t('diet_day_1_m3')]
  },
  {
    day: t('diet_day_2'),
    meals: [t('diet_day_2_m1'), t('diet_day_2_m2'), t('diet_day_2_m3')]
  },
  {
    day: t('diet_day_3'),
    meals: [t('diet_day_3_m1'), t('diet_day_3_m2'), t('diet_day_3_m3')]
  },
  {
    day: t('diet_day_4'),
    meals: [t('diet_day_4_m1'), t('diet_day_4_m2'), t('diet_day_4_m3')]
  },
  {
    day: t('diet_day_5'),
    meals: [t('diet_day_5_m1'), t('diet_day_5_m2'), t('diet_day_5_m3')]
  },
  {
    day: t('diet_day_6'),
    meals: [t('diet_day_6_m1'), t('diet_day_6_m2'), t('diet_day_6_m3')]
  },
  {
    day: t('diet_day_7'),
    meals: [t('diet_day_7_m1'), t('diet_day_7_m2'), t('diet_day_7_m3')]
  },
];

const MorningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text/60 mt-0.5 shrink-0">
    <path d="M5 11h14v1a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6v-1Z" /><path d="M19 11v1a2 2 0 0 1-2 2" /><path d="M9 3v4" /><path d="M15 3v4" /><path d="M12 3v4" />
  </svg>
);

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text/60 mt-0.5 shrink-0">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text/60 mt-0.5 shrink-0">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MEAL_ICONS = [MorningIcon, SunIcon, MoonIcon];

/* ══════════════════════════════════════════════════════════════════
   FAMILY-PLATE GUIDANCE
   ══════════════════════════════════════════════════════════════════ */
const getDishOptions = (t) => [
  { id: 'dal', label: t('diet_dish_dal') },
  { id: 'rice', label: t('diet_dish_rice') },
  { id: 'roti', label: t('diet_dish_roti') },
  { id: 'bhakri', label: t('diet_dish_bhakri') },
  { id: 'sabzi', label: t('diet_dish_sabzi') },
  { id: 'curd', label: t('diet_dish_curd') },
  { id: 'pickle', label: t('diet_dish_pickle') },
  { id: 'fried', label: t('diet_dish_fried') },
  { id: 'sweet', label: t('diet_dish_sweet') },
  { id: 'salad', label: t('diet_dish_salad') },
];

const FALLBACK_TIPS = [
  "Add a side of raw cucumber or carrot sticks — the extra fiber helps slow down blood sugar spikes from the meal.",
  "Swap one roti/bhakri for an extra katori of dal. More protein, same fullness, better for insulin balance.",
  "Start your meal with the sabzi or salad before the rice or roti. Eating veggies first blunts the glucose spike.",
  "Add a glass of buttermilk (taak) to your meal — it aids digestion and is gentler than curd with heavy meals.",
  "If there's rice today, keep it to half a katori and load up on the dal and sabzi instead.",
];

export default function Diet() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to base-week section when navigated from Festival page
  useEffect(() => {
    if (location.state?.scrollTo === 'base-week') {
      const el = document.getElementById('base-week');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [location.state]);

  const [selectedDishes, setSelectedDishes] = useState([]);
  const [tweakResult, setTweakResult] = useState('');
  const [tweakLoading, setTweakLoading] = useState(false);
  const [tweakSaved, setTweakSaved] = useState(false);
  const [tweakFailed, setTweakFailed] = useState(false);

  const toggleDish = (id) => {
    setSelectedDishes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
    setTweakResult('');
    setTweakSaved(false);
  };

  const getSelectedLabels = () =>
    selectedDishes
      .map((id) => getDishOptions(t).find((d) => d.id === id)?.label)
      .filter(Boolean);

  const handleGetTweak = async () => {
    if (selectedDishes.length === 0) return;

    setTweakLoading(true);
    setTweakResult('');
    setTweakSaved(false);
    setTweakFailed(false);

    const dishNames = getSelectedLabels().join(', ');
    const prompt = `The user has PCOS and is from Maharashtra, India. Their family is cooking the following dishes today: ${dishNames}.
Give ONE short, practical, friendly tweak (1-2 lines max) to make this meal more PCOS-friendly. Don't suggest a whole new meal — just a small adjustment. Respond ONLY with the tweak.`;

    // callGemini never throws — it returns fallbackMessage on any failure.
    // Use a sentinel value to detect fallback vs real AI response.
    const FALLBACK_SENTINEL = '__DIET_FALLBACK__';
    let tweak = await callGemini(prompt, { fallbackMessage: FALLBACK_SENTINEL });

    if (tweak === FALLBACK_SENTINEL) {
      // AI failed — show a context-aware local tip and surface the error
      setTweakFailed(true);
      if (selectedDishes.includes('rice') && !selectedDishes.includes('salad')) tweak = FALLBACK_TIPS[4];
      else if (selectedDishes.includes('roti') || selectedDishes.includes('bhakri')) tweak = FALLBACK_TIPS[1];
      else if (!selectedDishes.includes('curd')) tweak = FALLBACK_TIPS[3];
      else tweak = FALLBACK_TIPS[0];
    }

    setTweakResult(tweak);

    // Save to meal_logs in Supabase
    try {
      const logData = {
        meal_type: 'lunch/dinner',
        description: dishNames,
        tweaks: tweak,
      };
      if (user) {
        const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
        if (userData) logData.user_id = userData.id;
      }
      if (logData.user_id) {
        await supabase.from('meal_logs').insert(logData);
      } else {
        const existing = JSON.parse(localStorage.getItem('sakhi_meal_logs') || '[]');
        existing.push({ ...logData, logged_at: new Date().toISOString() });
        localStorage.setItem('sakhi_meal_logs', JSON.stringify(existing));
      }
    } catch (saveErr) {
      console.warn('[Diet] Error saving meal log:', saveErr.message);
    }

    setTweakLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-3xl font-bold text-text">
          {t('diet_page_title')}
        </h1>
        <BackButton />
      </div>
      <p className="text-[15px] text-text/60 mb-10">
        {t('diet_page_subtitle')}
      </p>

      {/* ── Family Plate Section ── */}
      <section className="bg-[#fcf5f3] rounded-[20px] p-8 mb-16 border border-[#f5e3df]">
        <div className="inline-block bg-[#f5e3df] text-[#b87c71] text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-5">
          {t('diet_family_plate_badge')}
        </div>

        <h2 className="font-heading text-xl font-bold text-text mb-2">
          {t('diet_plate_title')}
        </h2>
        <p className="text-sm text-text/60 mb-6">
          {t('diet_family_plate_desc')}
        </p>

        <div className="flex flex-wrap gap-2.5 mb-8">
          {getDishOptions(t).map(({ id, label }) => {
            const selected = selectedDishes.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleDish(id)}
                className={`px-5 py-2.5 rounded-full text-[13.5px] font-medium transition-all duration-200 cursor-pointer border
                  ${selected
                    ? 'border-accent bg-white shadow-sm ring-1 ring-accent/20 text-text'
                    : 'border-text/10 bg-white hover:border-text/25 text-text/70'
                  }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleGetTweak}
          disabled={selectedDishes.length === 0 || tweakLoading}
          className="px-6 py-2.5 rounded-full bg-[#b18a96] text-white text-[15px] font-medium
                     hover:bg-[#9e7682] active:scale-[0.98] transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {tweakLoading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('diet_loading_btn')}</>
          ) : (
            t('diet_get_guidance_btn')
          )}
        </button>

        {tweakFailed && tweakResult && (
          <div className="mt-4 flex items-center gap-2 bg-warning/10 border border-warning/25 text-warning rounded-xl px-4 py-2.5 text-[13px] font-medium">
            <span>⚠️</span>
            <span>{t('diet_ai_error')}</span>
            <button
              onClick={handleGetTweak}
              className="ml-auto underline hover:no-underline text-warning/80 cursor-pointer"
            >
              {t('diet_retry')}
            </button>
          </div>
        )}

        {tweakResult && (
          <div className="mt-4 p-5 bg-white border border-[#f5e3df] rounded-2xl animate-[fadeIn_0.3s_ease-out]">
            <p className="text-[14.5px] text-text/80 leading-relaxed">{tweakResult}</p>
          </div>
        )}
      </section>

      {/* ── Base Week Section ── */}
      <section id="base-week">
        <h2 className="font-heading text-xl font-bold text-text mb-2">
          {t('diet_base_week_title')}
        </h2>
        <p className="text-sm text-text/60 mb-8">
          {t('diet_base_week_desc')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {getWeeklyPlan(t).map((dayPlan) => (
            <div key={dayPlan.day} className="bg-white border border-text/10 rounded-2xl p-6 hover:shadow-sm transition-shadow">
              <h3 className="font-heading font-bold text-[15px] text-text mb-4">{dayPlan.day}</h3>
              <div className="flex flex-col gap-3.5">
                {dayPlan.meals.map((meal, index) => {
                  const Icon = MEAL_ICONS[index % 3];
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <Icon />
                      <p className="text-[13.5px] text-text/70 leading-snug">{meal}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer Disclaimer ── */}
      <footer className="mt-16 border-t border-text/5 pt-6 pb-4">
        <p className="text-[11px] text-text/40">
          {t('diet_footer')}
        </p>
      </footer>
    </div>
  );
}
