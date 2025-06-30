import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Emotional analysis endpoint
app.post('/api/analyze', async (req, res) => {
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