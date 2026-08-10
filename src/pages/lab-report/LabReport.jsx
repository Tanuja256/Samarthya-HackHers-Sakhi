import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { callGemini } from '../../lib/callGemini';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';

const LAB_FIELDS = [
  { key: 'lh', label: 'LH', unit: 'IU/L' },
  { key: 'fsh', label: 'FSH', unit: 'IU/L' },
  { key: 'testosterone', label: 'Total testosterone', unit: 'ng/dL' },
  { key: 'fasting_insulin', label: 'Fasting insulin', unit: 'µIU/mL' },
];

export default function LabReport() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [values, setValues] = useState({
    lh: '', fsh: '', testosterone: '', fasting_insulin: '',
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [doctorQuestions, setDoctorQuestions] = useState([]);

  const handleValueChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleUploadPhoto = () => {
    // Mock filling values for the demo
    setValues({
      lh: '12.5',
      fsh: '4.2',
      testosterone: '65',
      fasting_insulin: '18',
    });
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setExplanation('');
    setDoctorQuestions([]);

    const filledVals = Object.entries(values)
      .filter(([_, v]) => v.trim() !== '')
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

    try {
      const response = await callGemini(prompt, true);
      const data = JSON.parse(response);
      setExplanation(data.explanation || 'We analyzed your report, but please review it with your doctor for a proper interpretation.');
      setDoctorQuestions(data.doctorQuestions || []);

      // Log to supabase
      if (user) {
        const { data: userData } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
        if (userData) {
          await supabase.from('lab_logs').insert({
            user_id: userData.id,
            raw_values: values,
            explanation: data.explanation
          });
        }
      }
    } catch (err) {
      console.warn('[LabReport] Gemini failed:', err.message);
      setExplanation("Based on your numbers, there might be a hormonal imbalance often seen in PCOS (like elevated LH or testosterone). Please show this report to your doctor for a proper diagnosis.");
      setDoctorQuestions([
        "What do these specific numbers mean for my cycle?",
        "Do I need any other tests, like an ultrasound or glucose tolerance test?"
      ]);
    }
    
    setAnalyzing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      
      {/* ── Page Header ── */}
      <h1 className="font-heading text-3xl font-bold text-text mb-2">
        Lab report translator
      </h1>
      <p className="text-[15px] text-text/60 mb-10">
        Your report is written for doctors. Here's the same thing, written for you.
      </p>

      {/* ── 2 Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Left Column: Inputs */}
        <div className="bg-white border border-[#f5e3df] rounded-[24px] p-8 shadow-sm">
          <h2 className="font-heading text-[17px] font-bold text-text mb-6">
            Enter your values
          </h2>

          <div className="space-y-6 mb-8">
            {LAB_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-[14px] text-text/80 font-medium mb-2">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={values[field.key]}
                    onChange={(e) => handleValueChange(field.key, e.target.value)}
                    placeholder="—"
                    className="w-full bg-transparent border border-text/20 rounded-[12px] px-4 py-3 text-[15px]
                               focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text/30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-text/40 pointer-events-none">
                    {field.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-6 py-3 rounded-full bg-[#5e3249] text-white text-[14px] font-medium
                         hover:bg-[#4a2638] transition-colors disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Explain my report'}
            </button>
            <button
              onClick={handleUploadPhoto}
              className="px-6 py-3 rounded-full bg-white border border-text/20 text-text/80 text-[14px] font-medium
                         hover:bg-[#fcf5f3] transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload a photo
            </button>
          </div>
          
          <p className="text-[12.5px] text-text/50 leading-relaxed">
            Photo upload is mocked for this demo — it fills in a sample report so you can see the output.
          </p>
        </div>

        {/* Right Column: Results */}
        <div>
          <div className="bg-white border border-[#f5e3df] rounded-[24px] p-8 shadow-sm h-full">
            <h2 className="font-heading text-[17px] font-bold text-text mb-4">
              What it means
            </h2>
            
            {!explanation && !analyzing && (
              <p className="text-[14.5px] text-text/60">
                Fill in whatever you have — even one value works — and Sakhi will explain it.
              </p>
            )}

            {analyzing && (
              <div className="flex items-center gap-3 text-primary">
                <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-[14.5px] font-medium">Reading your report...</p>
              </div>
            )}

            {explanation && !analyzing && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                <p className="text-[14.5px] text-text/80 leading-relaxed mb-6 whitespace-pre-wrap">
                  {explanation}
                </p>
                
                {doctorQuestions.length > 0 && (
                  <>
                    <h3 className="text-[14px] font-bold text-text mb-3">Questions for your doctor:</h3>
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
          Educational only. Reference ranges differ between labs, and no single value confirms or rules out PCOS. Always read your report together with your doctor.
        </p>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-text/5 pt-6 pb-4">
        <p className="text-[11px] text-text/40">
          Sakhi is a screening and support tool. It does not diagnose PCOS or replace a doctor.
        </p>
      </footer>

    </div>
  );
}
