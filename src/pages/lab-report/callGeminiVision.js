/**
 * callGeminiVision.js
 *
 * Sends a base64-encoded image to the Gemini multimodal API and asks it to
 * extract lab values (LH, FSH, testosterone, fasting insulin) from the image.
 *
 * Uses the same model as callGemini.js (gemini-3.5-flash-lite) but sends a
 * multimodal request body with an inline_data part for the image.
 *
 * Returns: { lh: number|null, fsh: number|null, testosterone: number|null, insulin: number|null }
 * Never throws — returns null values on any failure.
 */

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const FALLBACK = { lh: null, fsh: null, testosterone: null, insulin: null };

/**
 * Converts a File object to a base64 string (data content only, no prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,<content>" — strip the prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Sends the image to Gemini Vision and returns extracted lab values.
 *
 * @param {File} imageFile  - The image file selected by the user
 * @returns {Promise<{ lh: number|null, fsh: number|null, testosterone: number|null, insulin: number|null }>}
 */
export async function extractLabValuesFromImage(imageFile) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[callGeminiVision] Gemini API key is missing.');
    return FALLBACK;
  }

  let base64Image;
  try {
    base64Image = await fileToBase64(imageFile);
  } catch (err) {
    console.error('[callGeminiVision] Failed to read image file:', err);
    return FALLBACK;
  }

  const prompt = `You are a medical lab report parser.
Look at this lab report image and extract the numeric values for these four tests ONLY:
1. LH (Luteinising Hormone) — in IU/L
2. FSH (Follicle Stimulating Hormone) — in IU/L
3. Total Testosterone — in ng/dL
4. Fasting Insulin — in µIU/mL or mIU/L

Rules:
- Return ONLY a JSON object with exactly these four keys: lh, fsh, testosterone, insulin
- Each value must be a number (float or integer) if found, or null if NOT visible in the image
- Do NOT invent values. If a test result is not present or not readable, use null
- Do NOT include units, ranges, flags, or any other text in the JSON values
- If the image is not a lab report or no relevant values are visible at all, return all nulls

IMPORTANT: Respond with ONLY raw valid JSON. No markdown, no explanation.
Example: {"lh": 12.5, "fsh": 4.2, "testosterone": 65, "insulin": 18}`;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                // Image part (inline_data multimodal)
                {
                  inline_data: {
                    mime_type: imageFile.type || 'image/jpeg',
                    data: base64Image,
                  },
                },
                // Text prompt part
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1, // very low — we want deterministic extraction
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(
        `[callGeminiVision] Gemini API error: ${response.status} ${response.statusText}`,
        errBody
      );
      return FALLBACK;
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('[callGeminiVision] Empty or malformed Gemini response:', data);
      return FALLBACK;
    }

    // Strip markdown fences if the model included them despite instructions
    let cleaned = generatedText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // Sanitise: coerce each field to number or null, never pass strings through
    const sanitise = (v) => {
      if (v === null || v === undefined) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    return {
      lh:           sanitise(parsed?.lh),
      fsh:          sanitise(parsed?.fsh),
      testosterone: sanitise(parsed?.testosterone),
      insulin:      sanitise(parsed?.insulin),
    };
  } catch (err) {
    console.error('[callGeminiVision] Network or parse error:', err);
    return FALLBACK;
  }
}
