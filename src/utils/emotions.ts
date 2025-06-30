export const getEmotionColor = (emotion: string): string => {
  const emotionColors: Record<string, string> = {
    'Joyful': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Calm': 'bg-blue-100 text-blue-800 border-blue-300',
    'Anxious': 'bg-orange-100 text-orange-800 border-orange-300',
    'Angry': 'bg-red-100 text-red-800 border-red-300',
    'Sad': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'Frustrated': 'bg-red-100 text-red-800 border-red-300',
    'Confused': 'bg-purple-100 text-purple-800 border-purple-300',
    'Grateful': 'bg-green-100 text-green-800 border-green-300',
    'Excited': 'bg-pink-100 text-pink-800 border-pink-300',
    'Neutral': 'bg-gray-100 text-gray-800 border-gray-300',
    'Mixed': 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300',
  };

  return emotionColors[emotion] || 'bg-gray-100 text-gray-800 border-gray-300';
};

export const getEmotionGlow = (emotion: string): string => {
  const emotionGlows: Record<string, string> = {
    'Joyful': 'shadow-yellow-200/50',
    'Calm': 'shadow-blue-200/50',
    'Anxious': 'shadow-orange-200/50',
    'Angry': 'shadow-red-200/50',
    'Sad': 'shadow-indigo-200/50',
    'Frustrated': 'shadow-red-200/50',
    'Confused': 'shadow-purple-200/50',
    'Grateful': 'shadow-green-200/50',
    'Excited': 'shadow-pink-200/50',
    'Neutral': 'shadow-gray-200/50',
    'Mixed': 'shadow-purple-200/50',
  };

  return emotionGlows[emotion] || 'shadow-gray-200/50';
};

export const getChartColor = (index: number): string => {
  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  return colors[index % colors.length];
};