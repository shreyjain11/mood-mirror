export interface EmotionAnalysis {
  overallTone: string;
  primaryEmotions: Array<{
    emotion: string;
    percentage: number;
  }>;
  causeExplanation: string;
  suggestion: string;
  timestamp: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: EmotionAnalysis;
}

export interface HistoryEntry {
  id: string;
  text: string;
  analysis: EmotionAnalysis;
  createdAt: string;
}