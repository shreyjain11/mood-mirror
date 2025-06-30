import { AnalysisResponse } from '../types';
import { auth } from './firebase';

// Update this URL to your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const analyzeText = async (text: string): Promise<AnalysisResponse> => {
  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error occurred' }));
      throw new Error(error.error || `Server error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the analysis server. Please check if the server is running.');
    }
    throw error;
  }
};

export const getJournalEntries = async () => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(`${API_BASE_URL}/journal`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch journal entries');
  return response.json();
};

export const getJournalEntry = async (date: string) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(`${API_BASE_URL}/journal/${date}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch journal entry');
  return response.json();
};

export const saveJournalEntry = async ({ date, text, analysis }: { date: string, text: string, analysis: any }) => {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;
  const response = await fetch(`${API_BASE_URL}/journal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ date, text, analysis }),
  });
  if (!response.ok) throw new Error('Failed to save journal entry');
  return response.json();
};