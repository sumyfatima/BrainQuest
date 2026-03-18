import { motion } from "framer-motion";
import { MobileWrapper } from "@/components/MobileWrapper";
import { Confetti } from "@/components/Confetti";
import type { Topic } from "@/lib/constants";

interface ResultScreenProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  bestStreak: number;
  history: any[];
  topic: Topic | null;
  avatar: string;
  playerName: string;
  onPlayAgain: () => void;
  onChangeTopic: () => void;
}

export function ResultScreen({
  score, correctCount, totalQuestions, bestStreak, history, topic, avatar, playerName, onPlayAgain, onChangeTopic
}: ResultScreenProps) {
  
  const pct = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
  
  let grade = { label: "🎮 Keep Going!", color: "#4776e6", icon: "🎮" };
  if (pct >= 90) grade = { label: "🏆 Genius!", color: "#FFD93D", icon: "🏆" };
  else if (pct >= 70) grade = { label: "🥈 Star Player!", color: "#C0C0C0", icon: "🥈" };
  else if (pct >= 50) grade = { label: "🥉 Good Job!", color: "#CD7F32", icon: "🥉" };

  const isSuccess = pct >= 70;

  return (
    <MobileWrapper isDark>
      <Confetti active={isSuccess} />
      
      <div className="flex-1 overflow-y-auto px-5 py-8 no-scrollbar flex flex-col">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-4">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-[80px] leading-none mb-2 drop-shadow-[0_0_30px_rgba(255,217,61,0.3)]"
          >
            {grade.icon}
          </motion.div>
          <h1 className="text-3xl font-black mb-1" style={{ color: grade.color }}>
            {grade.label}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {avatar} {playerName || "Explorer"} • {topic?.label}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: "⭐", val: score, label: "Stars Earned" },
            { icon: "🎯", val: `${pct}%`, label: "Accuracy" },
            { icon: "🔥", val: bestStreak, label: "Best Streak" },
            { icon: "✅", val: `${correctCount}/${totalQuestions}`, label: "Correct Answers" },
          ].map((s, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="bg-[#1a1a2e] rounded-2xl p-4 text-center border border-white/5 shadow-lg"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Question Review */}
        <div className="mb-8">
          <h3 className="font-black text-lg text-white mb-4 flex items-center gap-2">
            📋 Review Your Answers
          </h3>
          <div className="flex flex-col gap-2">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl border flex gap-3 ${
                  h.correct 
                    ? 'bg-[#38ef7d]/10 border-[#38ef7d]/30' 
                    : 'bg-[#FF6B6B]/10 border-[#FF6B6B]/30'
                }`}
              >
                <div className="text-lg shrink-0 pt-0.5">{h.correct ? "✅" : "❌"}</div>
                <div className="text-sm text-slate-300 font-medium leading-snug">{h.question}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-3">
          <button 
            onClick={onPlayAgain}
            className="w-full p-4 rounded-2xl font-black text-white text-lg shadow-xl active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${topic?.gradient[0]}, ${topic?.gradient[1]})` }}
          >
            🔄 Play Again
          </button>
          <button 
            onClick={onChangeTopic}
            className="w-full p-4 rounded-2xl font-black text-white text-[15px] bg-[#1a1a2e] border border-white/10 active:scale-95 transition-transform hover:bg-white/5"
          >
            🏠 Change Topic
          </button>
        </div>
      </div>
    </MobileWrapper>
  );
}
