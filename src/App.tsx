import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Brain, 
  Clipboard, 
  History, 
  Search, 
  Heart,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { ThemeToggle } from './components/ThemeToggle';
import { LoadingSpinner } from './components/LoadingSpinner';
import { EmotionBadge } from './components/EmotionBadge';
import { EmotionChart } from './components/EmotionChart';
import { InsightCard } from './components/InsightCard';
import { HistoryPanel } from './components/HistoryPanel';
import { BackgroundParticles } from './components/BackgroundParticles';
import { CharacterProgressRing } from './components/CharacterProgressRing';
import { CopyButton } from './components/CopyButton';
import { ShareButton } from './components/ShareButton';
import { HowItWorksModal } from './components/HowItWorksModal';
import { PrivacyModal } from './components/PrivacyModal';
import { MoodStreak } from './components/MoodStreak';
import { analyzeText } from './utils/api';
import { saveToHistory, getHistory, clearHistory } from './utils/storage';
import { updateStreak, getStreak } from './utils/streakTracker';
import { EmotionAnalysis, HistoryEntry } from './types';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());
  const [streak, setStreak] = useState(() => getStreak().count);
  const [isServerConnected, setIsServerConnected] = useState(true);

  // Check server connection on mount
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          setIsServerConnected(true);
        } else {
          setIsServerConnected(false);
        }
      } catch {
        setIsServerConnected(false);
      }
    };

    checkServerConnection();
    const interval = setInterval(checkServerConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (text.trim() && !isLoading && isServerConnected) {
          handleAnalyze();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [text, isLoading, isServerConnected]);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) return;
    if (!isServerConnected) {
      toast.error('Server is not connected. Please check if the server is running.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await analyzeText(text);
      setAnalysis(response.analysis);

      // Update streak
      const { streak: newStreak, isNewStreak } = updateStreak();
      setStreak(newStreak);

      if (isNewStreak && newStreak > 1) {
        toast.success(`🔥 ${newStreak} day streak! Keep going!`, {
          duration: 4000,
          position: 'top-center',
        });
      }

      // Save to history
      const historyEntry: HistoryEntry = {
        id: Date.now().toString(),
        text: text.trim(),
        analysis: response.analysis,
        createdAt: new Date().toISOString(),
      };
      
      saveToHistory(historyEntry);
      setHistory(getHistory());
      
      toast.success('Analysis completed!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze text';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [text, isServerConnected]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      toast.success('Text pasted from clipboard!');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      toast.error('Failed to paste from clipboard');
    }
  }, []);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    toast.success('History cleared!');
  }, []);

  const handleSelectHistoryEntry = useCallback((entry: HistoryEntry) => {
    setText(entry.text);
    setAnalysis(entry.analysis);
    setIsHistoryOpen(false);
    toast.success('Analysis loaded from history!');
  }, []);

  const characterCount = text.length;
  const maxCharacters = 5000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300 relative overflow-hidden">
      <BackgroundParticles />
      <Toaster />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 0 25px rgba(139, 92, 246, 0.5)"
              }}
            >
              <Brain className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MoodMirror
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center space-x-2">
                <span>Emotional Intelligence for Your Text</span>
                {isServerConnected ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <MoodStreak streak={streak} />
            <motion.button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Server Status Warning */}
        {!isServerConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50/80 dark:bg-yellow-900/20 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-4 mb-6 flex items-center space-x-3"
          >
            <WifiOff className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 font-medium">Server Connection Issue</p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                Make sure the server is running with <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">npm run dev</code>
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mb-8"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Paste your text below for emotional analysis
            </label>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your thoughts, journal entry, email, or any text you'd like to understand emotionally..."
                className="w-full h-40 p-4 pr-16 border border-gray-200/50 dark:border-gray-600/50 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700/50 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 backdrop-blur-sm"
                maxLength={maxCharacters}
              />
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                <CharacterProgressRing current={characterCount} max={maxCharacters} />
                <button
                  onClick={handlePaste}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={handleAnalyze}
                disabled={isLoading || !text.trim() || !isServerConnected}
                className="relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg overflow-hidden"
                whileHover={{ 
                  scale: isLoading || !isServerConnected ? 1 : 1.02,
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)"
                }}
                whileTap={{ scale: isLoading || !isServerConnected ? 1 : 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0"
                  whileHover={{ opacity: isLoading || !isServerConnected ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="relative flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>{isLoading ? 'Analyzing...' : 'Analyze Emotion'}</span>
                </div>
              </motion.button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd> to analyze
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-sm ${characterCount > maxCharacters * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {characterCount.toLocaleString()} / {maxCharacters.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border border-red-200/50 dark:border-red-800/50 rounded-xl p-4 mb-6 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Overall Tone Badge */}
              <div className="flex justify-center">
                <EmotionBadge emotion={analysis.overallTone} />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <CopyButton analysis={analysis} />
                <ShareButton analysis={analysis} text={text} />
              </div>

              {/* Emotion Chart */}
              <EmotionChart emotions={analysis.primaryEmotions} />

              {/* Insight Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <InsightCard
                  title="💡 Why You Feel This Way"
                  content={analysis.causeExplanation}
                  icon={AlertCircle}
                  delay={0.4}
                />
                <InsightCard
                  title="🧠 Suggested Next Step"
                  content={analysis.suggestion}
                  icon={Lightbulb}
                  delay={0.5}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center space-y-4"
        >
          <div className="flex justify-center space-x-6 text-sm">
            <button
              onClick={() => setIsHowItWorksOpen(true)}
              className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How it works</span>
            </button>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="flex items-center space-x-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Privacy</span>
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Made with <Heart className="w-4 h-4 inline text-red-500" /> by{' '}
            <span className="font-medium">Shrey Jain</span>. Free forever.
          </p>
        </motion.div>
      </div>

      {/* Modals */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectEntry={handleSelectHistoryEntry}
      />
      
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
      
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}

export default App;