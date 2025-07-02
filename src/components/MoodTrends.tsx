import React, { useMemo } from 'react';
import { getHistory } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import WordCloud from 'react-wordcloud';
import { X } from 'lucide-react';

const MOOD_COLORS: Record<string, string> = {
  Joyful: '#FBBF24',
  Calm: '#60A5FA',
  Anxious: '#F59E42',
  Angry: '#EF4444',
  Sad: '#6366F1',
  Frustrated: '#F87171',
  Confused: '#A78BFA',
  Grateful: '#34D399',
  Excited: '#EC4899',
  Neutral: '#9CA3AF',
  Mixed: '#C084FC',
};

const EMOJI: Record<string, string> = {
  Joyful: '😄', Calm: '😌', Anxious: '😰', Angry: '😡', Sad: '😢', Frustrated: '😤', Confused: '😕', Grateful: '🙏', Excited: '🤩', Neutral: '😐', Mixed: '🎭'
};

function getStreak(history: any[]) {
  if (!history.length) return 0;
  let streak = 1;
  let prev = new Date(history[0].createdAt).toDateString();
  for (let i = 1; i < history.length; i++) {
    const curr = new Date(history[i].createdAt);
    const prevDate = new Date(history[i - 1].createdAt);
    const diff = (prevDate.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const MoodTrends: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const history = useMemo(() => getHistory().sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), []);

  // Line chart data: mood by day
  const lineData = history.map(entry => ({
    date: new Date(entry.createdAt).toLocaleDateString(),
    mood: entry.analysis.overallTone,
    moodIdx: Object.keys(MOOD_COLORS).indexOf(entry.analysis.overallTone),
  }));

  // Pie chart data: emotion distribution
  const moodCounts: Record<string, number> = {};
  history.forEach(entry => {
    moodCounts[entry.analysis.overallTone] = (moodCounts[entry.analysis.overallTone] || 0) + 1;
  });
  const pieData = Object.entries(moodCounts).map(([mood, count]) => ({ name: mood, value: count }));

  // Word cloud data
  const allWords = history.flatMap(entry => entry.text.split(/\s+/));
  const wordCounts: Record<string, number> = {};
  allWords.forEach(word => {
    const w = word.toLowerCase();
    if (w.length > 3 && !['this','that','with','have','just','your','from','about','would','could','there','their','which','been','were','what','when','where','will','they','them','then','than','because','while','should','really','very','some','more','only','also','even','much','such','like','well','still','into','over','after','before','being','most','every','other','these','those','make','made','many','back','good','time','day','days','get','got','see','one','two','three','four','five','first','last','next','now','out','off','for','and','the','you','are','but','not','all','can','was','had','did','has','too','who','why','how','his','her','him','she','our','us','we','my','me','i','to','of','in','on','at','is','it','a','an','as','by','be','or','if','so','do','no','yes'].includes(w)) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
  });
  const wordCloudData = Object.entries(wordCounts).map(([text, value]) => ({ text, value }));

  // Streak
  const streak = getStreak([...history].reverse());

  // Most common mood
  const mostCommonMood = pieData.length ? pieData.reduce((a, b) => (a.value > b.value ? a : b)).name : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white/80 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-900 p-0 w-full max-w-3xl relative overflow-y-auto max-h-[95vh] flex flex-col items-stretch backdrop-blur-xl" style={{ boxShadow: '0 8px 40px 0 rgba(139,92,246,0.25), 0 1.5px 8px 0 rgba(236,72,153,0.10)' }}>
        <button className="absolute top-5 right-6 text-gray-400 hover:text-pink-500 text-3xl z-10 transition-all" onClick={onClose}>
          <X size={32} />
        </button>
        <div className="w-full px-8 pt-10 pb-2 flex flex-col items-center">
          <h2 className="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-pulse drop-shadow-lg">Mood Trends & Insights</h2>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-8 px-8 pb-4">
          <div className="flex-1 rounded-2xl border border-purple-100 dark:border-purple-800 bg-white/60 dark:bg-gray-800/80 shadow-lg p-6 flex flex-col mb-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">Mood Over Time <span>📈</span></h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#a78bfa' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="moodIdx" type="number" domain={[0, Object.keys(MOOD_COLORS).length - 1]} tick={false} hide />
                <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, border: '1px solid #a78bfa', color: '#7c3aed' }} formatter={(_, __, props) => EMOJI[lineData[props.dataIndex].mood] + ' ' + lineData[props.dataIndex].mood} />
                <Line type="monotone" dataKey="moodIdx" stroke="#a78bfa" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {Object.keys(MOOD_COLORS).map(mood => (
                <span key={mood} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer">
                  <span>{EMOJI[mood]}</span> {mood}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-pink-100 dark:border-pink-800 bg-white/60 dark:bg-gray-800/80 shadow-lg p-6 flex flex-col mb-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-pink-700 dark:text-pink-300">Emotion Distribution <span>🥧</span></h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={MOOD_COLORS[entry.name] || '#ddd'} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full flex justify-center py-2">
          <div className="w-3/4 h-0.5 bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-200 opacity-60 rounded-full" />
        </div>
        <div className="w-full flex flex-col md:flex-row gap-8 px-8 pb-8">
          <div className="flex-1 rounded-2xl border border-orange-100 dark:border-orange-800 bg-white/60 dark:bg-gray-800/80 shadow-lg p-6 flex flex-col items-center justify-center mb-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-300">Current Streak <span>🔥</span></h3>
            <div className="text-6xl font-extrabold text-orange-500 mb-2 drop-shadow-lg animate-pulse">{streak} <span className="text-2xl font-bold">days</span></div>
            {mostCommonMood && (
              <div className="text-sm text-gray-700 dark:text-gray-200 mt-2">Most common mood: <span className="font-semibold text-lg">{EMOJI[mostCommonMood]} {mostCommonMood}</span></div>
            )}
          </div>
          <div className="flex-1 rounded-2xl border border-blue-100 dark:border-blue-800 bg-white/60 dark:bg-gray-800/80 shadow-lg p-6 flex flex-col items-center justify-center mb-2">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Word Cloud <span>☁️</span></h3>
            <div className="w-full h-44 transition-all duration-300 hover:scale-105">
              <WordCloud words={wordCloudData} options={{ fontSizes: [16, 36], rotations: 2, rotationAngles: [0, 90], enableTooltip: true, deterministic: false, padding: 2 }} />
            </div>
          </div>
        </div>
        {history.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            <div className="text-6xl mb-4">📉</div>
            No mood data yet. Analyze some text to see your trends!
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTrends; 