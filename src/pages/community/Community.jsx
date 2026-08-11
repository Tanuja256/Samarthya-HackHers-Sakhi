import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import BackButton from '../../components/BackButton';

/* ── Seed posts — shown when Supabase returns nothing / not configured ── */
const SEED_POSTS = [
  {
    id: 'seed-1',
    city_en: 'Pune',
    city_mr: 'पुणे',
    age: 22,
    body_en: 'My cycle finally came after 68 days. I cried a little. Anyone else feel weirdly emotional about a period arriving?',
    body_mr: 'माझी पाळी शेवटी ६८ दिवसांनंतर आली. मी थोडे रडले. पाळी आल्यावर अजून कोणाला खूप भावनिक वाटतं का?',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    is_flagged: false,
    _seed: true,
  },
  {
    id: 'seed-2',
    city_en: 'Nagpur',
    city_mr: 'नागपूर',
    age: 19,
    body_en: 'Told my mother about PCOS using the family page here. She read it twice and then asked what she should cook. Small win.',
    body_mr: 'इथल्या फॅमिली पेजचा वापर करून माझ्या आईला PCOS बद्दल सांगितले. तिने ते दोनदा वाचले आणि नंतर विचारले की तिने काय स्वयंपाक करावा. छोटा विजय.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    is_flagged: false,
    _seed: true,
  },
  {
    id: 'seed-3',
    city_en: 'Nashik',
    city_mr: 'नाशिक',
    age: 26,
    body_en: 'Doctor said to lose weight and left it there. Switched to a gynaec who actually explained insulin resistance. Ask questions, please.',
    body_mr: 'डॉक्टरांनी वजन कमी करायला सांगितले आणि विषय तिथेच सोडला. मी दुसरा स्त्रीरोगतज्ज्ञ निवडला ज्याने प्रत्यक्षात इन्सुलिन रेझिस्टन्सबद्दल समजावून सांगितले. कृपया प्रश्न विचारा.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_flagged: false,
    _seed: true,
  },
  {
    id: 'seed-4',
    city_en: 'Chhatrapati Sambhajinagar',
    city_mr: 'छत्रपती संभाजीनगर',
    age: 24,
    body_en: 'Swapped my evening chai-biscuit for chai and roasted chana. Two weeks in, the 5pm crash is much softer.',
    body_mr: 'माझा संध्याकाळचा चहा-बिस्किट बदलून चहा आणि भाजलेले चणे खाण्यास सुरुवात केली. दोन आठवड्यांनंतर, संध्याकाळी ५ वाजता होणारा थकवा खूप कमी झाला आहे.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    is_flagged: false,
    _seed: true,
  },
  {
    id: 'seed-5',
    city_en: 'Kolhapur',
    city_mr: 'कोल्हापूर',
    age: 17,
    body_en: "Is facial hair always PCOS? Mine started at 16 and everyone at home says it's normal in our family.",
    body_mr: 'चेहऱ्यावरील केस नेहमीच PCOS असतात का? माझे १६ व्या वर्षी सुरू झाले आणि घरातील प्रत्येकजण म्हणतो की आमच्या कुटुंबात हे सामान्य आहे.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    is_flagged: false,
    _seed: true,
  },
];

