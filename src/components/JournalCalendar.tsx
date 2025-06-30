import React, { useEffect, useState } from 'react';
import { getJournalEntries, getJournalEntry, saveJournalEntry, analyzeText } from '../utils/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, isSameMonth } from 'date-fns';

interface EntryMap {
  [date: string]: any;
}

const JournalCalendar: React.FC = () => {
  const [entries, setEntries] = useState<EntryMap>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entry, setEntry] = useState<any>(null);
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getJournalEntries();
        const map: EntryMap = {};
        res.entries.forEach((entry: any) => {
          map[entry.date] = entry;
        });
        setEntries(map);
      } catch {
        setEntries({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const openModal = async (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
    setError(null);
    setEntry(null);
    setText('');
    setNotes('');
    setAnalysis(null);
    const dateStr = format(date, 'yyyy-MM-dd');
    if (entries[dateStr]) {
      setEntry(entries[dateStr]);
      setText(entries[dateStr].text || '');
      setNotes(entries[dateStr].notes || '');
      setAnalysis(entries[dateStr].analysis || null);
    } else {
      try {
        const res = await getJournalEntry(dateStr);
        setEntry(res.entry);
        setText(res.entry.text || '');
        setNotes(res.entry.notes || '');
        setAnalysis(res.entry.analysis || null);
      } catch {
        setEntry(null);
        setText('');
        setNotes('');
        setAnalysis(null);
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setEntry(null);
    setText('');
    setNotes('');
    setAnalysis(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    setError(null);
    try {
      let analysisResult = analysis;
      if (!analysis && text.trim()) {
        // Analyze if not present
        const res = await analyzeText(text);
        analysisResult = res.analysis;
      }
      await saveJournalEntry({
        date: format(selectedDate, 'yyyy-MM-dd'),
        text,
        notes,
        analysis: analysisResult,
      });
      // Refresh entries
      const refreshed = await getJournalEntries();
      const map: EntryMap = {};
      refreshed.entries.forEach((entry: any) => {
        map[entry.date] = entry;
      });
      setEntries(map);
      setAnalysis(analysisResult);
      setEntry({ date: format(selectedDate, 'yyyy-MM-dd'), text, notes, analysis: analysisResult });
      setModalOpen(false);
    } catch (err: any) {
      setError('Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = '';

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, 'yyyy-MM-dd');
      const hasEntry = !!entries[formattedDate];
      const isToday = isSameDay(day, today);
      const inMonth = isSameMonth(day, monthStart);
      days.push(
        <button
          key={day.toString()}
          onClick={() => openModal(new Date(day))}
          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto my-1
            ${inMonth ? '' : 'text-gray-300'}
            ${hasEntry ? 'bg-indigo-400 text-white font-bold shadow' : ''}
            ${isToday ? 'ring-2 ring-indigo-500' : ''}
            hover:bg-indigo-200 transition`}
        >
          {format(day, 'd')}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="flex justify-between" key={day.toString()}>{days}</div>);
    days = [];
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4 text-indigo-700 text-center">Mood Journal</h2>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="flex justify-between mb-2 text-gray-500 font-semibold">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div className="w-10 text-center" key={d}>{d}</div>
            ))}
          </div>
          {rows}
        </>
      )}
      {/* Entry Modal */}
      {modalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-xl"
              onClick={closeModal}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2 text-indigo-700 text-center">
              {format(selectedDate, 'PPP')}
            </h3>
            <textarea
              className="w-full border rounded-lg p-2 mb-2 min-h-[80px] focus:ring-2 focus:ring-indigo-400"
              placeholder="How are you feeling today?"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <textarea
              className="w-full border rounded-lg p-2 mb-2 min-h-[40px] focus:ring-2 focus:ring-indigo-200"
              placeholder="Private notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            {analysis && (
              <div className="bg-indigo-50 rounded-lg p-3 mb-2">
                <div className="font-semibold text-indigo-700 mb-1">Analysis</div>
                <div><b>Overall Tone:</b> {analysis.overallTone}</div>
                <div className="mb-1">
                  <b>Primary Emotions:</b> {analysis.primaryEmotions?.map((e: any) => `${e.emotion} (${e.percentage}%)`).join(', ')}
                </div>
                <div className="text-sm text-gray-700 mb-1"><b>Cause:</b> {analysis.causeExplanation}</div>
                <div className="text-sm text-gray-700"><b>Suggestion:</b> {analysis.suggestion}</div>
              </div>
            )}
            {error && <div className="text-red-500 text-center mb-2">{error}</div>}
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60 mt-2"
              onClick={handleSave}
              disabled={saving || !text.trim()}
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalCalendar; 