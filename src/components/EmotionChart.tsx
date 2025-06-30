import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { getChartColor } from '../utils/emotions';

interface EmotionChartProps {
  emotions: Array<{ emotion: string; percentage: number }>;
}

export const EmotionChart: React.FC<EmotionChartProps> = ({ emotions }) => {
  const data = emotions.map((item, index) => ({
    ...item,
    color: getChartColor(index),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        Primary Emotions
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="emotion" 
              axisLine={false}
              tickLine={false}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => `${value}%`}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};