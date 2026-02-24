import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard as KeyboardIcon, Timer, Target, AlertCircle, History, Play, RefreshCw, Trophy, ChevronRight } from 'lucide-react';
import Keyboard from './components/Keyboard';
import { PRACTICE_MODES } from './constants';
import { PracticeResult, HistoryItem } from './types';

export default function App() {
  const [mode, setMode] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [weakKeys, setWeakKeys] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [customText, setCustomText] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const startPractice = (selectedMode: string) => {
    const modeData = PRACTICE_MODES.find(m => m.id === selectedMode);
    if (selectedMode === 'custom' && !customText.trim()) return;
    
    const content = selectedMode === 'custom' ? customText : modeData?.content || '';
    setText(content);
    setMode(selectedMode);
    setCurrentIndex(0);
    setStartTime(null);
    setEndTime(null);
    setErrors(0);
    setTotalKeys(0);
    setWeakKeys({});
    setIsError(false);
  };

  const saveResult = async (result: Omit<PracticeResult, 'time'>) => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      fetchHistory();
    } catch (err) {
      console.error('Failed to save score', err);
    }
  };

  // Stats calculation memoized
  const stats = useMemo(() => {
    const now = Date.now();
    const durationSec = startTime ? (endTime ? (endTime - startTime) : (now - startTime)) / 1000 : 0;
    const durationMin = durationSec / 60;
    const currentWpm = startTime ? Math.round((currentIndex / 5) / (durationMin || 0.0001)) : 0;
    const currentAccuracy = totalKeys > 0 ? Math.round(((totalKeys - errors) / totalKeys) * 100) : 100;
    const progress = text.length > 0 ? Math.round((currentIndex / text.length) * 100) : 0;
    
    return { wpm: currentWpm, accuracy: currentAccuracy, duration: durationSec, progress };
  }, [currentIndex, totalKeys, errors, startTime, endTime, text.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!mode || endTime) return;
    
    if (e.key === ' ' || e.key === 'Tab') e.preventDefault();
    
    setPressedKey(e.key);
    setTotalKeys(prev => prev + 1);

    setStartTime(prev => prev || Date.now());

    const target = text[currentIndex];
    if (e.key === target) {
      setIsError(false);
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next === text.length) {
          setEndTime(Date.now());
        }
        return next;
      });
    } else {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      
      setIsError(true);
      setErrors(prev => prev + 1);
      setWeakKeys(prev => ({
        ...prev,
        [target]: (prev[target] || 0) + 1
      }));
    }
  }, [mode, currentIndex, text, endTime]);

  // Use a ref to keep the listener stable and avoid re-binding on every key press
  const handlerRef = useRef(handleKeyDown);
  useEffect(() => {
    handlerRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    const handleKeyDownWrapper = (e: KeyboardEvent) => handlerRef.current(e);
    const handleKeyUpWrapper = () => setPressedKey(null);

    window.addEventListener('keydown', handleKeyDownWrapper);
    window.addEventListener('keyup', handleKeyUpWrapper);
    return () => {
      window.removeEventListener('keydown', handleKeyDownWrapper);
      window.removeEventListener('keyup', handleKeyUpWrapper);
    };
  }, []);

  useEffect(() => {
    if (endTime && mode) {
      saveResult({
        mode,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors,
        weakKeys
      });
    }
  }, [endTime]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <KeyboardIcon className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic">TypingMaster</h1>
              <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Professional Finger Training</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <History size={16} />
              {showHistory ? '返回练习' : '历史记录'}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {!mode && !showHistory ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-6xl font-black tracking-tighter leading-none">
                    MASTER YOUR <br />
                    <span className="text-emerald-500">KEYBOARD.</span>
                  </h2>
                  <p className="text-white/60 text-lg max-w-md">
                    通过科学的指法训练，建立肌肉记忆。从基准行开始，逐步提升你的打字速度与准确率。
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {PRACTICE_MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => m.id !== 'custom' && startPractice(m.id)}
                      className={`group flex items-center justify-between p-5 rounded-2xl border transition-all ${m.id === 'custom' ? 'bg-white/5 border-white/10 cursor-default' : 'bg-white/5 border-white/10 hover:bg-emerald-500 hover:border-emerald-500 hover:text-black'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.id === 'custom' ? 'bg-white/10' : 'bg-white/10 group-hover:bg-black/10'}`}>
                          <Play size={18} fill="currentColor" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">{m.name}</span>
                      </div>
                      {m.id !== 'custom' && <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </button>
                  ))}
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Play size={18} />
                      </div>
                      <span className="font-bold text-lg tracking-tight">自定义文本</span>
                    </div>
                    <textarea 
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="在这里粘贴你想练习的英文文本..."
                      className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                    <button 
                      onClick={() => startPractice('custom')}
                      disabled={!customText.trim()}
                      className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                    >
                      开始自定义练习
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
                <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-8 h-full flex flex-col justify-center items-center text-center">
                  <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <Trophy className="text-emerald-500 w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">准备好挑战了吗？</h3>
                  <p className="text-white/40 text-sm max-w-xs">
                    标准 QWERTY 布局练习，实时反馈指法建议。建议每天练习 15 分钟。
                  </p>
                </div>
              </div>
            </motion.div>
          ) : showHistory ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">History</h2>
                <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white transition-colors">返回</button>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-bottom border-white/10 bg-white/5">
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">模式</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">WPM</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">准确率</th>
                      <th className="p-4 font-mono text-[10px] uppercase tracking-widest text-white/40">日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold">{PRACTICE_MODES.find(m => m.id === item.mode)?.name || item.mode}</td>
                        <td className="p-4 text-emerald-500 font-mono font-bold">{Math.round(item.wpm)}</td>
                        <td className="p-4 font-mono">{Math.round(item.accuracy)}%</td>
                        <td className="p-4 text-white/40 text-xs">{new Date(item.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-white/20">暂无记录</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'WPM', value: stats.wpm, icon: Timer, color: 'text-emerald-500' },
                  { label: '准确率', value: `${stats.accuracy}%`, icon: Target, color: 'text-blue-500' },
                  { label: '错误', value: errors, icon: AlertCircle, color: 'text-rose-500' },
                  { label: '进度', value: `${stats.progress}%`, icon: Play, color: 'text-amber-500' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">{stat.label}</p>
                      <p className="text-xl font-black tabular-nums">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Typing Area */}
              <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-12 min-h-[240px] flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                  <motion.div 
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIndex / text.length) * 100}%` }}
                  />
                </div>

                <div className="text-4xl font-mono leading-relaxed tracking-wider text-center max-w-4xl">
                  {text.split('').map((char, i) => {
                    let color = 'text-white/20';
                    if (i < currentIndex) color = 'text-emerald-500';
                    if (i === currentIndex) color = isError ? 'text-rose-500 bg-rose-500/20 rounded' : 'text-white bg-white/10 rounded animate-pulse';
                    
                    return (
                      <span key={i} className={`${color} transition-colors duration-150`}>
                        {char === ' ' ? '␣' : char}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Visualization */}
              <div className="flex justify-center">
                <Keyboard 
                  targetKey={text[currentIndex] || ''} 
                  pressedKey={pressedKey}
                  isError={isError}
                />
              </div>

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setMode(null)}
                  className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold"
                >
                  退出练习
                </button>
                <button 
                  onClick={() => startPractice(mode!)}
                  className="px-8 py-3 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors font-bold flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  重新开始
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Modal */}
        <AnimatePresence>
          {endTime && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#111] border border-white/10 rounded-[40px] p-12 max-w-2xl w-full shadow-2xl"
              >
                <div className="text-center mb-12">
                  <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                    <Trophy className="text-black w-10 h-10 -rotate-12" />
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic">Practice Complete!</h2>
                  <p className="text-white/40 font-mono uppercase tracking-widest mt-2">很好地完成了练习</p>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-12">
                  <div className="bg-white/5 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Speed</p>
                    <p className="text-4xl font-black text-emerald-500">{stats.wpm} <span className="text-sm font-normal text-white/40">WPM</span></p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Accuracy</p>
                    <p className="text-4xl font-black text-blue-500">{stats.accuracy}%</p>
                  </div>
                  <div className="bg-white/5 rounded-3xl p-6 text-center">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-1">Time</p>
                    <p className="text-4xl font-black text-amber-500">{Math.round(stats.duration)}s</p>
                  </div>
                </div>

                {Object.keys(weakKeys).length > 0 && (
                  <div className="mb-12">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 text-center">易错键位统计</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {Object.entries(weakKeys).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([key, count]) => (
                        <div key={key} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                          <span className="font-mono font-bold text-rose-500 uppercase">{key === ' ' ? 'Space' : key}</span>
                          <span className="text-xs text-white/40">错误 {count} 次</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => setMode(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors font-bold"
                  >
                    回到主页
                  </button>
                  <button 
                    onClick={() => startPractice(mode!)}
                    className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black hover:bg-emerald-400 transition-colors font-bold"
                  >
                    再练一次
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-12 border-t border-white/5 flex justify-between items-center text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
        <p>© 2026 TYPINGMASTER PRO</p>
        <div className="flex gap-8">
          <span>Standard QWERTY</span>
          <span>Muscle Memory Focus</span>
        </div>
      </footer>
    </div>
  );
}
