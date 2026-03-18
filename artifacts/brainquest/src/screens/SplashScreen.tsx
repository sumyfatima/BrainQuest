import { useEffect } from "react";
import { motion } from "framer-motion";
import { MobileWrapper } from "@/components/MobileWrapper";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <MobileWrapper isDark>
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,#4776e655,transparent)] top-[10%] left-[20%] animate-orb1" />
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,#f953c633,transparent)] bottom-[15%] right-[10%] animate-orb2" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 text-center flex flex-col items-center"
        >
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-[80px] mb-2 drop-shadow-2xl"
          >
            🎓
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">BrainQuest</h1>
          <p className="text-lg text-slate-300 font-medium">Learn • Play • Grow</p>
          
          <div className="flex gap-2 justify-center mt-10">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className="w-2.5 h-2.5 rounded-full bg-[#4776e6] animate-dot-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </MobileWrapper>
  );
}
