import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper to safely get the Gemini API Client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel of your AI Studio settings.");
  }
  
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. API: AI Wellness Coach chat
  app.post("/api/gemini/coach", async (req, res) => {
    try {
      const { message, chatHistory, userProfile, lastCheckIn } = req.body;
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.status(200).json({ 
          success: false, 
          text: `⚠️ **API Key Missing**: The Gemini API key is not configured in the environment. To enable the AI Coach:\n\n1. Go to **Settings > Secrets** in the top right.\n2. Add a new secret with the name \`GEMINI_API_KEY\` and your Google Gemini API key as the value.\n3. The app will immediately activate real AI responses!` 
        });
      }

      // Build context
      const profileStr = userProfile 
        ? `The user is ${userProfile.name}, preparing for the ${userProfile.examType} exam in ${userProfile.targetYear}, with a daily study hour goal of ${userProfile.dailyStudyGoal} hours.`
        : "The user is an exam aspirant preparing for a major competitive test.";
      
      const checkInStr = lastCheckIn
        ? `Their latest check-in shows: Mood: ${lastCheckIn.mood}, Stress Level: ${lastCheckIn.stressLevel}/10, Energy: ${lastCheckIn.energyLevel}/10, Sleep Quality: ${lastCheckIn.sleepQuality}, Study Hours: ${lastCheckIn.studyHours}h, Stress Trigger: ${lastCheckIn.stressTrigger}.`
        : "";

      const systemInstruction = `You are "MindMate Coach", a friendly, empathetic AI Wellness Coach designed specifically to support students preparing for high-stakes competitive examinations.
Your goal is to provide supportive, non-diagnostic, educational wellness guidance. 
CRITICAL GUIDELINES:
- **Strict Role Boundaries**: NEVER diagnose medical or psychiatric conditions.
- NEVER claim to be a therapist, a medical doctor, or represent that you are providing professional counseling.
- Focus strictly on study-life balance, techniques for test anxiety, sleep hygiene, focus rituals, and positive reinforcement.
- Encourage them to separate their human-worth from exam metrics.
- Keep your tone warm, validating, and calming.
- Keep response length to 2-3 structured short paragraphs max, using bolding and clean spacing.

User Profile: ${profileStr}
Latest Check-in data: ${checkInStr}`;

      // Re-map the history for Gemini. 
      // We convert a list of ChatMessages into a standard conversational format
      const formattedHistory = (chatHistory || [])
        .slice(-6) // Only pass the latest 6 turns to manage token window
        .map((msg: any) => {
          return `${msg.sender === 'user' ? 'User' : 'Coach'}: ${msg.text}`;
        })
        .join("\n");

      const prompt = `${formattedHistory}\nUser: ${message}\nCoach:`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Gemini Coach Error:", error);
      res.status(500).json({ success: false, text: "An error occurred while reaching the AI wellness servers. Please check your connection and try again." });
    }
  });

  // 2. API: Journal AI Reflection
  app.post("/api/gemini/reflection", async (req, res) => {
    try {
      const { title, content } = req.body;
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.status(200).json({ 
          success: false, 
          reflection: `**AI Guidance Availability**: To get automated compassionate reflections, configure your \`GEMINI_API_KEY\` in **Settings > Secrets**.\n\n*Coach tip: You feel and read. Even small daily steps are a major success!*` 
        });
      }

      if (!content || content.trim().length === 0) {
        return res.json({ success: true, reflection: "Write some journal entry thoughts to obtain a supportive reflection." });
      }

      const systemInstruction = `You are a warm, supportive journal companion for competitive exam students experiencing high pressure. 
Your objective is to read their journal entry, identify underlying stressors or positive behaviors, and offer gentle psychological framing (like cognitive reframing or self-compassion training) and practical micro-steps.
CRITICAL LIMITS:
- Never diagnose depression, OCD, anxiety disorders, or any health conditions.
- Do not advise anything pharmaceutical.
- Praise positive behaviors like self-chunking, stopping to rest, or setting healthy limits.

Provide your output strictly in this readable markdown style:
**Observations:** (Provide a bullet point or two describing what emotional themes or exam pressures are voiced in their journal)

**Coaching Guidance:** (Provide 2-3 bulleted, specific, warm mental coping strategies or micro-habits tailored to their writing)

Ensure your overall remarks are encouraging and take no more than 150-200 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Journal Title: ${title || "Untitled"}\nJournal Text: ${content}`,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ success: true, reflection: response.text });
    } catch (error: any) {
      console.error("Gemini Reflection Error:", error);
      res.status(500).json({ success: false, error: "Unable to process reflection." });
    }
  });

  // 3. API: Dynamic AI Wellness Summary
  app.post("/api/gemini/summary", async (req, res) => {
    try {
      const { checkIns } = req.body;
      let ai;
      try {
        ai = getGeminiClient();
      } catch (err: any) {
        return res.json({ 
          success: false, 
          summary: "Set your GEMINI_API_KEY in the Secrets panel to activate direct, personalized weekly wellness analytics powered by Gemini 2.5." 
        });
      }

      if (!checkIns || checkIns.length === 0) {
        return res.json({ success: true, summary: "Log your first daily check-in to generate some AI insights!" });
      }

      // Convert the last 5-7 checkins to a brief string
      const checkInReport = checkIns
        .slice(0, 7)
        .map((ci: any) => `Date: ${ci.date}, Mood: ${ci.mood}, Stress: ${ci.stressLevel}/10, Study: ${ci.studyHours} hours, Sleep: ${ci.sleepQuality}, Trigger: ${ci.stressTrigger}`)
        .join("; ");

      const systemInstruction = `You are an executive wellness analyst. Read the student's recent daily logs and formulate an encouraging but honest 2-sentence feedback loop summarizing their current mood, major triggers, and a quick suggestion for study balance. Keep it professional, highly compassionate, and concise. Never diagnose conditions. No markdown titles. Just the two sentences.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Recent Logs: ${checkInReport}`,
        config: {
          systemInstruction,
          temperature: 0.5,
        }
      });

      res.json({ success: true, summary: response.text });
    } catch (error: any) {
      console.error("Gemini Summary Error:", error);
      res.status(500).json({ success: false, summary: "Failed to generate AI analytics preview this time." });
    }
  });

  // Serve static UI assets or apply Vite middleware handler
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
