import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileWrapper } from "@/components/MobileWrapper";
import { Confetti } from "@/components/Confetti";
import { LOADING_MESSAGES, type Topic, type Difficulty } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@workspace/api-client-react/src/generated/api.schemas";

interface QuizScreenProps {
  topic: Topic;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  loading: boolean;
  onExit: () => void;
  onComplete: (score: number, correctCount: number, bestStreak: number, history: any[]) => void;
  aiSource: string;
}

export function QuizScreen({
  topic, difficulty, questions, loading, onExit, onComplete, aiSource
}: QuizScreenProps) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  
  // Game Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  
  // UI States
  const [timeLeft, setTimeLeft] = useState(difficulty.time);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shake, setShake] = useState(false);
  const [loadMsgIdx, setLoadMsgIdx] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQ = questions[qIndex];
  const maxTime = difficulty.time;

  // Loading Messages Interval
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadMsgIdx((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  // Timer Logic
  useEffect(() => {
    if (loading || answered || !currentQ) return;
    
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(-1); // -1 signifies timeout
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current!);
  }, [qIndex, loading, answered, currentQ, maxTime]);

  const handleAnswer = (idx: number) => {
    if (answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setAnswered(true);
    setSelected(idx);

    const isCorrect = idx === currentQ?.correct;
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((s) => Math.max(s, newStreak));
      
      const streakBonus = newStreak >= 3 ? 5 : 0;
      const diffBonus = difficulty.id === "hard" ? 5 : difficulty.id === "medium" ? 2 : 0;
      const earned = 10 + streakBonus + diffBonus;
      
      setScore((s) => s + earned);
      
      if (newStreak % 3 === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    } else {
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    
    setHistory((h) => [...h, { question: currentQ?.question, correct: isCorrect, topic: topic.label }]);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= questions.length) {
      const correctCount = history.filter(h => h.correct).length;
      onComplete(score, correctCount, bestStreak, history);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const topicGrad = `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})`;
  const timerPct = (timeLeft / maxTime) * 100;
  const timerColor = timerPct > 50 ? "#38ef7d" : timerPct > 25 ? "#ffd200" : "#FF6B6B";

  return (
    <MobileWrapper isDark>
      <Confetti active={showConfetti} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#161628] sticky top-0 z-20">
        <button onClick={onExit} className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
          ✕
        </button>
        <div className="text-center flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{topic.emoji} {topic.label}</div>
          <AnimatePresence>
            {streak >= 2 && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black text-slate-900 bg-gradient-to-r from-[#f7971e] to-[#ffd200]"
              >
                🔥 {streak} STREAK
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="bg-white/10 text-[#FFD93D] font-black px-3 py-1 rounded-full text-sm border border-white/5">
          ⭐ {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/5 relative">
        <div 
          className="h-full rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${(qIndex / Math.max(1, questions.length)) * 100}%`, background: topicGrad }}
        />
        {questions.length > 0 && Array.from({ length: questions.length }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 w-2 h-2 rounded-full transition-all duration-300"
            style={{
              left: `${((i + 0.5) / questions.length) * 100}%`,
              background: i < qIndex ? topic.gradient[0] : i === qIndex ? "#fff" : "#333",
              transform: i === qIndex ? "translate(-50%,-50%) scale(1.5)" : "translate(-50%,-50%) scale(1)",
              boxShadow: i === qIndex ? `0 0 10px ${topic.gradient[0]}` : "none"
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
             <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,#4776e622,transparent)] animate-orb1" />
             <div className="text-6xl mb-6 animate-float z-10">🤖</div>
             <h2 className="text-2xl font-black text-white mb-2 z-10">AI is thinking...</h2>
             <p className="text-slate-400 mb-8 min-h-[24px] z-10">{LOADING_MESSAGES[loadMsgIdx]}</p>
             
             <div className="flex gap-1.5 items-end h-8 z-10">
               {[0, 1, 2, 3].map(i => (
                 <div key={i} className="w-2 rounded-full bg-[#4776e6] animate-bar-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
               ))}
             </div>
             
             <div className="mt-12 bg-white/5 border border-white/10 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium z-10">
               🌐 Powered by Web Search + Claude AI
             </div>
          </div>
        ) : currentQ ? (
          <div className="p-4 flex flex-col pb-8">
            {/* Timer */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                />
              </div>
              <div className="font-black w-8 text-right text-lg tabular-nums" style={{ color: timerColor }}>
                {timeLeft}
              </div>
            </div>

            {/* Question */}
            <motion.div 
              key={qIndex}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0, opacity: 1 }}
              transition={{ duration: shake ? 0.4 : 0.3 }}
              className="bg-[#1a1a2e] rounded-3xl p-6 mb-5 border border-white/5 shadow-xl"
            >
              <div className="text-xs font-bold text-slate-500 mb-3 tracking-widest uppercase">
                Question {qIndex + 1} of {questions.length}
              </div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">
                {currentQ.question}
              </h2>
            </motion.div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {currentQ.options.map((opt, i) => {
                const isCorrect = i === currentQ.correct;
                const isSelected = i === selected;
                
                let stateClass = "bg-[#1a1a2e] border-white/10 hover:bg-white/5";
                let badgeClass = "bg-white/10 text-white";
                
                if (answered) {
                  if (isCorrect) {
                    stateClass = "bg-[#38ef7d]/10 border-[#38ef7d]/50";
                    badgeClass = "bg-[#38ef7d] text-[#1a1a2e]";
                  } else if (isSelected) {
                    stateClass = "bg-[#FF6B6B]/10 border-[#FF6B6B]/50";
                    badgeClass = "bg-[#FF6B6B] text-white";
                  } else {
                    stateClass = "bg-[#1a1a2e] border-white/5 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() => handleAnswer(i)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden",
                      stateClass,
                      !answered && "active:scale-[0.98]"
                    )}
                  >
                    <div className={cn("w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm transition-colors z-10", badgeClass)}>
                      {answered && isCorrect ? "✓" : answered && isSelected && !isCorrect ? "✕" : ["A","B","C","D"][i]}
                    </div>
                    <span className="font-semibold text-slate-200 text-[15px] leading-snug z-10">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {answered && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  className="mt-6 overflow-hidden"
                >
                  <div className={cn(
                    "rounded-3xl p-5 border",
                    selected === currentQ.correct 
                      ? "bg-gradient-to-br from-[#11998e]/20 to-[#38ef7d]/20 border-[#38ef7d]/30" 
                      : "bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF8E53]/20 border-[#FF6B6B]/30"
                  )}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">
                        {selected === -1 ? "⏱️" : selected === currentQ.correct ? "🎉" : "😅"}
                      </div>
                      <div className="font-black text-lg text-white">
                        {selected === -1 ? "Time's up!" : selected === currentQ.correct ? "Awesome job!" : "Not quite!"}
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {currentQ.explanation}
                    </p>
                    
                    {currentQ.fun_fact && (
                      <div className="bg-black/30 rounded-xl p-3 mb-5 border border-white/5">
                        <span className="text-[#FFD93D] font-bold text-xs uppercase tracking-wider block mb-1">💡 Fun Fact</span>
                        <span className="text-sm text-slate-200 italic">{currentQ.fun_fact}</span>
                      </div>
                    )}
                    
                    <button
                      onClick={nextQuestion}
                      className="w-full py-4 rounded-xl font-black text-white text-[15px] shadow-lg active:scale-95 transition-transform"
                      style={{ background: topicGrad }}
                    >
                      {qIndex + 1 >= questions.length ? "See Results 🏁" : "Next Question →"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Source Tag */}
            {aiSource && answered && (
               <div className="text-center mt-6">
                 <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-slate-500">
                   🌐 {aiSource}
                 </span>
               </div>
            )}
          </div>
        ) : null}
      </div>
    </MobileWrapper>
  );
}
