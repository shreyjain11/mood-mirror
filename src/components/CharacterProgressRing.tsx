import React from 'react';
import { motion } from 'framer-motion';

interface CharacterProgressRingProps {
  current: number;
  max: number;
}

export const CharacterProgressRing: React.FC<CharacterProgressRingProps> = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const circumference = 2 * Math.PI * 16;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage < 50) return '#10B981'; // green
    if (percentage < 80) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth="2"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke={getColor()}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};