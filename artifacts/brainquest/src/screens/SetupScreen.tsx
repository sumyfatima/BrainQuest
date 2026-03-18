import { motion } from "framer-motion";
import { MobileWrapper } from "@/components/MobileWrapper";
import { AVATARS, DIFFICULTIES, TOPICS, type Difficulty, type Topic } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SetupScreenProps {
  avatar: string;
  setAvatar: (a: string) => void;
  playerName: string;
  setPlayerName: (n: string) => void;
  topic: Topic | null;
  setTopic: (t: Topic | null) => void;
  difficulty: Difficulty | null;
  setDifficulty: (d: Difficulty | null) => void;
  onStart: () => void;
  totalStars: number;
}

export function SetupScreen({
  avatar, setAvatar,
  playerName, setPlayerName,
  topic, setTopic,
  difficulty, setDifficulty,
  onStart, totalStars
}: SetupScreenProps) {
  
  return (
    <MobileWrapper>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm z-10 sticky top-0">
        <div className="font-black text-xl text-[#4776e6] font-display flex items-center gap-2">
          🎓 BrainQuest
        </div>
        <div className="bg-[#FFF8E0] text-[#E67E22] font-bold px-3 py-1 rounded-full text-sm shadow-sm border border-[#FFE082]">
          ⭐ {totalStars}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 no-scrollbar">
        {/* Greeting */}
        <div className="text-center pt-6 pb-4">
          <motion.div 
            key={avatar}
            initial={{ scale: 0.5, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-5xl mb-2"
          >
            {avatar}
          </motion.div>
          <h2 className="text-2xl font-black text-slate-800">Who's learning today?</h2>
        </div>

        {/* Avatars */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={cn(
                "text-3xl p-2 rounded-2xl border-2 transition-all duration-200",
                avatar === a 
                  ? "bg-[#ebe8ff] border-[#4776e6] scale-110 shadow-md" 
                  : "bg-white border-slate-200 hover:bg-slate-50"
              )}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Your name..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={16}
          className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-lg font-semibold text-slate-800 outline-none focus:border-[#4776e6] focus:ring-4 focus:ring-[#4776e6]/10 transition-all mb-8 shadow-sm"
        />

        {/* Topics */}
        <h3 className="font-black text-lg text-slate-800 mb-3 font-display">🎯 Pick a Topic</h3>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {TOPICS.map((t) => {
            const isSelected = topic?.id === t.id;
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={t.id}
                onClick={() => setTopic(isSelected ? null : t)}
                className="relative rounded-2xl p-4 flex flex-col items-center gap-2 border-none text-white overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                  boxShadow: isSelected ? `0 0 0 4px #f5f7ff, 0 0 0 7px ${t.gradient[0]}` : `0 4px 15px ${t.shadow}`,
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  zIndex: isSelected ? 10 : 1
                }}
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="font-bold text-sm tracking-wide">{t.label}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-white text-slate-900 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                    ✓
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Difficulty */}
        <h3 className="font-black text-lg text-slate-800 mb-3 font-display">⚡ Difficulty</h3>
        <div className="flex gap-3 mb-8">
          {DIFFICULTIES.map((d) => {
            const isSelected = difficulty?.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(isSelected ? null : d)}
                className={cn(
                  "flex-1 p-3 rounded-2xl border-2 transition-all duration-200 text-center flex flex-col items-center",
                  isSelected 
                    ? "bg-[#ebe8ff] border-[#4776e6] shadow-[0_4px_14px_rgba(71,118,230,0.15)]" 
                    : "bg-white border-slate-200"
                )}
              >
                <div className="text-lg mb-1">{d.stars}</div>
                <div className="font-black text-sm text-slate-800">{d.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{d.desc}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold">⏱ {d.time}s/q</div>
              </button>
            )
          })}
        </div>

        {/* Start Button */}
        <motion.button
          whileHover={topic && difficulty ? { scale: 1.02 } : {}}
          whileTap={topic && difficulty ? { scale: 0.98 } : {}}
          disabled={!topic || !difficulty}
          onClick={onStart}
          className={cn(
            "w-full p-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all duration-300",
            !topic || !difficulty ? "opacity-50 cursor-not-allowed grayscale" : ""
          )}
          style={{
            background: topic 
              ? `linear-gradient(135deg, ${topic.gradient[0]}, ${topic.gradient[1]})` 
              : "linear-gradient(135deg, #ccc, #aaa)"
          }}
        >
          🚀 Start Quiz!
        </motion.button>
      </div>
    </MobileWrapper>
  );
}
