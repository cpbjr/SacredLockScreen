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

async function generateAIFont(verseText, apiKey, backgroundDescription = "Abstract background") {
    if (!apiKey) {
        console.warn('No API key provided for AI Font');
        return null;
    }

    // USER REQUEST: Use Gemini 3 Pro to generate the text/image directly.
    // We are asking for a "Text Overlay" or "Typography Art" that respects the constraints.
    const prompt = `
    Generate a high-quality, artistic image of the following text: "${verseText}"

    STYLE: "Nano Banana Pro" - Organic, inspired, modern editorial typography. Beautiful, legible, and artistic.
    CONTEXT: Matches this vibe: ${backgroundDescription}

    CRITICAL LAYOUT CONSTRAINTS:
    1.  Aspect Ratio: 9:16 (Vertical Phone Wallpaper).
    2.  SAFE ZONE: The text MUST be strictly confined to the middle 50% of the image vertically.
    3.  CLEAR ZONES: The top 25% and bottom 25% of the image MUST be completely clear of text (for phone UI).

    OUTPUT:
    -   Return a stunning image that integrates the text beautifully.
    -   If possible, generate the text on a transparent background or a background that matches the description perfectly.
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Sacred Lock Screen",
            },
            body: JSON.stringify({
                "model": "google/gemini-3-pro-image-preview", // USER DEMAND: Gemini 3 Pro Image Preview
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            console.error('OpenRouter API Error (Gemini 3):', response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) return null;

        // Extract Image URL from Markdown or Content
        // Gemini 3 Pro might return a markdown image: ![alt](url)
        const markdownImageRegex = /!\[.*?\]\((.*?)\)/;
        const match = content.match(markdownImageRegex);

        if (match && match[1]) {
            return match[1]; // Return the URL
        }

        // If no markdown image, check if the content IS a url
        if (content.startsWith('http')) {
            return content.trim();
        }

        // If it returned text instead of an image, log it and return null (or the text if it's SVG code, but we asked for image)
        console.warn('Gemini 3 Pro returned text, not image:', content.substring(0, 100));
        return null;

    } catch (error) {
        console.error('AI Image Generation Failed:', error);
        return null;
    }
}

async function processUserRequest(inputText, availableBackgrounds, apiKey) {
    if (!apiKey) {
        console.warn('No API key provided for Intelligent Pipeline');
        return { error: "API Key missing" };
    }

    const backgroundList = availableBackgrounds.map(bg => ({ id: bg.id, name: bg.filename })).slice(0, 20); // Limit to 20 to save tokens

    const prompt = `
    You are an intelligent assistant for a "Sacred Lock Screen" app.
    Your goal is to analyze the user's input and prepare it for image generation.

    User Input: "${inputText}"

    Available Backgrounds: ${JSON.stringify(backgroundList)}

    Tasks:
    1.  **Analyze Intent**: Determine if the input is:
        -   "VERSE_TEXT": The user pasted a full verse or quote.
        -   "VERSE_REF": The user provided a reference (e.g., "John 3:16") but no text.
        -   "TOPIC": The user asked for a theme (e.g., "Hope", "Anxiety", "Strength").
        -   "OFF_TOPIC": The input is unrelated (e.g., "Write code", "Math problem").

    2.  **Generate/Retrieve Content**:
        -   If VERSE_TEXT: Use the input as 'verse'. Extract a 'reference' if possible, or leave blank.
        -   If VERSE_REF: Retrieve the full text of the verse (KJV or NIV style).
        -   If TOPIC: Generate a short, inspiring bible verse or quote related to the topic.
        -   If OFF_TOPIC: Generate a polite error message explaining this app is for wallpapers.

    3.  **Select Background**:
        -   Choose the single BEST background ID from the provided list that matches the mood/theme of the text.

    Return ONLY a JSON object:
    {
      "type": "VERSE_TEXT" | "VERSE_REF" | "TOPIC" | "OFF_TOPIC",
      "verse": "The full text of the verse/quote",
      "reference": "The source (e.g., John 3:16)",
      "backgroundId": "The ID of the selected background",
      "error": "Error message if OFF_TOPIC, else null"
    }
  `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Sacred Lock Screen",
            },
            body: JSON.stringify({
                "model": "google/gemini-flash-1.5", // Using Flash for speed/cost
                "messages": [
                    { "role": "user", "content": prompt }
                ]
            })
        });

        if (!response.ok) {
            console.error('OpenRouter API Error (Process):', response.status);
            return { error: "AI Processing Failed" };
        }

        const data = await response.json();
        let content = data.choices[0]?.message?.content;

        if (!content) return { error: "No response from AI" };

        // Clean up markdown
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI JSON:', content);
            return { error: "Invalid AI Response" };
        }

    } catch (error) {
        console.error('AI Processing Failed:', error);
        return { error: "Network Error" };
    }
}

module.exports = { calculateOptimalLayout, generateAIFont, processUserRequest };
