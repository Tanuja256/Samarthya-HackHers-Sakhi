import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { callGemini } from '../../lib/callGemini';
import { extractLabValuesFromImage } from './callGeminiVision';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import BackButton from '../../components/BackButton';

/* ── Field definitions ── */
const getLabFields = (t) => [
  { key: 'lh',             label: t('lab_report_lh'),                unit: 'IU/L'    },
  { key: 'fsh',            label: t('lab_report_fsh'),               unit: 'IU/L'    },
  { key: 'testosterone',   label: t('lab_report_testosterone'), unit: 'ng/dL'   },
  { key: 'fasting_insulin',label: t('lab_report_insulin'),   unit: 'µIU/mL'  },
];

/* ── Map vision keys → field keys ── */
// callGeminiVision returns { lh, fsh, testosterone, insulin }
// fields use { lh, fsh, testosterone, fasting_insulin }
function visionToFields(extracted) {
  return {
    lh:              extracted.lh            != null ? String(extracted.lh)            : '',
    fsh:             extracted.fsh           != null ? String(extracted.fsh)           : '',
    testosterone:    extracted.testosterone  != null ? String(extracted.testosterone)  : '',
    fasting_insulin: extracted.insulin       != null ? String(extracted.insulin)       : '',
  };
}

export default function LabReport() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  /* ── Lab value inputs ── */
  const [values, setValues] = useState({
    lh: '', fsh: '', testosterone: '', fasting_insulin: '',
  });

  /* ── Photo upload + extraction state ── */
  const [photoFile, setPhotoFile]           = useState(null);   // File object
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');   // object URL for preview
  const [uploadedStoragePath, setUploadedStoragePath] = useState(''); // final path in Storage
  const [photoSource, setPhotoSource]       = useState('typed'); // 'typed' | 'photo'
  const [extracting, setExtracting]         = useState(false);
  const [extractError, setExtractError]     = useState('');     // visible error after extraction

  /* ── Explanation state ── */
  const [analyzing, setAnalyzing]           = useState(false);
  const [explanation, setExplanation]       = useState('');
  const [doctorQuestions, setDoctorQuestions] = useState([]);
  const [usedFallback, setUsedFallback]     = useState(null);   // null | true | false

  /* ─────────────────────────────────────────────────────────────
     FIELD CHANGE
  ───────────────────────────────────────────────────────────── */
  const handleValueChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  /* ─────────────────────────────────────────────────────────────
     FILE SELECTION → UPLOAD → VISION EXTRACTION
  ───────────────────────────────────────────────────────────── */
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL to avoid memory leaks
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);

    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setUploadedStoragePath('');
    setExtractError('');
    setExtracting(true);

    /* ── 1. Upload to Supabase Storage ── */
    let storagePath = '';
    if (user) {
      const timestamp = Date.now();
      const safeName  = file.name.replace(/\s+/g, '_');
      // RLS policy checks: lab-reports/{auth_uid}/...
      storagePath = `lab-reports/${user.id}/${timestamp}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from('lab-reports')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('[LabReport] Storage upload error:', uploadError);
        // Non-fatal: we can still extract from the local File
        setExtractError(t('lab_report_upload_error'));
      } else {
        setUploadedStoragePath(storagePath);
      }
    }

    /* ── 2. Send image to Gemini Vision ── */
    const extracted = await extractLabValuesFromImage(file);

    const allNull = Object.values(extracted).every((v) => v === null);

    if (allNull) {
      // Gemini returned all nulls — image was not a recognisable lab report
      setExtractError(t('lab_report_extract_error'));
      // Don't overwrite whatever the user has already typed
    } else {
      // Populate fields with extracted values (editable — not read-only)
      setValues(visionToFields(extracted));
      setPhotoSource('photo');
      setExtractError(''); // clear any prior error
    }

    setExtracting(false);
    // Reset file input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  /* ─────────────────────────────────────────────────────────────
     EXPLAIN (works identically for typed or photo-sourced values)
  ───────────────────────────────────────────────────────────── */
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setExplanation('');
    setDoctorQuestions([]);
    setUsedFallback(null);

    const filledVals = Object.entries(values)
      .filter(([_, v]) => String(v).trim() !== '')
      .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
      .join(', ');

    if (!filledVals) {
      setAnalyzing(false);
      return;
    }

    const prompt = `The user has provided these lab values: ${filledVals}.
Explain what these numbers mean in simple terms, focusing on common PCOS patterns. Do not diagnose.
Include 2-3 questions they can ask their doctor.
Return ONLY valid JSON in this exact format:
{
  "explanation": "Simple explanation text...",
  "doctorQuestions": ["Question 1", "Question 2"]
}`;

    const FALLBACK_DATA = { explanation: null, doctorQuestions: [] };

    const data = await callGemini(prompt, {
      jsonMode:     true,
      fallbackData: FALLBACK_DATA,
    });

    const isFallback = data?.explanation === null;
    setUsedFallback(isFallback);

    setExplanation(
      data?.explanation ||
      'We analyzed your report, but please review it with your doctor for a proper interpretation.'
    );
    setDoctorQuestions(data?.doctorQuestions ?? []);

    /* ── Save to lab_reports (schema.sql) — only on real Gemini data ── */
    if (user && !isFallback) {
      try {
        // Resolve internal users.id (FK target)
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();

        if (userRow?.id) {
          const { error: saveErr } = await supabase.from('lab_reports').insert({
            user_id:            userRow.id,
            report_date:        new Date().toISOString().split('T')[0],
            values:             values,              // JSONB — current field values (may have been edited)
            explanation:        data?.explanation,
            doctor_questions:   data?.doctorQuestions ?? [],
            source:             photoSource,         // 'typed' | 'photo'
            photo_storage_path: uploadedStoragePath || null,
          });

          if (saveErr) console.warn('[LabReport] lab_reports insert error:', saveErr);
        }
      } catch (saveErr) {
        console.warn('[LabReport] Error saving lab report:', saveErr);
      }
    }

    setAnalyzing(false);
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  const hasAnyValue = Object.values(values).some((v) => String(v).trim() !== '');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-3xl font-bold text-text">
          {t('lab_title')}
        </h1>
        <BackButton />
      </div>
      <p className="text-[15px] text-text/60 mb-10">
        {t('lab_report_page_subtitle')}
      </p>

      {/* ── 2 Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

        {/* ── Left Column: Inputs ── */}
        <div className="bg-white border border-[#f5e3df] rounded-[24px] p-8 shadow-sm">
          <h2 className="font-heading text-[17px] font-bold text-text mb-1">
            {t('lab_report_enter_values')}
          </h2>
          <p className="text-[13px] text-text/50 mb-6">
            {t('lab_report_enter_desc')}
          </p>

          {/* ── Photo upload area ── */}
          <div className="mb-8">
            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
              aria-label="Upload lab report photo"
            />

            {/* Upload button */}
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={extracting}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5
                         rounded-[14px] border-2 border-dashed border-[#d9b8b0]
                         bg-[#fcf5f3] hover:bg-[#f9eeeb] transition-colors
                         text-[13.5px] font-medium text-[#8a5a52]
                         disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {extracting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#8a5a52]/30 border-t-[#8a5a52] rounded-full animate-spin flex-shrink-0" />
                  {t('lab_report_reading_status')}
                </>
              ) : (
                <>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {t('lab_report_upload_btn')}
                </>
              )}
            </button>

            {/* Image preview */}
            {photoPreviewUrl && (
              <div className="mt-4 relative rounded-[14px] overflow-hidden border border-[#f5e3df] shadow-sm">
                <img
                  src={photoPreviewUrl}
                  alt="Lab report preview"
                  className="w-full max-h-48 object-cover"
                />
                {/* Storage path badge */}
                {uploadedStoragePath && (
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px]
                                   px-2 py-0.5 rounded-full backdrop-blur-sm">
                    ✓ {t('lab_report_saved_storage')}
                  </span>
                )}
              </div>
            )}

            {/* Extraction error */}
            {extractError && (
              <div className="mt-3 flex items-start gap-2 bg-warning/10 border border-warning/25
                              text-warning rounded-xl px-4 py-3 text-[13px] font-medium leading-snug">
                <span className="mt-0.5 flex-shrink-0">⚠️</span>
                <span>{extractError}</span>
              </div>
            )}

            {/* Success hint when values were extracted */}
            {!extractError && !extracting && photoSource === 'photo' && hasAnyValue && (
              <p className="mt-2.5 text-[12.5px] text-secondary font-medium">
                ✓ {t('lab_report_extract_success')}
              </p>
            )}
          </div>

          {/* ── Manual value fields ── */}
          <div className="space-y-6 mb-8">
            {getLabFields(t).map((field) => (
              <div key={field.key}>
                <label className="block text-[14px] text-text/80 font-medium mb-2">
                  {field.label}
                  {/* Small badge when field was extracted from photo */}
                  {photoSource === 'photo' && values[field.key] !== '' && (
                    <span className="ml-2 text-[10px] font-semibold text-secondary
                                     bg-secondary/10 px-1.5 py-0.5 rounded-full">
                      {t('lab_report_from_photo')}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={values[field.key]}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    placeholder="—"
                    className="w-full bg-transparent border border-text/20 rounded-[12px] px-4 py-3 text-[15px]
                               focus:border-primary focus:ring-1 focus:ring-primary outline-none
                               transition-all placeholder:text-text/30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px]
                                   text-text/40 pointer-events-none">
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Explain button ── */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleAnalyze}
              disabled={analyzing || extracting || !hasAnyValue}
              className="px-6 py-3 rounded-full bg-[#5e3249] text-white text-[14px] font-medium
                         hover:bg-[#4a2638] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {analyzing ? t('lab_report_analyzing_btn') : t('lab_report_explain_btn')}
            </button>
          </div>

          <p className="text-[12px] text-text/40 leading-relaxed">
            {photoSource === 'photo'
              ? t('lab_report_photo_hint')
              : t('lab_report_type_hint')}
          </p>
        </div>

        {/* ── Right Column: Results ── */}
        <div>
          <div className="bg-white border border-[#f5e3df] rounded-[24px] p-8 shadow-sm h-full">
            <h2 className="font-heading text-[17px] font-bold text-text mb-4">
              {t('lab_report_what_it_means')}
            </h2>

            {!explanation && !analyzing && !extracting && (
              <p className="text-[14.5px] text-text/60">
                {t('lab_report_fill_prompt')}
              </p>
            )}

            {extracting && (
              <div className="flex items-center gap-3 text-primary mb-4">
                <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                <p className="text-[14.5px] font-medium">{t('lab_report_reading_status')}</p>
              </div>
            )}

            {analyzing && (
              <div className="flex items-center gap-3 text-primary">
                <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                <p className="text-[14.5px] font-medium">{t('lab_report_generating')}</p>
              </div>
            )}

            {/* Fallback warning */}
            {usedFallback === true && !analyzing && (
              <div className="mb-4 flex items-center gap-2 bg-warning/10 border border-warning/25
                              text-warning rounded-xl px-4 py-3 text-[13px] font-medium">
                <span>⚠️</span>
                <span>{t('lab_report_ai_error')}</span>
                <button
                  onClick={handleAnalyze}
                  className="ml-auto underline hover:no-underline text-warning/80 cursor-pointer"
                >
                  {t('lab_report_retry')}
                </button>
              </div>
            )}

            {explanation && !analyzing && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <p className="text-[14.5px] text-text/80 leading-relaxed mb-6 whitespace-pre-wrap">
                  {explanation}
                </p>

                {doctorQuestions.length > 0 && (
                  <>
                    <h3 className="text-[14px] font-bold text-text mb-3">{t('lab_report_doctor_questions')}</h3>
                    <ul className="space-y-2">
                      {doctorQuestions.map((q, i) => (
                        <li key={i} className="text-[14px] text-text/75 flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Disclaimer Box ── */}
      <div className="bg-[#fcf5eb] border border-[#f5e3c3] rounded-[16px] p-5 mb-16">
        <p className="text-[14px] text-text/70">
          {t('lab_report_disclaimer_box')}
        </p>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-text/5 pt-6 pb-4">
        <p className="text-[11px] text-text/40">
          {t('lab_report_footer')}
        </p>
      </footer>

    </div>
  );
}
