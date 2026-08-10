/**
 * Calls the Gemini API with a given prompt and returns the parsed response.
 *
 * @param {string} prompt - The text prompt to send to Gemini.
 * @param {Object} [options] - Optional configuration.
 * @param {boolean} [options.jsonMode=false] - If true, instructs Gemini to return JSON and parses the output.
 * @param {string} [options.fallbackMessage] - Optional string to return if the call fails (for non-JSON mode).
 * @param {Object} [options.fallbackData] - Optional object to return if the call fails (for JSON mode).
 * @returns {Promise<any>} The generated text (string) or parsed JSON (object). Returns fallback data on failure.
 */
export async function callGemini(prompt, options = {}) {
  const { jsonMode = false, fallbackMessage = "I couldn't process that right now.", fallbackData = {} } = options;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Gemini API key is missing.');
    return jsonMode ? fallbackData : fallbackMessage;
  }

  // Construct the prompt. If jsonMode is true, inject a strong instruction to return pure JSON.
  const finalPrompt = jsonMode
    ? `${prompt}\n\nIMPORTANT: You must respond with ONLY raw, valid JSON. Do not include markdown formatting like \`\`\`json. Do not include any explanations.`
    : prompt;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: {
          // If the model supports response_mime_type natively, we can use it, but prompt engineering is safer for older versions.
          // response_mime_type: jsonMode ? "application/json" : "text/plain",
          temperature: 0.2, // Low temperature for more deterministic/structured output
        }
      })
    });

    if (!response.ok) {
      console.error(`Gemini API error: ${response.status} ${response.statusText}`);
      return jsonMode ? fallbackData : fallbackMessage;
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('Gemini API returned an empty or malformed response.', data);
      return jsonMode ? fallbackData : fallbackMessage;
    }

    if (jsonMode) {
      try {
        // Strip out any markdown code blocks if the model ignored our instruction
        let cleanedText = generatedText.trim();
        if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
        if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
        if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
        cleanedText = cleanedText.trim();
        
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON output.', parseError, generatedText);
        return fallbackData;
      }
    }

    return generatedText.trim();
  } catch (error) {
    console.error('Network or execution error calling Gemini API:', error);
    return jsonMode ? fallbackData : fallbackMessage;
  }
}
