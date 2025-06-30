import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';
import verifyFirebaseToken from './middleware/auth.js';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, allow your deployed frontend domains
    if (process.env.NODE_ENV === 'production') {
      // Add your deployed frontend URLs here
      const allowedOrigins = [
        'https://your-app-name.vercel.app', // Replace with your actual Vercel URL
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    } else {
      // In development, allow all localhost ports
      if (
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint (move this above the rate limiter)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Initialize OpenAI
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    console.log('Please add your OpenAI API key to the .env file');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error.message);
}

const db = getFirestore();

// Emotional analysis endpoint
app.post('/api/analyze', verifyFirebaseToken, async (req, res) => {
  try {
    console.log('📝 Received analysis request');

    if (!openai) {
      console.error('❌ OpenAI client not initialized');
      return res.status(500).json({ 
        error: 'AI service not configured. Please check server configuration.' 
      });
    }

    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for analysis' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text is too long. Please limit to 5000 characters.' });
    }

    console.log(`🔍 Analyzing text (${text.length} characters)`);

    const prompt = `Analyze the emotional content of the following text and provide a JSON response with these exact fields:

{
  "overallTone": "one of: Joyful, Calm, Anxious, Angry, Sad, Frustrated, Confused, Grateful, Excited, Neutral, Mixed",
  "primaryEmotions": [
    {"emotion": "emotion name", "percentage": number},
    {"emotion": "emotion name", "percentage": number},
    {"emotion": "emotion name", "percentage": number}
  ],
  "causeExplanation": "1-2 sentence explanation of what's causing these emotions",
  "suggestion": "1 sentence constructive suggestion for emotional well-being or action"
}

Rules:
- Include 1-3 primary emotions maximum
- Percentages should add up to 100
- Keep explanations concise and helpful
- Make suggestions constructive and actionable

Text to analyze: "${text}"`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;
    console.log('🤖 OpenAI response received');
    
    try {
      const analysis = JSON.parse(result);
      
      // Validate the response structure
      if (!analysis.overallTone || !analysis.primaryEmotions || !analysis.causeExplanation || !analysis.suggestion) {
        throw new Error('Invalid response structure');
      }

      console.log('✅ Analysis completed successfully');

      res.json({
        success: true,
        analysis: {
          overallTone: analysis.overallTone,
          primaryEmotions: analysis.primaryEmotions.slice(0, 3), // Ensure max 3 emotions
          causeExplanation: analysis.causeExplanation,
          suggestion: analysis.suggestion,
          timestamp: new Date().toISOString()
        }
      });
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', result);
      res.status(500).json({ error: 'Failed to analyze emotional content. Please try again.' });
    }

  } catch (error) {
    console.error('❌ Analysis error:', error);
    
    if (error.code === 'insufficient_quota') {
      res.status(503).json({ error: 'AI service temporarily unavailable. Please try again later.' });
    } else if (error.message?.includes('API key')) {
      res.status(500).json({ error: 'AI service configuration error. Please contact support.' });
    } else {
      res.status(500).json({ error: 'Failed to analyze emotional content. Please try again.' });
    }
  }
});

// Journal: Save or update a daily entry
app.post('/api/journal', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { date, text, analysis } = req.body;
    if (!date || !text || !analysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const docRef = db.collection('journalEntries').doc(`${userId}_${date}`);
    await docRef.set({ userId, date, text, analysis, updatedAt: new Date().toISOString() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// Journal: Get all entries for the user
app.get('/api/journal', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const snapshot = await db.collection('journalEntries').where('userId', '==', userId).get();
    const entries = snapshot.docs.map(doc => doc.data());
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Journal: Get entry for a specific date
app.get('/api/journal/:date', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { date } = req.params;
    const docRef = db.collection('journalEntries').doc(`${userId}_${date}`);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ entry: docSnap.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 MoodMirror server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for development origins`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found. Please add your OpenAI API key to .env file');
    console.log('📝 Create a .env file with: OPENAI_API_KEY=your_api_key_here');
  } else {
    console.log('✅ OpenAI API key configured');
  }
});