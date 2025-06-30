import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { EmotionAnalysis } from '../types';

interface CopyButtonProps {
  analysis: EmotionAnalysis;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Emotional Analysis Results:
Overall Tone: ${analysis.overallTone}
Primary Emotions: ${analysis.primaryEmotions.map(e => `${e.emotion} (${e.percentage}%)`).join(', ')}
Explanation: ${analysis.causeExplanation}
Suggestion: ${analysis.suggestion}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleCopy}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {copied ? 'Copied!' : 'Copy Results'}
        </span>
      </motion.button>
    </div>
  );
};