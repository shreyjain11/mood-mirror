import { AnalysisResponse } from '../types';

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

export const analyzeText = async (text: string): Promise<AnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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