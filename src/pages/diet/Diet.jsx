import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { callGemini } from '../../lib/callGemini';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

import BackButton from '../../components/BackButton';

/* ══════════════════════════════════════════════════════════════════
   STATIC DATA — Weekly Meal Plan
   ══════════════════════════════════════════════════════════════════ */
const WEEKLY_PLAN = [
  {
    day: 'Monday',
    meals: [
      'Poha with peanuts + a handful of sprouts',
      '2 jowar bhakri, methi sabzi, dahi',
      'Moong dal khichdi, cucumber koshimbir'
    ]
  },
  {
    day: 'Tuesday',
    meals: [
      'Besan chilla with mint chutney',
      'Bajra bhakri, palak-chana sabzi, salad',
      'Masoor dal, half bowl rice, bhendi sabzi'
    ]
  },
  {
    day: 'Wednesday',
    meals: [
      'Upma with extra vegetables',
      'Jowar bhakri, shepu bhaji, buttermilk',
      'Vegetable thalipeeth, curd'
    ]
  },
  {
    day: 'Thursday',
    meals: [
      'Sprouts usal + one boiled egg or paneer',
      'Rajma, half bowl brown rice, kachumber',
      'Bajra khichdi, ambat varan'
    ]
  },
  {
    day: 'Friday',
    meals: [
      'Oats with milk, banana and flaxseed',
      'Jowar bhakri, vangi bhaji, dahi',
      'Toor dal, roti, dudhi sabzi'
    ]
  },
  {
    day: 'Saturday',
    meals: [
      'Moong dal dosa',
      'Bhakri, matki usal, salad',
      'Vegetable pulao with raita'
    ]
  },
  {
    day: 'Sunday',
    meals: [
      'Idli with sambar',
      'Family meal — smaller rice portion, extra sabzi',
      'Soup and paneer/chana bhurji'
    ]
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
const DISH_OPTIONS = [
  { id: 'dal', label: 'Dal' },
  { id: 'rice', label: 'Rice' },
  { id: 'roti', label: 'Roti / Chapati' },
  { id: 'bhakri', label: 'Jowar bhakri' },
  { id: 'sabzi', label: 'Sabzi' },
  { id: 'curd', label: 'Curd / Dahi' },
  { id: 'pickle', label: 'Pickle' },
  { id: 'fried', label: 'Fried item' },
  { id: 'sweet', label: 'Sweet' },
  { id: 'salad', label: 'Salad' },
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
      .map((id) => DISH_OPTIONS.find((d) => d.id === id)?.label)
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
          Eating well, without a separate kitchen
        </h1>
        <BackButton />
      </div>
      <p className="text-[15px] text-text/60 mb-10">
        You don't need special food. You need the same home food, arranged a little differently.
      </p>

      {/* ── Family Plate Section ── */}
      <section className="bg-[#fcf5f3] rounded-[20px] p-8 mb-16 border border-[#f5e3df]">
        <div className="inline-block bg-[#f5e3df] text-[#b87c71] text-[11px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider mb-5">
          Family plate
        </div>

        <h2 className="font-heading text-xl font-bold text-text mb-2">
          What's cooking at home today?
        </h2>
        <p className="text-sm text-text/60 mb-6">
          Tick whatever your family is making. Sakhi will tell you how to build your plate from it.
        </p>

        <div className="flex flex-wrap gap-2.5 mb-8">
          {DISH_OPTIONS.map(({ id, label }) => {
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
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
          ) : (
            'Get today\'s guidance'
          )}
        </button>

        {tweakFailed && tweakResult && (
          <div className="mt-4 flex items-center gap-2 bg-warning/10 border border-warning/25 text-warning rounded-xl px-4 py-2.5 text-[13px] font-medium">
            <span>⚠️</span>
            <span>Couldn't reach the AI — showing a general tip instead.</span>
            <button
              onClick={handleGetTweak}
              className="ml-auto underline hover:no-underline text-warning/80 cursor-pointer"
            >
              Retry
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
      <section>
        <h2 className="font-heading text-xl font-bold text-text mb-2">
          Your base week
        </h2>
        <p className="text-sm text-text/60 mb-8">
          Built on jowar, bajra, dal and leafy greens — nothing imported, nothing expensive.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WEEKLY_PLAN.map((dayPlan) => (
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
          General wellness guidance, not a prescribed medical diet. If you have diabetes, thyroid issues or are pregnant, please check with your doctor or dietitian.
        </p>
      </footer>
    </div>
  );
}
