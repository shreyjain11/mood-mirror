import { AnalysisResponse } from '../types';

// Update this URL to your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const analyzeText = async (text: string): Promise<any> => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) throw new Error('No OpenAI API key set.');

  const prompt = `Analyze the emotional content of the following text and provide a JSON response with these exact fields:\n\n{\n  "overallTone": "one of: Joyful, Calm, Anxious, Angry, Sad, Frustrated, Confused, Grateful, Excited, Neutral, Mixed",\n  "primaryEmotions": [\n    {"emotion": "emotion name", "percentage": number},\n    {"emotion": "emotion name", "percentage": number},\n    {"emotion": "emotion name", "percentage": number}\n  ],\n  "causeExplanation": "1-2 sentence explanation of what's causing these emotions",\n  "suggestion": "1 sentence constructive suggestion for emotional well-being or action"\n}\n\nRules:\n- Include 1-3 primary emotions maximum\n- Percentages should add up to 100\n- Keep explanations concise and helpful\n- Make suggestions constructive and actionable\n\nText to analyze: "${text}"`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    let errorText = '';
    try {
      const error = await response.json();
      errorText = typeof error === 'string' ? error : JSON.stringify(error);
    } catch {
      errorText = `Server error: ${response.status}`;
    }
    throw new Error(errorText);
  }

  const completion = await response.json();
  const result = completion.choices[0].message.content;
  try {
    return { analysis: JSON.parse(result) };
  } catch {
    throw new Error('Failed to parse OpenAI response.');
  }
};