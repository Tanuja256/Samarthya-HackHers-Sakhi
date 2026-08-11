import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import BackButton from '../../components/BackButton';

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
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#3d3238]">
          {t('festival_title')}
        </h1>
        <BackButton />
      </div>
      <p className="text-[15px] text-[#8e8486] mb-8">
        {t('festival_page_subtitle')}
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
              {t('festival_ganesh_date')}
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#3d3238]">
              {t('festival_ganesh_title')}
            </h2>
          </div>
        </div>

        <p className="text-[17px] text-[#3d3238] font-medium mb-6">
          {t('festival_ganesh_hero')}
        </p>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              {t('festival_ganesh_tip1')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              {t('festival_ganesh_tip2')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              {t('festival_ganesh_tip3')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 flex items-start gap-3 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d3238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M20 6 9 17l-5-5"/></svg>
            <p className="text-[14px] text-[#5c5456] leading-relaxed">
              {t('festival_ganesh_tip4')}
            </p>
          </div>

        </div>
      </div>

      {/* ── Other Festivals Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        
        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">{t('festival_diwali_title')}</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            {t('festival_diwali_desc')}
          </p>
        </div>

        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">{t('festival_navratri_title')}</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            {t('festival_navratri_desc')}
          </p>
        </div>

        <div className="bg-white border border-[#eae0df] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-heading text-[16px] font-bold text-[#3d3238] mb-3">{t('festival_gudi_padwa_title')}</h3>
          <p className="text-[14px] text-[#8e8486] leading-relaxed">
            {t('festival_gudi_padwa_desc')}
          </p>
        </div>

      </div>

      <button
        onClick={() => navigate('/diet', { state: { scrollTo: 'base-week' } })}
        className="px-6 py-3 rounded-full bg-white border border-[#eae0df] text-[#3d3238] text-[14.5px] font-bold shadow-sm hover:bg-[#fcfcfc] transition-colors cursor-pointer"
      >
        {t('festival_see_plan_btn')}
      </button>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-[#eae0df] pt-6 pb-2">
        <p className="text-[12px] text-[#a8a1a3] font-medium text-center">
          {t('lab_report_footer')}
        </p>
      </footer>
    </div>
  );
}
