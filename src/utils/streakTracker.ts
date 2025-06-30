export interface StreakData {
  count: number;
  lastDate: string;
}

const STREAK_KEY = 'moodmirror_streak';

export const getStreak = (): StreakData => {
  try {
    const stored = localStorage.getItem(STREAK_KEY);
    return stored ? JSON.parse(stored) : { count: 0, lastDate: '' };
  } catch {
    return { count: 0, lastDate: '' };
  }
};

export const updateStreak = (): { streak: number; isNewStreak: boolean } => {
  const today = new Date().toDateString();
  const streakData = getStreak();
  
  if (streakData.lastDate === today) {
    // Already logged today
    return { streak: streakData.count, isNewStreak: false };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newCount: number;
  if (streakData.lastDate === yesterdayStr) {
    // Continuing streak
    newCount = streakData.count + 1;
  } else {
    // New streak or broken streak
    newCount = 1;
  }
  
  const newStreakData: StreakData = {
    count: newCount,
    lastDate: today,
  };
  
  localStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData));
  
  return { 
    streak: newCount, 
    isNewStreak: newCount === 1 || streakData.count === 0 
  };
};