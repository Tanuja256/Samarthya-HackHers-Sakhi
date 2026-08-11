import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BackButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex items-center justify-center w-9 h-9 rounded-full bg-white/60 border border-text/10 
                 text-text/60 hover:bg-white hover:text-text hover:shadow-sm transition-all duration-200 shrink-0"
      aria-label={t('btn_back', 'Back')}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
