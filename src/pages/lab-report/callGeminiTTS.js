/**
 * callGeminiTTS.js
 *
 * Sends text to the Gemini API and requests audio output.
 * Converts the returned base64 PCM data to a playable WAV Blob.
 */

const GEMINI_MODEL = 'gemini-3.1-flash-tts-preview';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Helper to write strings to DataView
 */
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts base64 PCM (24kHz, 16-bit, mono) to a WAV Blob
 */
function pcmToWav(pcmBase64, sampleRate = 24000) {
  const binaryString = atob(pcmBase64);
  const pcmData = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    pcmData[i] = binaryString.charCodeAt(i);
  }

  // A WAV header is 44 bytes
  const wavBuffer = new Uint8Array(44 + pcmData.length);
  const view = new DataView(wavBuffer.buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true);

  // Write PCM data
  wavBuffer.set(pcmData, 44);

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Sends the text to Gemini and returns an object URL for the audio
 * 
 * @param {string} text - The explanation text to read out loud
 * @param {string} language - Current language (e.g. 'en', 'mr')
 * @returns {Promise<{url: string|null, error: string|null}>}
 */
export async function generateSpeech(text, language = 'en') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('[callGeminiTTS] Gemini API key is missing.');
    return { url: null, error: "System configuration error (missing API key)." };
  }

  // Guide the model to use the correct pronunciation language
  const langInstruction = language === 'mr' 
    ? 'Please read the following text out loud in Marathi natively and naturally.' 
    : 'Please read the following text out loud natively and naturally.';
    
  const prompt = `${langInstruction}\n\n${text}`;

  try {
    const response = await fetch(
      `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: "Kore" }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      // Safely attempt to parse the error body as JSON for detailed logging
      const errBody = await response.json().catch(() => null);
      console.error(
        `[callGeminiTTS] HTTP Error ${response.status}:`,
        'Full error body:', errBody
      );
      const msg = errBody?.error?.message || "Failed to generate audio from the server.";
      return { url: null, error: `Audio generation failed: ${msg}` };
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const inlineData = candidate?.content?.parts?.find(p => p.inlineData)?.inlineData;

    if (!inlineData || !inlineData.data) {
      console.error('[callGeminiTTS] No audio data returned in response. data =', data);
      return { url: null, error: "The audio service returned an invalid response." };
    }

    const wavBlob = pcmToWav(inlineData.data);
    return { url: URL.createObjectURL(wavBlob), error: null };
  } catch (error) {
    console.error('[callGeminiTTS] Network or parse error. Full error object:', error);
    return { url: null, error: "Network error. Please check your connection and try again." };
  }
}
