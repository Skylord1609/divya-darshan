// This file acts as a secure backend proxy for Gemini API calls.
// It assumes an Express.js server environment where 'express' and '@google/genai' are available.

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

// This middleware is for demonstration to simulate a JSON body parser.
// In a real Express app, you would use `app.use(express.json());`
router.use(express.json());

let ai;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  console.error('CRITICAL: API_KEY environment variable is not set. AI features will fail.');
}

// Ethical Hacker Fix: Whitelist allowed models to prevent unauthorized model usage.
const ALLOWED_MODELS = ['gemini-2.5-flash'];

// A generic endpoint for non-streaming content generation
router.post('/generate', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  try {
    const { model, contents, config } = req.body;
    
    // Validate model input on the server
    const modelToUse = model || 'gemini-2.5-flash';
    if (!ALLOWED_MODELS.includes(modelToUse)) {
        return res.status(400).json({ error: 'Invalid or unauthorized model requested.' });
    }

    // FIX: Pass config object directly as systemInstruction is a property of config.
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents,
      config: config,
    });

    // The response from generateContent has a `text` property for the result.
    res.json({ text: response.text });

  } catch (error) {
    console.error('Error in /api/ai/generate:', error);
    res.status(500).json({ error: 'Failed to generate content from AI.' });
  }
});


// An endpoint for streaming content generation
router.post('/stream', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: 'AI service is not configured on the server.' });
  }

  try {
    const { model, query, history, config } = req.body;

    // Validate model input on the server
    const modelToUse = model || 'gemini-2.5-flash';
    if (!ALLOWED_MODELS.includes(modelToUse)) {
        throw new Error('Invalid or unauthorized model requested.');
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    
    // --- REFACTOR ---
    // The previous implementation used a Chat object which could lead to state issues.
    // This new, more robust approach uses the stateless `generateContentStream` method,
    // sending the full context in every request as recommended for this type of app.
    const contents = [...history, { role: 'user', parts: [{ text: query }] }];

    // FIX: Pass config object directly as systemInstruction is a property of config.
    const stream = await ai.models.generateContentStream({
        model: modelToUse,
        contents: contents,
        config: config
    });
    // --- END REFACTOR ---

    for await (const chunk of stream) {
      if(chunk.text) {
          res.write(chunk.text);
      }
    }

    res.end();

  } catch (error) {
    console.error('Error in /api/ai/stream:', error);
    // If an error occurs after headers are sent, we can't send a JSON error.
    // We just end the response. The client will see a failed request.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream content from AI.' });
    } else {
      res.end();
    }
  }
});


module.exports = router;