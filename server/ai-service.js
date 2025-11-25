// Native fetch is available in Node 18+

// Use native fetch if available (Node 18+), otherwise require it (if installed)
// For this environment, we'll assume Node 18+ or that fetch is available globally.
// If not, we might need to install node-fetch.

async function calculateOptimalLayout(verseText, apiKey) {
    if (!apiKey) {
        console.warn('No API key provided for AI layout');
        return null;
    }

    const prompt = `
    You are an expert typography and layout designer.
    Analyze the following text and determine the optimal font size, line height, and padding to ensure it fits aesthetically within a phone screen (approx 1179x2556px).
    
    CRITICAL CONSTRAINT:
    - The text block MUST be centered vertically within the middle 50% of the screen.
    - The top 25% of the screen MUST be completely clear (paddingTop >= 25).
    - The bottom 25% of the screen MUST be completely clear (paddingBottom >= 25).
    
    Text: "${verseText}"

    Return ONLY a JSON object with these integer properties:
    - fontSize (in pixels, e.g., 60)
    - lineHeight (multiplier, e.g., 1.4)
    - paddingTop (percentage of screen height, MUST be >= 25)
    - paddingBottom (percentage of screen height, MUST be >= 25)
    - maxWidth (percentage of screen width, e.g., 80)

    Do not include markdown formatting or explanations. Just the JSON.
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000", // Required by OpenRouter
                "X-Title": "Sacred Lock Screen", // Optional
            },
            body: JSON.stringify({
                "model": "google/gemini-pro-1.5", // Using Gemini Pro via OpenRouter
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API Error:', response.status, errorText);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) return null;

        // Clean up markdown code blocks if present
        const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('AI Layout Calculation Failed:', error);
        return null;
    }
}

module.exports = { calculateOptimalLayout };
