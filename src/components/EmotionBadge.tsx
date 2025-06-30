import React from 'react';
import { motion } from 'framer-motion';
import { getEmotionColor, getEmotionGlow } from '../utils/emotions';

interface EmotionBadgeProps {
  emotion: string;
}

export const EmotionBadge: React.FC<EmotionBadgeProps> = ({ emotion }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold border-2 ${getEmotionColor(emotion)} ${getEmotionGlow(emotion)} shadow-lg`}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        animate={{ 
          textShadow: [
            "0 0 0px rgba(139, 92, 246, 0)",
            "0 0 10px rgba(139, 92, 246, 0.5)",
            "0 0 0px rgba(139, 92, 246, 0)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Overall Tone: {emotion}
      </motion.span>
    </motion.div>
  );
};