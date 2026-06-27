import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazily cache the GenAI instance to keep operations robust and prevent crashes on startup
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // 1. Full-Stack API Route: Ask ChemAI
  app.post('/api/chat', async (req, res) => {
    const { moduleName, messages } = req.body;

    if (!moduleName || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Missing moduleName or messages list' });
      return;
    }

    // Formulate system prompt dynamically based on context
    const systemPrompt = `You are ChemAI, a friendly and enthusiastic chemistry tutor for students aged 14–25. The student is currently studying: ${moduleName}. Answer all chemistry questions in simple, encouraging language. Use real-world analogies (cooking, medicine, everyday life). Keep answers under 150 words unless asked to elaborate. Use chemical notation where helpful (e.g., H₂O, NaCl). If the question is unrelated to chemistry, gently redirect.`;

    try {
      const ai = getAI();

      // Gather last 6 turns of conversations for token-efficiency and context persistence
      const history = messages.slice(-12).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: history,
          config: {
            systemInstruction: systemPrompt,
          },
        });
      } catch (gemIni3Error) {
        console.warn('Primary gemini-3.5-flash failed (possibly high demand/503). Retrying with gemini-2.5-flash fallback:', gemIni3Error);
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: history,
          config: {
            systemInstruction: systemPrompt,
          },
        });
      }

      const responseText = response.text || "ChemAI is in the lab — try again in a moment.";
      res.json({ text: responseText });
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback message requested in SECTION 6
      res.json({ text: 'ChemAI is in the lab — try again in a moment.' });
    }
  });

  // Serve static check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Setup Vite dev-server vs production static hosts
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite middleware after the custom API handlers
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChemLab AI backend is booting securely on port ${PORT}`);
  });
}

startServer();
