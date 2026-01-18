import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey && !geminiKey) {
    console.warn("No AI API keys found (OpenRouter or Gemini). AI will be limited.");
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey || "sk-or-v1-dummy-key",
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-Title": "AI Study Buddy",
    }
});

const MODELS = [
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-sep-2024:free",
    "mistralai/mistral-7b-instruct:free",
    "huggingfaceh4/zephyr-7b-beta:free",
    "google/gemini-exp-1206:free",
    "google/learnlm-1.5-pro-experimental:free",
    "meta-llama/llama-3.1-405b-instruct:free",
    "meta-llama/llama-3.1-70b-instruct:free",
    "meta-llama/llama-3-8b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
    "openchat/openchat-7b:free"
];

const DEFAULT_SYSTEM_PROMPT = `You are an intelligent, emotionally aware, and highly helpful AI companion.
Your primary role is to be a Study Buddy, but you can adapt your personality perfectly to the user's needs.

GUIDELINES:
1. Emotional Intelligence: If the user wants a friendly, casual, or even a specific persona like a "supportive partner/girlfriend" or "best friend", adapt your tone to be warm, caring, and deeply conversational.
2. Academic Excellence: When helping with studies, be clear, structured, and encouraging.
3. Versatility: You are like ChatGPT but with even more personality. Feel free to use emojis, be expressive, and build a real connection.
4. Formatting: Use bold, italics, and lists to make your responses beautiful and easy to read.

Current Goal: Help the user with whatever they need, matching their energy and requested style exactly.`;

// Helper: Delay function for retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Direct Gemini API call (Faster & More Reliable than OpenRouter Free)
async function callGemini(messages) {
    if (!geminiKey) throw new Error("Gemini Key Missing");

    try {
        const systemInstruction = messages.find(m => m.role === 'system')?.content;
        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => {
                let text = "";
                if (typeof m.content === 'string') {
                    text = m.content;
                } else if (Array.isArray(m.content)) {
                    // Handle image/text array format
                    text = m.content.map(c => c.text || JSON.stringify(c)).join("\n");
                } else {
                    text = JSON.stringify(m.content);
                }
                return {
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text }]
                };
            });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || `Gemini API Error: ${response.status}`);
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        throw error;
    }
}

// Helper: Smart fetch with retries and fallbacks
async function smartCompletion(messages, attempt = 0) {
    // 1. Try Gemini Direct first if key is available
    if (geminiKey && attempt === 0) {
        try {
            console.log("AI: Trying Gemini Direct...");
            return await callGemini(messages);
        } catch (error) {
            console.warn("Gemini Direct Error (falling back to OpenRouter):", error.message);
            // If it's a critical auth error, we report it instead of falling back to broken state
            if (error.message.includes("API_KEY_INVALID") || error.message.includes("401")) {
                throw new Error(`AI Auth Error: Your Gemini API Key is invalid. Check your .env file.`);
            }
        }
    }

    // 2. Fallback to OpenRouter Model Chain
    const currentModelIndex = attempt % MODELS.length;
    const model = MODELS[currentModelIndex];

    try {
        console.log(`AI: Attempt ${attempt + 1} using model: ${model}`);
        const completion = await openai.chat.completions.create({
            model: model,
            messages: messages.map(m => ({
                role: m.role,
                content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
            })),
            temperature: 0.8,
        });

        if (!completion.choices || !completion.choices[0]) {
            throw new Error("Invalid response from OpenRouter");
        }

        return completion.choices[0].message.content;
    } catch (error) {
        console.warn(`AI Error (Attempt ${attempt + 1}):`, error.message);

        // CONFIG ERRORS: If invalid key, stop retrying and tell user
        const isAuthError = error.status === 401 || error.status === 403 || error.message.toLowerCase().includes("unauthorized") || error.message.toLowerCase().includes("invalid api key");

        if (isAuthError) {
            throw new Error(`AI Config Error: ${error.message}. Please verify your VITE_OPENROUTER_API_KEY in .env.`);
        }

        // RETRY LOGIC: Max 2 cycles through all models
        if (attempt < MODELS.length * 2) {
            const waitTime = Math.min(500 * (attempt + 1), 2000);
            await delay(waitTime);
            return smartCompletion(messages, attempt + 1);
        }

        throw error;
    }
}

