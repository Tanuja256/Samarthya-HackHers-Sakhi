import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';

/* ── Static myth-vs-fact data — always-visible myth + fact, no flip ── */
const CARDS = [
  {
    myth_en: 'PCOS means you can never have children.',
    myth_mr: 'PCOS म्हणजे तुम्हाला कधीच मुले होऊ शकत नाहीत.',
    fact_en: 'Most women with PCOS conceive, often with simple support. PCOS affects ovulation timing, not your worth or your future family.',
    fact_mr: 'PCOS असलेल्या बहुतेक महिला गर्भवती होतात, अनेकदा साध्या मदतीने. PCOS ओव्ह्युलेशनच्या वेळेवर परिणाम करतो, तुमच्या किमतीवर किंवा तुमच्या भावी कुटुंबावर नाही.',
  },
  {
    myth_en: 'Only overweight women get PCOS.',
    myth_mr: 'फक्त जास्त वजनाच्या महिलांना PCOS होतो.',
    fact_en: 'Lean PCOS is common in India. Weight is one signal among many — a normal BMI does not rule it out.',
    fact_mr: 'लीन PCOS भारतात सामान्य आहे. वजन अनेक संकेतांपैकी एक आहे — सामान्य BMI म्हणजे PCOS नाही असे नाही.',
  },
  {
    myth_en: 'Marriage or having a baby cures PCOS.',
    myth_mr: 'लग्न किंवा बाळ झाल्यावर PCOS बरा होतो.',
    fact_en: "Neither cures it. PCOS is a hormonal and metabolic condition that is managed, not married away.",
    fact_mr: 'दोन्हीपैकी काहीही बरा करत नाही. PCOS ही एक हार्मोनल आणि चयापचय स्थिती आहे जी व्यवस्थापित केली जाते, लग्नाने बरी होत नाही.',
  },
  {
    myth_en: "Irregular periods in your teens are always just 'settling down'.",
    myth_mr: "किशोरवयात अनियमित पाळी म्हणजे फक्त 'स्थिर होत आहे'.",
    fact_en: 'Some irregularity is normal for 1–2 years after menarche. Cycles longer than 45 days after that deserve a check-up.',
    fact_mr: 'मासिक पाळी सुरू झाल्यानंतर १–२ वर्षे काही अनियमितता सामान्य आहे. त्यानंतर ४५ दिवसांपेक्षा मोठी सायकल तपासण्यास पात्र आहे.',
  },
  {
    myth_en: 'PCOS is caused by eating too much.',
    myth_mr: 'PCOS जास्त खाल्ल्यामुळे होतो.',
    fact_en: "Genetics and insulin resistance drive PCOS. Food habits can improve symptoms, but nobody 'ate their way' into it.",
    fact_mr: "जनुकशास्त्र आणि इन्सुलिन प्रतिरोध PCOS चालवतात. आहाराच्या सवयी लक्षणे सुधारू शकतात, पण कोणीही 'खाऊन' PCOS मध्ये गेले नाही.",
  },
  {
    myth_en: 'You must stop rice and all carbs.',
    myth_mr: 'तुम्ही भात आणि सगळे कार्ब्स सोडले पाहिजेत.',
    fact_en: 'You need carbs. Choosing jowar, bajra and whole grains, and pairing rice with dal, protein and sabzi, matters far more than cutting them out.',
    fact_mr: 'तुम्हाला कार्ब्सची गरज आहे. ज्वारी, बाजरी आणि संपूर्ण धान्य निवडणे, आणि भातासोबत डाळ, प्रथिने आणि भाजी जोडणे, ते कापण्यापेक्षा कितीतरी जास्त महत्त्वाचे आहे.',
  },
  {
    myth_en: 'Facial hair means something is wrong with you as a woman.',
    myth_mr: 'चेहऱ्यावरील केस म्हणजे तुमच्यात स्त्री म्हणून काहीतरी चुकीचे आहे.',
    fact_en: 'Excess hair comes from higher androgen levels — a hormone pattern, not a flaw. It is treatable.',
    fact_mr: 'अतिरिक्त केस उच्च एंड्रोजन पातळीमुळे येतात — एक हार्मोन नमुना, दोष नाही. ते उपचारयोग्य आहे.',
  },
  {
    myth_en: "If you feel fine, you don't need to check.",
    myth_mr: "तुम्हाला बरे वाटत असेल तर तपासणीची गरज नाही.",
    fact_en: 'Most Indian women with PCOS are undiagnosed. Untreated insulin resistance quietly raises diabetes risk later, so early screening helps.',
    fact_mr: 'PCOS असलेल्या बहुतेक भारतीय महिलांचे निदान झालेले नाही. उपचार न केलेला इन्सुलिन प्रतिरोध नंतर मधुमेहाचा धोका शांतपणे वाढवतो, त्यामुळे लवकर तपासणी मदत करते.',
  },
];

/* ── Single Card ── */
function MythFactCard({ card, lang }) {
  const myth = lang === 'mr' ? card.myth_mr : card.myth_en;
  const fact = lang === 'mr' ? card.fact_mr : card.fact_en;

  return (
    <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-5 sm:p-6 space-y-4
                    hover:shadow-sm transition-shadow duration-200">
      {/* Myth */}
      <div className="flex gap-3 items-start">
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-text leading-snug">{myth}</p>
      </div>

      {/* Fact */}
      <div className="bg-background/70 border border-secondary/12 rounded-xl p-3.5 flex gap-3 items-start">
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center">
          <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <p className="text-sm text-text/60 leading-relaxed">{fact}</p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Education() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
            {lang === 'mr' ? 'गैरसमज विरुद्ध सत्य' : 'Myth vs fact'}
          </h1>
          <BackButton />
        </div>
        <p className="max-w-2xl text-sm text-text/50 leading-relaxed">
          {lang === 'mr'
            ? "PCOS बद्दल तुम्ही जे ऐकलं ते कधीही वाचलं नाही अशा कोणापासून आलं. चला ते बरोबर करूया."
            : "Most of what you've heard about PCOS came from someone who never read about it. Let's fix that."}
        </p>
      </div>

      {/* 2-column card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CARDS.map((card, idx) => (
          <MythFactCard key={idx} card={card} lang={lang} />
        ))}
      </div>

      {/* Share it forward CTA */}
      <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-6 sm:p-8
                      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary mb-1.5 tracking-wide">
            {lang === 'mr' ? 'पुढे शेअर करा' : 'Share it forward'}
          </p>
          <p className="text-base sm:text-lg font-heading font-semibold text-text leading-snug">
            {lang === 'mr'
              ? 'घरी कोणीतरी अजूनही गैरसमज तीन वर विश्वास ठेवते.'
              : 'Someone at home still believes myth number three.'}
          </p>
        </div>
        <Link
          to="/family-explainer"
          className="shrink-0 px-5 py-2.5 rounded-[var(--radius-button)] bg-accent text-white text-sm font-semibold
                     hover:bg-accent/85 active:scale-[0.97] transition-all duration-200"
        >
          {lang === 'mr' ? 'कुटुंबासाठी स्पष्टीकरण उघडा' : 'Open the family explainer'}
        </Link>
      </div>

      {/* Footer disclaimer */}
      <p className="text-[11px] text-text/30 text-center pb-4">
        {lang === 'mr'
          ? 'सखी हे स्क्रीनिंग आणि सहाय्य साधन आहे. ते PCOS चे निदान करत नाही किंवा डॉक्टरांची जागा घेत नाही.'
          : 'Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.'}
      </p>
    </div>
  );
}
