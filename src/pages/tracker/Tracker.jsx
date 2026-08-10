import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Symptom chips — keys written to symptom_logs.symptom */
const SYMPTOM_CHIPS = [
  { label: 'Acne', key: 'acne' },
  { label: 'Low energy', key: 'low_energy' },
  { label: 'Hair fall', key: 'hair_fall' },
  { label: 'Cramps', key: 'cramps' },
  { label: 'Mood dips', key: 'mood_dips' },
  { label: 'Cravings', key: 'cravings' },
  { label: 'Bloating', key: 'bloating' },
  { label: 'Poor sleep', key: 'poor_sleep' },
];

/* Severity — label shown to user; value stored in symptom_logs.severity (1–5) */
const SEVERITY_OPTIONS = [
  { label: 'Mild', value: 2 },
  { label: 'Moderate', value: 3 },
  { label: 'Strong', value: 5 },
];

/* ═══════════════════════════════════════════════════════════
   DEMO / SEED DATA  — shown when no user is logged in
   Matches the data visible in the reference screenshot.
═══════════════════════════════════════════════════════════ */
function buildSeedPeriodDates(year, month) {
  const s = new Set();
  for (const d of [2, 3, 4, 5]) {
    s.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return s;
}

function buildSeedSymptomDates(year, month) {
  const s = new Set();
  for (const d of [9, 12, 16, 21]) {
    s.add(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
  return s;
}

const SEED_CYCLE_DATA = [
  { label: 'Mar', length: 46 },
  { label: 'Apr', length: 48 },
  { label: 'May', length: 41 },
  { label: 'Jun', length: 38 },
  { label: 'Jul', length: 35 },
  { label: 'Aug', length: 32 },
];

const SEED_SYMPTOM_DATA = [
  { name: 'Acne', count: 12 },
  { name: 'Low energy', count: 20 },
  { name: 'Hair fall', count: 8 },
  { name: 'Cramps', count: 10 },
  { name: 'Mood dips', count: 13 },
  { name: 'Cravings', count: 18 },
];

/* ═══════════════════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════════════════ */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function getOrCreateUserId(authUser) {
  const { data: existing, error: fe } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (fe && fe.code !== 'PGRST116') {
    console.error('[Sakhi Tracker] user row fetch error:', fe);
    return null;
  }
  if (existing?.id) return existing.id;

  const { data: created, error: ce } = await supabase
    .from('users')
    .upsert(
      { auth_id: authUser.id, name: authUser.email?.split('@')[0] ?? 'Sakhi User' },
      { onConflict: 'auth_id' }
    )
    .select('id')
    .single();

  if (ce) { console.error('[Sakhi Tracker] user row create error:', ce); return null; }
  return created?.id ?? null;
}

/* ═══════════════════════════════════════════════════════════
   CALENDAR GRID COMPONENT
═══════════════════════════════════════════════════════════ */
function CalendarGrid({ year, month, selectedDate, periodDates, symptomDates, onSelectDate, onPrevMonth, onNextMonth }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDaySun = new Date(year, month, 1).getDay();   // 0 = Sun
  const firstDayMon = (firstDaySun + 6) % 7;               // convert to Mon-first: Mon=0, Sun=6
  const today = todayStr();

  // Build cell array: null for padding cells, number for real days
  const cells = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const ds = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div>
      {/* ── Month header + legend + nav ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-text/8 transition-colors cursor-pointer text-text/45"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h3 className="font-heading text-base font-bold text-text px-1">
            {MONTH_NAMES[month]} {year}
          </h3>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-text/8 transition-colors cursor-pointer text-text/45"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-text/50">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            Period
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary inline-block" />
            Symptom
          </span>
        </div>
      </div>

      {/* ── Day-of-week header (Mon → Sun) ── */}
      <div className="grid grid-cols-7 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-text/35 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className="h-10" />;

          const dStr = ds(day);
          const hasPeriod = periodDates.has(dStr);
          const hasSymptom = symptomDates.has(dStr);
          const isSelected = selectedDate === dStr;
          const isToday = dStr === today;

          return (
            <button
              key={day}
              type="button"
              id={`cal-day-${dStr}`}
              onClick={() => onSelectDate(dStr)}
              className={[
                'flex flex-col items-center justify-center h-10 rounded-lg text-sm transition-all cursor-pointer select-none',
                isSelected
                  ? 'border-2 border-accent text-accent font-semibold bg-accent/5'
                  : isToday
                    ? 'text-primary font-semibold hover:bg-primary/8'
                    : 'text-text/65 hover:bg-text/5',
              ].join(' ')}
            >
              <span className="leading-none">{day}</span>
              {/* Dots row — always rendered at fixed height so cells align */}
              <span className="h-2 flex items-center gap-0.5 mt-0.5">
                {hasPeriod && <span className="w-1.5 h-1.5 rounded-full bg-primary  block" />}
                {hasSymptom && <span className="w-1.5 h-1.5 rounded-full bg-secondary block" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOG PANEL COMPONENT
   key={selectedDate} is passed from parent so it remounts
   on date change, resetting local chip/severity state.
═══════════════════════════════════════════════════════════ */
function LogPanel({ date, onSaveSymptoms, onMarkPeriod, globalSaving }) {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState('Moderate');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const displayDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
    : '';

  const toggle = (key) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSave = async () => {
    if (selected.length === 0) { flash('Select at least one symptom first.'); return; }
    setSaving(true);
    await onSaveSymptoms(date, selected, severity);
    setSaving(false);
    setSelected([]);
    flash(`${selected.length} symptom${selected.length > 1 ? 's' : ''} saved!`);
  };

  const handlePeriod = async () => {
    setSaving(true);
    await onMarkPeriod(date);
    setSaving(false);
    flash('Marked as period day!');
  };

  const isDisabled = saving || globalSaving;

  return (
    <div>
      <h3 className="font-heading text-base font-bold text-text mb-4">
        Log for {displayDate}
      </h3>

      {/* ── Symptom chips ── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {SYMPTOM_CHIPS.map(({ label, key }) => (
          <button
            key={key}
            type="button"
            id={`chip-${key}`}
            onClick={() => toggle(key)}
            className={[
              'px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all cursor-pointer',
              selected.includes(key)
                ? 'border-primary/50 bg-primary/12 text-primary'
                : 'border-text/15 text-text/60 hover:border-primary/35 hover:bg-primary/5',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Severity selector ── */}
      <p className="text-sm font-medium text-text/65 mb-2.5">How strong was it?</p>
      <div className="flex gap-2 mb-5">
        {SEVERITY_OPTIONS.map(({ label }) => (
          <button
            key={label}
            type="button"
            id={`severity-${label.toLowerCase()}`}
            onClick={() => setSeverity(label)}
            className={[
              'flex-1 py-2.5 rounded-[var(--radius-button)] border text-sm font-medium transition-all cursor-pointer',
              severity === label
                ? 'border-primary bg-primary text-white'
                : 'border-text/15 text-text/60 hover:border-primary/35 bg-transparent',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Feedback message ── */}
      {msg && (
        <p className={`text-xs mb-3 leading-relaxed ${msg.includes('Select') ? 'text-warning' : 'text-secondary'}`}>
          {msg}
        </p>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-2.5 flex-wrap">
        <button
          type="button"
          id="log-save-symptoms-btn"
          disabled={isDisabled}
          onClick={handleSave}
          className="px-4 py-2.5 rounded-[var(--radius-button)] bg-accent text-white text-sm font-semibold
                     hover:bg-accent/85 active:scale-[0.98] transition-all cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save symptoms
        </button>
        <button
          type="button"
          id="log-mark-period-btn"
          disabled={isDisabled}
          onClick={handlePeriod}
          className="px-4 py-2.5 rounded-[var(--radius-button)] border border-text/20 text-sm font-medium
                     text-text/65 hover:bg-text/5 transition-all cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mark as period day
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN TRACKER COMPONENT
═══════════════════════════════════════════════════════════ */
export default function Tracker() {
  const { user } = useAuth();
  const isDemo = !user;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [globalSaving, setGlobalSaving] = useState(false);

  /* Calendar dot sets */
  const [periodDates, setPeriodDates] = useState(() =>
    isDemo ? buildSeedPeriodDates(now.getFullYear(), now.getMonth()) : new Set()
  );
  const [symptomDates, setSymptomDates] = useState(() =>
    isDemo ? buildSeedSymptomDates(now.getFullYear(), now.getMonth()) : new Set()
  );

  /* Chart data */
  const [cycleData, setCycleData] = useState(() => isDemo ? SEED_CYCLE_DATA : []);
  const [symptomData, setSymptomData] = useState(() => isDemo ? SEED_SYMPTOM_DATA : []);

  /* ── Load this month's dots from Supabase ── */
  const loadMonthData = useCallback(async () => {
    if (!user) return;
    const userId = await getOrCreateUserId(user);
    if (!userId) return;

    const pad = (n) => String(n).padStart(2, '0');
    const monthStart = `${year}-${pad(month + 1)}-01`;
    const monthEnd = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;

    const [cyclesRes, symptomsRes] = await Promise.all([
      supabase
        .from('cycle_logs')
        .select('cycle_start')
        .eq('user_id', userId)
        .gte('cycle_start', monthStart)
        .lte('cycle_start', monthEnd),
      supabase
        .from('symptom_logs')
        .select('logged_at')
        .eq('user_id', userId)
        .gte('logged_at', monthStart + 'T00:00:00')
        .lte('logged_at', monthEnd + 'T23:59:59'),
    ]);

    if (cyclesRes.data) setPeriodDates(new Set(cyclesRes.data.map((r) => r.cycle_start)));
    if (symptomsRes.data) setSymptomDates(new Set(symptomsRes.data.map((r) => r.logged_at.slice(0, 10))));
  }, [user, year, month]);

  /* ── Load chart data from Supabase ── */
  const loadChartData = useCallback(async () => {
    if (!user) return;
    const userId = await getOrCreateUserId(user);
    if (!userId) return;

    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);

    const [chartCyclesRes, chartSymptomsRes] = await Promise.all([
      supabase
        .from('cycle_logs')
        .select('cycle_start, cycle_end')
        .eq('user_id', userId)
        .not('cycle_end', 'is', null)
        .gte('cycle_start', sixMonthsAgo.toISOString().slice(0, 10))
        .order('cycle_start', { ascending: true })
        .limit(8),
      supabase
        .from('symptom_logs')
        .select('symptom')
        .eq('user_id', userId)
        .gte('logged_at', ninetyDaysAgo.toISOString()),
    ]);

    if (chartCyclesRes.data?.length > 0) {
      const built = chartCyclesRes.data
        .map((c) => {
          const start = new Date(c.cycle_start + 'T00:00:00');
          const end = new Date(c.cycle_end + 'T00:00:00');
          const days = Math.round((end - start) / 86_400_000);
          return { label: SHORT_MONTHS[start.getMonth()], length: days };
        })
        .filter((c) => c.length > 0 && c.length < 90);
      setCycleData(built);
    }

    if (chartSymptomsRes.data?.length > 0) {
      const counts = {};
      chartSymptomsRes.data.forEach(({ symptom }) => {
        const meta = SYMPTOM_CHIPS.find((s) => s.key === symptom);
        const name = meta?.label ?? symptom;
        counts[name] = (counts[name] ?? 0) + 1;
      });
      setSymptomData(
        Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => ({ name, count }))
      );
    }
  }, [user]);

  useEffect(() => { loadMonthData(); }, [loadMonthData]);
  useEffect(() => { loadChartData(); }, [loadChartData]);

  /* ── Month navigation ── */
  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  /* ── Save handlers ── */
  const handleSaveSymptoms = async (date, symptomKeys, severityLabel) => {
    const severityValue = SEVERITY_OPTIONS.find((s) => s.label === severityLabel)?.value ?? 3;

    if (!user) {
      setSymptomDates((prev) => new Set([...prev, date]));
      return;
    }

    setGlobalSaving(true);
    const userId = await getOrCreateUserId(user);
    if (userId) {
      const rows = symptomKeys.map((key) => ({
        user_id: userId,
        symptom: key,
        severity: severityValue,
        source: 'manual',
        logged_at: new Date(date + 'T12:00:00').toISOString(),
      }));
      const { error } = await supabase.from('symptom_logs').insert(rows);
      if (error) console.error('[Sakhi Tracker] symptom insert error:', error);
      else {
        setSymptomDates((prev) => new Set([...prev, date]));
        await loadChartData();
      }
    }
    setGlobalSaving(false);
  };

  const handleMarkPeriod = async (date) => {
    if (!user) {
      setPeriodDates((prev) => new Set([...prev, date]));
      return;
    }

    setGlobalSaving(true);
    const userId = await getOrCreateUserId(user);
    if (userId) {
      const { error } = await supabase
        .from('cycle_logs')
        .insert({ user_id: userId, cycle_start: date });
      if (error) console.error('[Sakhi Tracker] period mark error:', error);
      else setPeriodDates((prev) => new Set([...prev, date]));
    }
    setGlobalSaving(false);
  };

  /* ── Smart insight strings ── */
  const cycleInsight = (() => {
    if (cycleData.length < 2) {
      return 'Log a few cycles with start and end dates to see your trend here.';
    }
    const first = cycleData[0].length;
    const last = cycleData[cycleData.length - 1].length;
    if (last < first) return "Under 35 days is the comfortable zone. Yours is trending down — that's good news.";
    if (last > first) return 'Cycles have been a bit longer recently. Keep logging — patterns become clearer over time.';
    return 'Your cycle length has been consistent over the last few months.';
  })();

  const symptomInsight = (() => {
    if (symptomData.length === 0) return 'Log symptoms to see which ones appear most often for you.';
    const top = symptomData[0].name;
    const second = symptomData[1]?.name;
    return second
      ? `${top} and ${second.toLowerCase()} show up most often for you.`
      : `${top} shows up most often for you.`;
  })();

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">

      {/* ── Page heading ── */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-1">
          Cycle &amp; symptom tracker
        </h1>
        <p className="text-sm text-text/50">
          Tap a date to log a period day or how you felt. Two minutes a week is enough to see a pattern.
        </p>
      </div>

      {/* ── Top grid: Calendar | Log panel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Calendar card */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <CalendarGrid
            year={year}
            month={month}
            selectedDate={selectedDate}
            periodDates={periodDates}
            symptomDates={symptomDates}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </div>

        {/* Log panel card — key ensures local state resets on date change */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <LogPanel
            key={selectedDate}
            date={selectedDate}
            onSaveSymptoms={handleSaveSymptoms}
            onMarkPeriod={handleMarkPeriod}
            globalSaving={globalSaving}
          />
        </div>
      </div>

      {/* ── Bottom grid: Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Cycle length line chart */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-text mb-1">
            Cycle length over 6 months
          </h3>
          <p className="text-xs text-primary mb-4 leading-relaxed">{cycleInsight}</p>

          {cycleData.length < 2 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">🌙</span>
              <p className="text-sm text-text/40 max-w-xs leading-relaxed">
                Log cycles with a start and end date to see your trend.
              </p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A2808" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 60]}
                    ticks={[0, 15, 30, 45, 60]}
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #D9888025',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    formatter={(v) => [`${v} days`, 'Cycle length']}
                  />
                  <Line
                    type="monotone"
                    dataKey="length"
                    stroke="#D98880"
                    strokeWidth={2}
                    dot={{ fill: '#FDF8F3', stroke: '#D98880', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 5, fill: '#D98880', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Symptom frequency bar chart */}
        <div className="bg-white/65 backdrop-blur-sm border border-primary/15 rounded-[var(--radius-card)] p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-text mb-1">
            Symptoms logged{' '}
            <span className="text-text/40 font-normal text-sm">(last 90 days)</span>
          </h3>
          <p className="text-xs text-text/50 mb-4 leading-relaxed">{symptomInsight}</p>

          {symptomData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center gap-2">
              <span className="text-2xl">📊</span>
              <p className="text-sm text-text/40 max-w-xs leading-relaxed">
                Log symptoms to see your frequency chart.
              </p>
            </div>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2A2808" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#2E2A2865' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDF8F3',
                      border: '1px solid #8FA88825',
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                    formatter={(v) => [`${v} times`, 'Logged']}
                  />
                  <Bar dataKey="count" fill="#8FA888" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ── Demo note ── */}
      {isDemo && (
        <p className="text-xs text-primary/70 mb-5">
          Sample data seeded for{' '}
          <a href="/login" className="underline hover:text-primary transition-colors">
            this demo
          </a>
        </p>
      )}

      {/* ── Footer disclaimer ── */}
      <footer className="border-t border-text/8 pt-4 pb-2">
        <p className="text-[11px] text-text/35 text-center">
          Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.
        </p>
      </footer>
    </div>
  );
}
