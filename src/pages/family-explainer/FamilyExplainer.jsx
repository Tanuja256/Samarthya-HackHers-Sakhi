import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/* ── Content ── */
const CONTENT = {
  en: {
    tag: 'For parents and family',
    title: 'Someone you love wants you to read this.',
    intro: "She isn't in danger. She isn't careless. Her body is dealing with something very common called PCOS, and she'd like you to understand it — because your support makes it much easier to manage.",
    cards: [
      {
        title: 'What PCOS is',
        bg: 'bg-white',
        content: (
          <div className="space-y-3">
            <p className="text-[15px] text-text/60 leading-relaxed">
              Think of the body's hormones as a household routine. In PCOS, one part of that routine runs late. The ovaries don't release an egg every month on time, so periods come late, or heavily, or not for months. Along with it, the body handles sugar less efficiently, which affects skin, hair, energy and weight.
            </p>
            <p className="text-[15px] text-text/60 leading-relaxed">
              Around one in five young Indian women has it. In Maharashtra, studies suggest close to 22 in every 100. It runs in families, like diabetes and thyroid do.
            </p>
          </div>
        )
      },
      {
        title: 'What PCOS is not',
        bg: 'bg-white',
        content: (
          <div className="space-y-2.5 text-[15px] text-text/60 leading-relaxed">
            <p>· It is not cancer, and it is not contagious.</p>
            <p>· It is not caused by anything she did wrong, ate, or thought.</p>
            <p>· It does not mean she cannot have children. Most women with PCOS do.</p>
            <p>· It is not cured by marriage, and it is not cured by "just losing weight".</p>
            <p>· It is not a secret she should have to keep from her own family.</p>
          </div>
        )
      },
      {
        icon: (
          <svg className="w-5 h-5 mr-2 inline-block text-text shrink-0 relative -top-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        title: 'Four things that genuinely help',
        bg: 'bg-[#F2F3EC]',
        content: (
          <div className="space-y-4 text-[15px] text-text/80 leading-relaxed">
            <p>Cook one small change, not two menus. More jowar or bajra bhakri, more sabzi and dal, a little less rice. The whole family benefits.</p>
            <p>Let her sleep. Poor sleep directly worsens the hormone pattern. This is medical, not laziness.</p>
            <p>Don't comment on weight or skin. She already notices. What helps is company on a walk, not a remark at dinner.</p>
            <p>Go with her to the doctor once. A gynaecologist visit, blood tests and an ultrasound settle most questions.</p>
          </div>
        )
      }
    ],
    share_btn: 'Share this page',
    share_hint: 'Works on WhatsApp too',
    copied: '✓ Link copied!',
    footer: 'This page is for understanding, not diagnosis. Please see a qualified doctor for medical advice.'
  },
  mr: {
    tag: 'पालक आणि कुटुंबासाठी',
    title: 'ज्यांच्यावर तुम्ही प्रेम करता त्यांना वाटतं की तुम्ही हे वाचावं.',
    intro: "ती धोक्यात नाहीये. ती निष्काळजी नाहीये. तिचे शरीर PCOS नावाच्या एका अत्यंत सामान्य गोष्टीचा सामना करत आहे, आणि तुम्ही ते समजून घ्यावे अशी तिची इच्छा आहे — कारण तुमच्या पाठिंब्यामुळे ते व्यवस्थापित करणे खूप सोपे होते.",
    cards: [
      {
        title: 'PCOS म्हणजे काय',
        bg: 'bg-white',
        content: (
          <div className="space-y-3">
            <p className="text-[15px] text-text/60 leading-relaxed">
              शरीराच्या हार्मोन्सचा विचार घरगुती दिनचर्येसारखा करा. PCOS मध्ये, त्या दिनचर्येचा एक भाग उशिरा चालतो. अंडाशय दर महिन्याला वेळेवर अंडी सोडत नाहीत, त्यामुळे पाळी उशिरा येते, किंवा जास्त रक्तस्राव होतो, किंवा महिनोनमहिने येत नाही. यासोबतच, शरीर साखरेचा वापर कमी कार्यक्षमतेने करते, ज्याचा परिणाम त्वचा, केस, ऊर्जा आणि वजनावर होतो.
            </p>
            <p className="text-[15px] text-text/60 leading-relaxed">
              पाचपैकी एका तरुण भारतीय महिलेला याचा त्रास आहे. महाराष्ट्रात, अभ्यासानुसार १०० पैकी जवळपास २२ महिलांना याचा त्रास आहे. हे मधुमेह आणि थायरॉईडप्रमाणेच कुटुंबातून अनुवांशिकरीत्या येऊ शकते.
            </p>
          </div>
        )
      },
      {
        title: 'PCOS काय नाही',
        bg: 'bg-white',
        content: (
          <div className="space-y-2.5 text-[15px] text-text/60 leading-relaxed">
            <p>· हा कर्करोग नाही, आणि हा संसर्गजन्य नाही.</p>
            <p>· तिने काही चुकीचे केले, खाल्ले, किंवा विचार केले यामुळे हे होत नाही.</p>
            <p>· याचा अर्थ असा नाही की तिला मुले होऊ शकत नाहीत. PCOS असलेल्या बहुतेक महिलांना मुले होतात.</p>
            <p>· हे लग्नाने बरे होत नाही, आणि ते "फक्त वजन कमी करून" बरे होत नाही.</p>
            <p>· हे असे रहस्य नाही जे तिने स्वतःच्या कुटुंबापासून लपवून ठेवावे.</p>
          </div>
        )
      },
      {
        icon: (
          <svg className="w-5 h-5 mr-2 inline-block text-text shrink-0 relative -top-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        title: 'चार गोष्टी ज्या खरोखर मदत करतात',
        bg: 'bg-[#F2F3EC]',
        content: (
          <div className="space-y-4 text-[15px] text-text/80 leading-relaxed">
            <p>एक छोटा बदल शिजवा, दोन मेनू नाही. जास्त ज्वारी किंवा बाजरीची भाकरी, जास्त भाजी आणि डाळ, थोडा कमी भात. याचा संपूर्ण कुटुंबाला फायदा होतो.</p>
            <p>तिला झोपू द्या. खराब झोप थेट हार्मोन नमुना खराब करते. हे वैद्यकीय आहे, आळशीपणा नाही.</p>
            <p>वजन किंवा त्वचेवर टिप्पणी करू नका. तिला आधीच माहित असते. रात्रीच्या जेवणाच्या वेळी टिप्पणी करण्यापेक्षा, फिरायला सोबत जाणे मदत करते.</p>
            <p>तिच्यासोबत एकदा डॉक्टरांकडे जा. स्त्रीरोगतज्ज्ञांची भेट, रक्त तपासणी आणि अल्ट्रासाऊंड बहुतांश प्रश्न सोडवतात.</p>
          </div>
        )
      }
    ],
    share_btn: 'हे पेज शेअर करा',
    share_hint: 'WhatsApp वर देखील काम करते',
    copied: '✓ लिंक कॉपी झाली!',
    footer: 'हे पेज समजून घेण्यासाठी आहे, निदानासाठी नाही. कृपया वैद्यकीय सल्ल्यासाठी योग्य डॉक्टरांचा सल्ला घ्या.'
  }
};

export default function FamilyExplainer() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'mr' ? 'mr' : 'en';
  const content = CONTENT[lang];
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: 'Understanding PCOS — A Guide for Families',
      text: 'A clear, compassionate guide explaining PCOS for family members.',
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled — no-op
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(url);
        setCopyMsg(content.copied);
        setTimeout(() => setCopyMsg(''), 3000);
      } catch {
        setCopyMsg(`Copy this link: ${url}`);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Header Section */}
      <div className="space-y-6 max-w-3xl">
        <span className="inline-block bg-[#EBEBE6] text-text/60 text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide">
          {content.tag}
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight tracking-tight">
          {content.title}
        </h1>
        <p className="text-base sm:text-lg text-text/50 leading-relaxed max-w-2xl">
          {content.intro}
        </p>
      </div>

      {/* Cards Section */}
      <div className="space-y-6">
        {content.cards.map((card, idx) => (
          <div key={idx} className={`${card.bg} rounded-[20px] p-6 sm:p-8 shadow-sm border border-text/5`}>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-text mb-4 flex items-center">
              {card.icon}
              {card.title}
            </h2>
            {card.content}
          </div>
        ))}
      </div>

      {/* Share & Footer Section */}
      <div className="pt-4 space-y-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#643652] text-white text-sm font-semibold hover:bg-[#522942] active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-5.367 3 3 0 000 5.367zm0 8.001a3 3 0 100-5.367 3 3 0 000 5.367z" />
            </svg>
            {content.share_btn}
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-text/40 font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {copyMsg || content.share_hint}
          </div>
        </div>

        <p className="text-[11px] text-text/40 border-t border-text/5 pt-6">
          {content.footer}
        </p>
      </div>
    </div>
  );
}