function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ── Post Card ── */
function PostCard({ post, t, onFlag, lang }) {
  const [flagged, setFlagged] = useState(post.is_flagged);
  const [flagging, setFlagging] = useState(false);
  const [likes, setLikes] = useState(post.likes !== undefined ? post.likes : Math.floor(Math.random() * 80) + 10);
  const [liked, setLiked] = useState(false);

  const handleFlag = async () => {
    if (flagged || post._seed) return;
    setFlagging(true);
    
    try {
      const updatedPost = { ...post, is_flagged: true };
      if (window.storage) {
        await window.storage.set(post.id, updatedPost, true);
      } else {
        localStorage.setItem(post.id, JSON.stringify(updatedPost));
      }
      setFlagged(true);
    } catch (err) {
      console.error('[Community] Flag error:', err);
    } finally {
      setFlagging(false);
    }
  };

  const handleLike = async () => {
    const increment = liked ? -1 : 1;
    const newLikesCount = likes + increment;
    
    // Optimistic update
    setLikes(newLikesCount);
    setLiked(!liked);

    if (post._seed) return; // Don't persist likes for seeds

    try {
      const updatedPost = { ...post, likes: newLikesCount };
      if (window.storage) {
        await window.storage.set(post.id, updatedPost, true);
      } else {
        localStorage.setItem(post.id, JSON.stringify(updatedPost));
      }
    } catch (err) {
      console.error('[Community] Like error:', err);
      // Revert optimistic update on failure
      setLikes(likes);
      setLiked(liked);
    }
  };

  return (
    <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-5
                    hover:shadow-sm transition-shadow duration-200 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-xs text-text/45">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span>{post._seed ? (lang === 'mr' ? post.city_mr : post.city_en) : (post.city || 'Maharashtra')}</span>
        <span>·</span>
        <span>{post.age ? `${post.age}` : '24'}</span>
        <span>·</span>
        <span>{relativeTime(post.created_at)}</span>
      </div>

      {/* Body */}
      <p className="text-sm text-text/80 leading-relaxed">
        {post._seed ? (lang === 'mr' ? post.body_mr : post.body_en) : post.body}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={handleLike}
          className={`text-[11px] flex items-center gap-1.5 transition-colors ${
            liked ? 'text-primary' : 'text-text/45 hover:text-text/70'
          }`}
        >
          <svg className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {likes}
        </button>

        <button
          id={`flag-post-${post.id}`}
          onClick={handleFlag}
          disabled={flagged || flagging || post._seed}
          title={t('community_flag_btn')}
          className={`text-[11px] flex items-center gap-1.5 transition-colors
            ${flagged
              ? 'text-warning cursor-default'
              : 'text-text/45 hover:text-red-400 cursor-pointer'}`}
        >
          {flagged ? (
            <>✓ {t('community_flagged')}</>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18m0-13.5l7.5-4.5 4.5 4.5L21 4.5v10.5L15 10.5l-4.5 4.5L3 10.5" />
              </svg>
              Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Compose Box ── */
function ComposeBox({ user, onPosted, t, lang }) {
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const MAX = 280;

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX) return;
    setPosting(true);

    const postId = `posts:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPost = {
      id: postId,
      city: 'Pune', // Hardcoded for demo to match screenshot
      age: 22,
      body: trimmed,
      created_at: new Date().toISOString(),
      is_flagged: false,
      likes: 0
    };

    try {
      if (window.storage) {
        await window.storage.set(postId, newPost, true);
      } else {
        localStorage.setItem(postId, JSON.stringify(newPost));
      }
      onPosted(newPost);
      setText('');
    } catch (err) {
      console.error('[Community] Failed to post:', err);
      alert('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white/60 border border-text/8 rounded-[var(--radius-card)] p-5 space-y-4">
      <textarea
        id="community-compose"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={lang === 'mr' ? 'असं काहीतरी जे आधी कुणीतरी तुम्हाला सांगितलं असतं तर...' : 'Something you wish someone had told you earlier...'}
        maxLength={MAX + 20}
        className="w-full resize-none p-4 text-sm border border-text/15 rounded-xl bg-white
                   focus:outline-none focus:ring-1 focus:ring-text/30 text-text placeholder:text-text/35"
      />
      <div className="flex items-center gap-4">
        <button
          id="community-post-btn"
          onClick={handlePost}
          disabled={posting || text.trim().length === 0 || text.length > MAX}
          className="px-5 py-2.5 rounded-[var(--radius-button)] bg-[#B898A4] text-white text-sm font-semibold
                     hover:bg-[#A68692] active:scale-[0.97] transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {lang === 'mr' ? 'अनामिकपणे पोस्ट करा' : 'Post anonymously'}
        </button>
        <span className="text-[11px] text-text/45">
          {lang === 'mr' ? 'असे पोस्ट केले: पुणे मधील २२ वर्षीय' : 'Posted as: a 22-year-old from Pune'}
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Community() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingSeed, setUsingSeed] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let fetchedPosts = [];
        if (window.storage) {
          const keys = await window.storage.list('posts:', true);
          if (keys && keys.length > 0) {
            for (const key of keys) {
              const post = await window.storage.get(key, true);
              if (post && !post.is_flagged) {
                fetchedPosts.push(post);
              }
            }
          }
        } else {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('posts:')) {
              try {
                const post = JSON.parse(localStorage.getItem(key));
                if (post && !post.is_flagged) {
                  fetchedPosts.push(post);
                }
              } catch (e) {
                console.error('Failed to parse local post:', e);
              }
            }
          }
        }

        const activeSeeds = SEED_POSTS.filter(p => !p.is_flagged);
        const combined = [...fetchedPosts, ...activeSeeds].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setPosts(combined);
        setUsingSeed(true);
      } catch (err) {
        console.error('[Community] Fetch posts error:', err);
        setPosts(SEED_POSTS);
        setUsingSeed(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handlePosted = (row) => {
    setPosts((prev) => [row, ...prev]);
    // Don't disable seeds just because they posted locally in a stub
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
            {lang === 'mr' ? 'कम्युनिटी वॉल' : 'Community wall'}
          </h1>
          <BackButton />
        </div>
        <p className="max-w-2xl text-sm text-text/50 leading-relaxed">
          {lang === 'mr'
            ? 'नावे नाहीत, फोटो नाहीत, प्रोफाईल नाहीत. फक्त तुमचे शहर आणि वय, तुम्हाला शेअर करायचे असल्यास.'
            : 'No names, no photos, no profiles. Just your city and your age, if you want to share them.'}
        </p>
      </div>

      {/* Compose box — shown to everyone in this target UI */}
      <ComposeBox user={user} onPosted={handlePosted} t={t} lang={lang} />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-text/10 rounded-[var(--radius-card)]">
          <p className="text-text/45 text-sm">{t('community_empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} t={t} lang={lang} />
          ))}
        </div>
      )}

      {/* Footer disclaimer */}
      {usingSeed && (
        <div className="flex items-center gap-3 pt-4">
          <span className="bg-text/8 text-text/50 px-3 py-1 rounded-full text-[11px] font-medium">
            Sample posts seeded for this demo
          </span>
          <span className="text-[11px] text-text/40">
            Medical advice from strangers isn't medical advice. Please take big decisions to a doctor.
          </span>
        </div>
      )}

      <p className="text-[11px] text-text/30 pt-16">
        {lang === 'mr'
          ? 'सखी हे स्क्रीनिंग आणि सहाय्य साधन आहे. ते PCOS चे निदान करत नाही किंवा डॉक्टरांची जागा घेत नाही.'
          : 'Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.'}
      </p>
    </div>
  );
}
