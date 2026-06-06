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

function isQuotaExceededError(error: any): boolean {
  if (!error) return false;
  const errMsg = String(error.message || error.stack || error).toLowerCase();
  return (
    error.status === "RESOURCE_EXHAUSTED" ||
    error.statusCode === 429 ||
    error.code === 429 ||
    error.status === 429 ||
    errMsg.includes("quota") ||
    errMsg.includes("limit exceeded") ||
    errMsg.includes("429") ||
    errMsg.includes("resource_exhausted") ||
    errMsg.includes("rate_limit") ||
    errMsg.includes("rate limit")
  );
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
      const isQuota = isQuotaExceededError(error);
      const msgText = isQuota
        ? "👋 **MindMate Offline Mode**: The AI wellness server is resting after a busy exam season (Gemini API quota rate-limit exceeded).\n\n**A Compassionate Reminder**: Your exam preparation is a marathon, and you are doing your best. Your human value is entirely separate from mock test percentages, syllabus coverage, or the study speed of peers. Close your eyes, practice our 4-4-4-4 **Box Breathing Pacemaker** in the interactive zone, drink a cool glass of water, and return when you are relaxed. Let's talk again soon!"
        : "👋 **MindMate Compassion Guide (Relay active)**: Our deep learning model is experiencing heavy traffic, but remember: tiny study increments compound beautifully over time. Take a deep, slow trace-breath, rest your mind, and try greeting your coach again in a few moments.";
      res.json({ success: true, text: msgText });
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
      const isQuota = isQuotaExceededError(error);
      const reflectionText = isQuota
        ? `**Mental Reassurance (Offline Support Mode Enabled)**\n\n*Our server reached its daily Gemini API quota, but articulating your feelings is itself a core cognitive coping strategy.*\n\n**Observations:**\n- You are actively confronting the high cognitive load, syllabus backlog, and mock grade stress of modern competitive exams.\n- Journaling this is a highly healthy, mindful way to vent and process emotional anxiety.\n\n**Coaching Guidance:**\n- Establish a hard textbook/screen cutoff at 10:30 PM tonight to prioritize sleep; deep sleep naturally solidifies your daytime study memory.\n- Frame your preparation in small, bite-sized daylight targets rather than the intimidating full syllabus.\n- Be incredibly kind to yourself today.`
        : `**Empathetic Reflection (Client Offline Core)**\n\nArticulating your thoughts is active stress release. Although our real-time AI reflection parser is experiencing a temporary busy signal, remember that even 1% consistent daily steps build absolute mastery. Stay steady, take a five-minute stretch, and we'll process your metrics again soon!`;
      res.json({ success: true, reflection: reflectionText });
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
      const isQuota = isQuotaExceededError(error);
      const summaryText = isQuota
        ? "Your detailed check-in history is securely logged. (Note: AI weekly analytics summary is resting due to Gemini rate limits; maintain a steady study routine and keep stress triggers under 5!)"
        : "Weekly trends logged successfully. Check back in a few moments for personalized, deep analytical reflections from Gemini!";
      res.json({ success: true, summary: summaryText });
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
