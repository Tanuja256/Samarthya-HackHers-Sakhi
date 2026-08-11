export async function callGemini(prompt, options = {}) {
  const { jsonMode = false, fallbackMessage = "I couldn't process that right now.", fallbackData = {} } = options;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error('Gemini API key is missing.');
    return jsonMode ? fallbackData : fallbackMessage;
  }

  const finalPrompt = jsonMode
    ? `${prompt}\n\nIMPORTANT: Respond with ONLY raw, valid JSON. No markdown, no explanations.`
    : prompt;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            ...(jsonMode ? { response_mime_type: "application/json" } : {})
          }
        })
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText}`, errBody);
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
        let cleanedText = generatedText.trim();
        if (cleanedText.startsWith('```json')) cleanedText = cleanedText.slice(7);
        if (cleanedText.startsWith('```')) cleanedText = cleanedText.slice(3);
        if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);
        return JSON.parse(cleanedText.trim());
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