import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* ══════════════════════════════════════════════════════════════════
   FESTIVAL DATA — Pre-written guidance for Maharashtrian festivals
   Non-restrictive tone: portioning/timing tips, never "avoid this"
   ══════════════════════════════════════════════════════════════════ */

const FESTIVALS = [
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    nameMarathi: 'गणेश चतुर्थी',
    emoji: '🐘',
    period: 'August – September',
    gradient: 'from-orange-50/80 to-amber-50/60',
    borderColor: 'border-amber-200/40',
    badgeColor: 'bg-amber-100 text-amber-700',
    heroText: 'Modak season is here — and you can absolutely enjoy modak! 🎉',
    heroSubtext: 'Festivals are for joy. Here are a few small tricks to celebrate fully while keeping your body happy.',
    foods: [
      { name: 'Modak (steamed)', emoji: '🥟', safe: true },
      { name: 'Modak (fried)', emoji: '🍘', safe: false },
      { name: 'Puran Poli', emoji: '🫓', safe: false },
      { name: 'Ukdiche Modak', emoji: '🥟', safe: true },
      { name: 'Karanji', emoji: '🥮', safe: false },
      { name: 'Panchamrut', emoji: '🥛', safe: true },
    ],
    tips: [
      {
        icon: '⏰',
        title: 'Timing matters more than skipping',
        body: 'Have your modak or sweet after a proper meal, not on an empty stomach. Eating protein (dal, curd) first slows down the sugar spike.',
      },
      {
        icon: '🥟',
        title: 'Choose steamed over fried',
        body: 'Ukdiche modak (steamed) are lighter than fried ones. Have 2-3 steamed modak and enjoy them fully — no guilt needed.',
      },
      {
        icon: '🍽️',
        title: 'Portion with love, not restriction',
        body: 'Take a smaller plate for the festive spread. You\'ll still eat everything — just naturally smaller portions. Nobody notices.',
      },
      {
        icon: '🚶‍♀️',
        title: 'A short walk after the feast',
        body: 'Even a 10-15 minute walk after heavy festival meals helps your body process the sugar better. Visit a neighbor\'s Ganpati — walk there!',
      },
      {
        icon: '💧',
        title: 'Hydrate between sweets',
        body: 'Drink water or buttermilk between sweet items. It helps digestion and naturally slows down how much you eat.',
      },
      {
        icon: '🌙',
        title: 'Light dinner on heavy prasad days',
        body: 'If you had a generous prasad lunch, keep dinner to just dal-rice or khichdi. Balance across the day, not meal-by-meal.',
      },
    ],
    specialNote: 'Remember: one festival meal won\'t undo months of good habits. Celebrate with your family — Bappa wants you happy, not stressed about food! 🙏',
  },
  {
    id: 'diwali',
    name: 'Diwali',
    nameMarathi: 'दिवाळी',
    emoji: '🪔',
    period: 'October – November',
    gradient: 'from-purple-50/60 to-pink-50/50',
    borderColor: 'border-purple-200/40',
    badgeColor: 'bg-purple-100 text-purple-700',
    heroText: 'Faral season, family gatherings, and mithai boxes — let\'s enjoy it smartly! ✨',
    heroSubtext: 'Diwali lasts multiple days. Small daily choices matter more than one "perfect" meal.',
    foods: [
      { name: 'Chakli', emoji: '🌀', safe: true },
      { name: 'Karanji', emoji: '🥮', safe: false },
      { name: 'Ladoo (Besan)', emoji: '🟡', safe: false },
      { name: 'Chivda / Mixture', emoji: '🥜', safe: true },
      { name: 'Shankarpali', emoji: '🍪', safe: false },
      { name: 'Anarse', emoji: '🍘', safe: false },
    ],
    tips: [
      {
        icon: '📅',
        title: 'Spread out the faral',
        body: 'You don\'t have to eat every sweet on day one. Spread your faral enjoyment across the 5 days of Diwali. Have a few pieces each day.',
      },
      {
        icon: '🥜',
        title: 'Start with savory, then sweet',
        body: 'Reach for the chivda or chakli first — they have more fiber and protein. Then have one or two sweet items.',
      },
      {
        icon: '🍳',
        title: 'Don\'t skip meals for mithai',
        body: 'Skipping lunch to "save room" for sweets actually makes insulin spikes worse. Eat your regular meals and enjoy sweets as small additions.',
      },
      {
        icon: '🏠',
        title: 'Homemade > store-bought',
        body: 'If you\'re making faral at home, you control the sugar and oil. Use jaggery where possible, bake instead of frying karanji.',
      },
      {
        icon: '☕',
        title: 'Herbal tea between visiting rounds',
        body: 'When visiting multiple houses, carry a bottle of water. Have a cup of green tea or tulsi tea between sweet-heavy visits.',
      },
      {
        icon: '💪',
        title: 'Morning walk ritual',
        body: 'Start each Diwali morning with a 20-minute walk. It primes your body to handle the day\'s festive eating better.',
      },
    ],
    specialNote: 'Diwali is about light, love, and togetherness. Your PCOS doesn\'t take a holiday, but you can manage it joyfully — not fearfully. 🪔',
  },
];

