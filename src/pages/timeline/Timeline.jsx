import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';

import BackButton from '../../components/BackButton';

/* ── Seed Data ── */
const SEED_PHOTOS = [
  { id: 'seed-1', category: 'Jawline — week 1', taken_at: '2026-03-12T00:00:00Z', bg: 'bg-[#F9EBEF]', _seed: true },
  { id: 'seed-2', category: 'Jawline — week 5', taken_at: '2026-04-09T00:00:00Z', bg: 'bg-[#EAF2ED]', _seed: true },
  { id: 'seed-3', category: 'Hairline check', taken_at: '2026-05-18T00:00:00Z', bg: 'bg-[#FAEFDF]', _seed: true },
  { id: 'seed-4', category: 'Jawline — week 15', taken_at: '2026-06-21T00:00:00Z', bg: 'bg-[#EBE7F2]', _seed: true },
  { id: 'seed-5', category: 'Jawline — week 20', taken_at: '2026-07-27T00:00:00Z', bg: 'bg-[#FAEBEF]', _seed: true },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ── Modal Component ── */
function Modal({ isOpen, title, children, onCancel, onConfirm, confirmText = 'Save', confirmColor = 'bg-[#643652] hover:bg-[#522942]', isConfirmDisabled = false, lang = 'en' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-text/30 backdrop-blur-[2px] transition-opacity" onClick={handleBackdropClick} />
      <div className="relative bg-[#F9F9F6] w-full max-w-sm rounded-[24px] shadow-xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="font-heading text-lg sm:text-xl font-bold text-text">{title}</h3>
        <div className="text-text/70">
          {children}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2.5 text-sm font-semibold text-text/60 hover:text-text hover:bg-text/5 rounded-[var(--radius-button)] transition-colors"
          >
            {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isConfirmDisabled}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-[var(--radius-button)] transition-all active:scale-[0.98] disabled:opacity-50 ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Single photo card ── */
function PhotoCard({ photo, onDelete, onEdit, lang = 'en' }) {
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.category);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditSubmit = () => {
    if (editTitle.trim() && editTitle !== photo.category) {
      if (onEdit) onEdit(photo.id, editTitle.trim());
    } else {
      setEditTitle(photo.category);
    }
    setIsEditing(false);
  };

  const handleDeleteRequest = () => setShowDeleteModal(true);

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    
    if (photo._seed) {
      onDelete(photo.id);
      return;
    }
    
    setDeleting(true);

    try {
      if (photo.storage_path) {
        const { error: storageErr } = await supabase.storage.from('photos').remove([photo.storage_path]);
        if (storageErr) throw storageErr;
      }

      if (!photo.id.startsWith('local-')) {
        const { error: dbErr } = await supabase.from('photos').delete().eq('id', photo.id);
        if (dbErr) throw dbErr;
      }
      
      onDelete(photo.id);
    } catch (err) {
      console.error('[Timeline] Delete error:', err);
      alert(`Delete failed on server, removing locally: ${err.message || 'Unknown error'}`);
      onDelete(photo.id);
    } finally {
      setDeleting(false);
    }
  };

  const { data: urlData } = photo.storage_path 
    ? supabase.storage.from('photos').getPublicUrl(photo.storage_path) 
    : { data: null };
  const imgSrc = photo.local_url || urlData?.publicUrl;

  return (
    <div className="bg-white border border-text/5 rounded-[20px] overflow-hidden shadow-sm flex flex-col h-[280px]">
      {/* Image / Placeholder Area */}
      <div className={`flex-1 ${photo.bg || 'bg-[#F9EBEF]'} relative flex items-center justify-center overflow-hidden`}>
        {imgSrc && !imgError && !photo._seed ? (
          <img
            src={imgSrc}
            alt={photo.category}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-text/30 font-medium tracking-wide">Photo placeholder</span>
        )}
      </div>

      {/* Metadata Footer */}
      <div className="bg-white p-5 flex items-center justify-between border-t border-text/5">
        <div className="flex-1 mr-3 min-w-0">
          {isEditing ? (
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
              className="w-full text-[15px] font-semibold text-text border-b border-primary focus:outline-none bg-transparent"
            />
          ) : (
            <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
              <p className="text-[15px] font-semibold text-text truncate">{photo.category}</p>
              <svg className="w-3.5 h-3.5 text-text/0 group-hover:text-text/40 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          )}
          <p className="text-[13px] text-text/45 mt-0.5">{formatDate(photo.taken_at)}</p>
        </div>
        
        <button
          onClick={handleDeleteRequest}
          disabled={deleting}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-text/5 text-text/40 hover:text-text/70 transition-colors"
          title="Delete photo"
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          )}
        </button>
      </div>

      <Modal
        isOpen={showDeleteModal}
        title={lang === 'mr' ? 'फोटो हटवायचा?' : 'Delete this photo?'}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        confirmText={lang === 'mr' ? 'हटवा' : 'Delete'}
        confirmColor="bg-red-500 hover:bg-red-600"
        lang={lang}
      >
        <p className="text-[15px]">{lang === 'mr' ? 'तुम्हाला खात्री आहे का की तुम्हाला हा फोटो हटवायचा आहे? हे पूर्ववत करता येणार नाही.' : 'Are you sure you want to delete this photo? This cannot be undone.'}</p>
      </Modal>
    </div>
  );
}

/* ── Main Page ── */
export default function Timeline() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { user, loading } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [usingSeed, setUsingSeed] = useState(false);
  const [timelineOn, setTimelineOn] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [addTitle, setAddTitle] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setFetching(false);
      return;
    }

    const fetchPhotos = async () => {
      try {
        const query = supabase.from('photos').select('*');
        const filtered = typeof query.eq === 'function' ? query.eq('user_id', user.id) : query;
        const ordered = typeof filtered.order === 'function' ? filtered.order('taken_at', { ascending: false }) : filtered;
        const result = ordered.then ? await ordered : ordered;
        const { data, error } = result;
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("No data");
        setPhotos(data);
        setUsingSeed(false);
      } catch (err) {
        console.error('[Timeline] Fetch error or empty, using local fallback:', err);
        const localPhotos = JSON.parse(localStorage.getItem(`timeline_photos_${user.id}`) || '[]');
        const deletedSeeds = JSON.parse(localStorage.getItem(`deleted_seeds_${user.id}`) || '[]');
        
        const activeSeeds = SEED_PHOTOS.filter(p => !deletedSeeds.includes(p.id));
        const combined = [...localPhotos, ...activeSeeds].sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at));
        
        setPhotos(combined);
        setUsingSeed(activeSeeds.length > 0 && localPhotos.length === 0);
      }
      setFetching(false);
    };
    fetchPhotos();
  }, [user]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      alert("You need to be logged in to save photos.");
      return;
    }

    setPendingFile(file);
    setAddTitle(lang === 'mr' ? 'नवीन फोटो' : 'New photo');
    setShowAddModal(true);
    
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleConfirmAdd = async () => {
    setShowAddModal(false);
    const file = pendingFile;
    const userTitle = addTitle.trim() || (lang === 'mr' ? 'नवीन फोटो' : 'New photo');
    setPendingFile(null);
    setAddTitle('');
    
    if (!file) return;

    const ext = file.name.split('.').pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

    try {
      const { error: storageErr } = await supabase.storage.from('photos').upload(path, file);
      if (storageErr) throw storageErr;

      const { data: row, error: dbErr } = await supabase.from('photos').insert({
        user_id: user.id,
        storage_path: path,
        category: userTitle,
        taken_at: new Date().toISOString(),
      }).select().single();
      
      if (dbErr) throw dbErr;

      if (row) {
        setPhotos(prev => [row, ...prev]);
        setUsingSeed(false);
      }
    } catch (err) {
      console.error('[Timeline] Upload error, falling back to local storage:', err);
      // Fallback to local base64 storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const fakeRow = {
          id: `local-${Date.now()}`,
          user_id: user.id,
          storage_path: null,
          local_url: reader.result,
          category: userTitle + ' (Local)',
          taken_at: new Date().toISOString(),
          bg: 'bg-[#F9EBEF]',
        };
        
        setPhotos(prev => [fakeRow, ...prev]);
        const localPhotos = JSON.parse(localStorage.getItem(`timeline_photos_${user.id}`) || '[]');
        localPhotos.unshift(fakeRow);
        localStorage.setItem(`timeline_photos_${user.id}`, JSON.stringify(localPhotos));
        setUsingSeed(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (id, newTitle) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, category: newTitle } : p));

    if (!id.startsWith('local-') && !id.startsWith('seed-')) {
      try {
        const { error } = await supabase.from('photos').update({ category: newTitle }).eq('id', id);
        if (error) console.error("DB update error:", error);
      } catch (err) {
        console.error("DB update exception:", err);
      }
    }

    if (id.startsWith('local-') || id.startsWith('seed-')) {
      const localPhotos = JSON.parse(localStorage.getItem(`timeline_photos_${user.id}`) || '[]');
      const exists = localPhotos.find(p => p.id === id);
      
      if (exists) {
        const updatedLocal = localPhotos.map(p => p.id === id ? { ...p, category: newTitle } : p);
        localStorage.setItem(`timeline_photos_${user.id}`, JSON.stringify(updatedLocal));
      } else if (id.startsWith('seed-')) {
        const seedPhoto = SEED_PHOTOS.find(p => p.id === id);
        if (seedPhoto) {
          const editedSeed = { ...seedPhoto, category: newTitle };
          localPhotos.push(editedSeed);
          localStorage.setItem(`timeline_photos_${user.id}`, JSON.stringify(localPhotos));
          
          const deletedSeeds = JSON.parse(localStorage.getItem(`deleted_seeds_${user.id}`) || '[]');
          if (!deletedSeeds.includes(id)) {
            deletedSeeds.push(id);
            localStorage.setItem(`deleted_seeds_${user.id}`, JSON.stringify(deletedSeeds));
          }
        }
      }
    }
  };

  const handleDeleted = (id) => {
    if (SEED_PHOTOS.some(p => p.id === id)) {
      const deletedSeeds = JSON.parse(localStorage.getItem(`deleted_seeds_${user.id}`) || '[]');
      if (!deletedSeeds.includes(id)) {
        deletedSeeds.push(id);
        localStorage.setItem(`deleted_seeds_${user.id}`, JSON.stringify(deletedSeeds));
      }
    } else if (id.startsWith('local-')) {
      const localPhotos = JSON.parse(localStorage.getItem(`timeline_photos_${user.id}`) || '[]');
      const updated = localPhotos.filter(p => p.id !== id);
      localStorage.setItem(`timeline_photos_${user.id}`, JSON.stringify(updated));
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  /* Loading */
  if (loading || fetching) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <svg className="w-8 h-8 animate-spin text-[#643652]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  /* Not logged in */
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EBEBE6] flex items-center justify-center mx-auto mb-5 text-3xl">
          🔒
        </div>
        <h1 className="font-heading text-2xl font-bold text-text mb-3">
          {lang === 'mr' ? 'खाजगी फोटो टाइमलाइन' : 'Private photo timeline'}
        </h1>
        <p className="text-text/55 text-sm mb-6">
          {lang === 'mr' ? 'तुमची सुरक्षित टाइमलाइन उघडण्यासाठी लॉग इन करा.' : 'Please log in to access your secure timeline.'}
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-[var(--radius-button)] bg-[#643652] text-white text-sm font-semibold hover:bg-[#522942] transition-colors"
        >
          {lang === 'mr' ? 'लॉग इन करा' : 'Log in'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text">
            {lang === 'mr' ? 'खाजगी फोटो टाइमलाइन' : 'Private photo timeline'}
          </h1>
          <BackButton />
        </div>
        <p className="text-sm sm:text-[15px] text-text/50 leading-relaxed">
          {lang === 'mr'
            ? 'त्वचा आणि केस हळूहळू बदलतात. महिनाभरानंतर काढलेले फोटो ते दाखवतात जे आरसा कधीच दाखवणार नाही.'
            : 'Skin and hair change slowly. Photos taken a month apart show what a mirror never will.'}
        </p>
      </div>

      {/* Privacy Banner */}
      <div className="bg-[#F2F3EC] border border-[#E3E6D5] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="w-12 h-12 rounded-xl bg-white border border-[#E3E6D5] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text text-base mb-1">
            {lang === 'mr' ? 'खाजगी, कधीही शेअर केले नाही, कधीही हटवा' : 'Private, never shared, delete anytime'}
          </h3>
          <p className="text-[13px] text-text/60 leading-relaxed">
            {lang === 'mr'
              ? 'हे फोटो या डेमोमध्ये तुमच्या डिव्हाइसवर राहतात. काहीही अपलोड केले जात नाही, समुदायाला काहीही दाखवले जात नाही आणि हे पेज इतर कोणीही उघडू शकत नाही. टाइमलाइन बंद करा आणि सर्वकाही नाहीसे होते.'
              : 'These photos stay on your device in this demo. Nothing is uploaded, nothing is shown to the community, and no one else can open this page. Turn the timeline off and everything disappears.'}
          </p>
        </div>
        {/* Toggle Switch */}
        <button 
          onClick={() => setTimelineOn(!timelineOn)}
          className={`shrink-0 w-12 h-7 rounded-full relative transition-colors duration-200 focus:outline-none ${timelineOn ? 'bg-[#91AB8A]' : 'bg-text/20'}`}
        >
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${timelineOn ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
      </div>

      {timelineOn && (
        <>
          {/* Add Photo Button */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileRef.current?.click()}
              className="px-5 py-2.5 rounded-[var(--radius-button)] bg-[#643652] text-white text-sm font-semibold
                         hover:bg-[#522942] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
            >
              <span>+</span>
              {lang === 'mr' ? 'आजचा फोटो जोडा' : "Add today's photo"}
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onDelete={handleDeleted} onEdit={handleEdit} lang={lang} />
            ))}
          </div>
          
          {usingSeed && (
            <div className="pt-4">
              <span className="bg-[#EBEBE6] text-text/50 px-3 py-1.5 rounded-full text-[11px] font-semibold">
                Sample timeline seeded for this demo
              </span>
            </div>
          )}
        </>
      )}

      {/* Footer disclaimer */}
      <p className="text-[11px] text-text/40 pt-10">
        {lang === 'mr'
          ? 'सखी हे स्क्रीनिंग आणि सहाय्य साधन आहे. ते PCOS चे निदान करत नाही किंवा डॉक्टरांची जागा घेत नाही.'
          : 'Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.'}
      </p>

      {/* Add Photo Modal */}
      <Modal
        isOpen={showAddModal}
        title={lang === 'mr' ? 'आजचा फोटो जोडा' : "Add today's photo"}
        onCancel={() => { setShowAddModal(false); setPendingFile(null); }}
        onConfirm={handleConfirmAdd}
        confirmText={lang === 'mr' ? 'जोडा' : 'Add'}
        confirmColor="bg-[#643652] hover:bg-[#522942]"
        lang={lang}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text">
            {lang === 'mr' ? 'फोटोचे नाव' : 'Photo title'}
          </label>
          <input 
            autoFocus
            type="text" 
            value={addTitle} 
            onChange={(e) => setAddTitle(e.target.value)} 
            placeholder={lang === 'mr' ? 'उदा. आठवडा २, केस तपासणी' : 'e.g. Week 2, Jawline check'}
            className="w-full text-[15px] p-3 rounded-xl border border-text/15 focus:outline-none focus:border-[#643652] focus:ring-1 focus:ring-[#643652] transition-all bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmAdd();
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