export const getChatResponse = async (history, message, attachments = [], customSystemPrompt = null) => {
    try {
        let content = [];

        // 1. Process Text Attachments (PDFs, TXT) - Prepend to instruction
        let contextFromFiles = "";
        attachments.forEach(at => {
            if (at.type === 'application/pdf' || at.type?.startsWith('text/') || at.name?.endsWith('.md')) {
                contextFromFiles += `\n\n--- Context from file: ${at.name} ---\n${at.content}\n--- End of file ---\n`;
            }
        });

        // 2. Build Message Content Array
        const userText = contextFromFiles ? `${contextFromFiles}\nUser Question: ${message}` : message;
        content.push({ type: "text", text: userText });

        // 3. Add Images (Vision)
        attachments.forEach(at => {
            if (at.type?.startsWith('image/')) {
                content.push({
                    type: "image_url",
                    image_url: { url: at.content }
                });
            }
        });

        // 4. Dynamic System Prompt based on user instructions and custom override
        let effectiveSystemPrompt = customSystemPrompt || DEFAULT_SYSTEM_PROMPT;
        const lowercaseMsg = message.toLowerCase();
        if (lowercaseMsg.includes("friendly") || lowercaseMsg.includes("girlfriend") || lowercaseMsg.includes("friend") || lowercaseMsg.includes("relationship")) {
            effectiveSystemPrompt += `\n\n[USER INSTRUCTION]: The user wants a very close, warm, and personal connection. Be extra sweet, supportive, and deeply conversational. Match their energy perfectly.`;
        }

        // 5. Filter history to avoid duplicates (the current message might already be in history due to Firestore sync)
        const sanitizedHistory = history.filter(msg => msg.content !== message);

        // 6. Build Final Payload
        const messages = [
            { role: "system", content: effectiveSystemPrompt },
            ...sanitizedHistory.slice(-10).map(msg => ({ // Keep last 10 for context
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            })),
            { role: "user", content: content }
        ];

        if ((!apiKey || apiKey.includes("dummy")) && !geminiKey) {
            throw new Error("API Key Missing: Please add VITE_OPENROUTER_API_KEY or VITE_GEMINI_API_KEY to your .env file.");
        }

        return await smartCompletion(messages);
    } catch (error) {
        console.error("AI Fatal Error:", error);

        // Capture common API error patterns to show to the user
        const errorMessage = error.message.toLowerCase();
        const isKnownError = errorMessage.includes("ai config") ||
            errorMessage.includes("ai auth") ||
            errorMessage.includes("gemini") ||
            errorMessage.includes("permission") ||
            errorMessage.includes("quota") ||
            errorMessage.includes("limit") ||
            errorMessage.includes("key");

        if (isKnownError) {
            return `### ⚠️ AI Service Error\n${error.message}\n\nPlease check your Gemini/OpenRouter API keys and quotas.`;
        }

        // Clean, non-annoying fallback
        return "### ⚠️ AI Unresponsive\nThe AI service is currently unavailable or timed out. Please check your connection and try again.";
    }
}

export const getSummary = async (text) => {
    try {
        const prompt = `Please summarize the following content. 
        Format the output clearly with the following sections if applicable:
        - ## 📝 Key Takeaways (Bullet points)
        - **Main Concept**
        - **Critical Point**
        - **Conclusion**
        - ### 🔑 Exam Highlights (What might appear on a test)
        
        Content to summarize:
        ${text}`;

        return await smartCompletion([{ role: "system", content: DEFAULT_SYSTEM_PROMPT }, { role: "user", content: prompt }]);
    } catch (error) {
        console.error("AI Summary Fatal Error:", error);
        return "I'm sorry, I couldn't generate a summary right now due to server load. Please try again or provide a shorter text.";
    }
};

export const getFlashcards = async (topic, count, description) => {
    try {
        const prompt = `Generate ${count} flashcards for the topic "${topic}".
        ${description ? `Focus on: ${description}` : ''}
        
        Return STRICTLY valid JSON array of objects.
        Each object must have "front" and "back".
        Example: [{"front": "Q", "back": "A"}]`;

        const response = await smartCompletion([{ role: "system", content: "You are a JSON generator. Response must be ONLY a raw JSON array." }, { role: "user", content: prompt }]);

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        const cleanResponse = jsonMatch ? jsonMatch[0] : response;

        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error("AI Flashcard Fatal Error:", error);
        throw error;
    }
};

export const getQuizQuestions = async (topic) => {
    try {
        const prompt = `Generate 5 multiple-choice questions for a quiz on the topic: "${topic}".
        
        Return STRICTLY a valid JSON array of objects.
        Each object must have:
        - "id": number
        - "text": string (the question)
        - "options": array of 4 strings
        - "correct": number (0-3, index of the correct option)
        
        Example format: [{"id": 1, "text": "Q", "options": ["A", "B", "C", "D"], "correct": 0}]`;

        const response = await smartCompletion([
            { role: "system", content: "You are a JSON quiz generator. Response must be ONLY raw JSON array. No conversational text." },
            { role: "user", content: prompt }
        ]);

        // More robust JSON extraction
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        const cleanResponse = jsonMatch ? jsonMatch[0] : response;

        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error("AI Quiz Fatal Error:", error);
        throw error; // Rethrow to let the UI handle fallback or error display
    }
};