/* ══════════════════════════════════════════════════════════════════
   FESTIVAL PAGE COMPONENT
   ══════════════════════════════════════════════════════════════════ */

export default function Festival() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      
      {/* ── Page Header ── */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#3d3238] mb-2">
        Festival mode
      </h1>
      <p className="text-[15px] text-[#8e8486] mb-8">
        Festivals are not a test you can fail. Here's how to enjoy them and still feel good on the other side.
      </p>

      {/* ── Featured Festival Card ── */}
      <div className="bg-[#f2e9eb] rounded-[24px] p-6 sm:p-10 mb-8 border border-[#e8dade] shadow-sm">
        
        <div className="flex items-start gap-4 mb-6">
          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-full bg-[#e1ced3] flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4a2638" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18"/><path d="M3 12h18"/><path d="m18.36 5.64-12.72 12.72"/><path d="m5.64 5.64 12.72 12.72"/>
            </svg>
          </div>
          
          <div>
            <div className="inline-block bg-[#e1ced3] text-[#4a2638] text-[12px] font-bold px-3 py-1 rounded-full mb-2 tracking-wide">
              Sep 14 - Sep 24
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3238]">
              Ganesh Chaturthi
            </h2>
          </div>
        </div>

        <p className="text-[17px] text-[#3d3238] font-medium mb-6">
          Modak season is here — and you can absolutely have modak.
        </p>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              Steamed ukadiche modak over fried ones when you get the choice — same taste, gentler on your insulin.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              Eat modak right after a meal with dal or curd, not on an empty stomach at 4pm.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              Two modaks and a walk with your cousins beats zero modaks and a bad mood.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              Keep the sabudana khichdi portion the size of your fist and pair it with peanuts and curd.
            </p>
          </div>

        </div>
      </div>

      {/* ── Other Festivals Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">Diwali</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            Faral is fine. Eat it as part of a meal, not instead of one, and keep the chakli count honest.
          </p>
        </div>

        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">Navratri</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            Fasting can spike cravings later. Sabudana with peanuts and curd holds you far longer than sabudana alone.
          </p>
        </div>

        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">Gudi Padwa</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            Puran poli with ghee is genuinely nourishing. Have one, walk after, skip the second.
          </p>
        </div>

      </div>

      <button className="px-6 py-3 rounded-full bg-white border border-[#eae0df] text-[#3d3238] text-[14.5px] font-bold shadow-sm hover:bg-[#fcfcfc] transition-colors">
        See my everyday plan
      </button>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-[#eae0df] pt-6 pb-2">
        <p className="text-[12px] text-[#a8a1a3] font-medium text-center">
          Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.
        </p>
      </footer>
    </div>
  );
}
