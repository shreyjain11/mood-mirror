import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface MoodStreakProps {
  streak: number;
}

export const MoodStreak: React.FC<MoodStreakProps> = ({ streak }) => {
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/20 px-3 py-2 rounded-full"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Flame className="w-4 h-4 text-orange-500" />
      </motion.div>
      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
        {streak} day streak!
      </span>
    </motion.div>
  );
};