import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Screens
import { SplashScreen } from "@/screens/SplashScreen";
import { SetupScreen } from "@/screens/SetupScreen";
import { QuizScreen } from "@/screens/QuizScreen";
import { ResultScreen } from "@/screens/ResultScreen";

// Types & Hooks
import { type Topic, type Difficulty } from "@/lib/constants";
import { useGenerateQuiz } from "@workspace/api-client-react";
import type { QuizQuestion } from "@workspace/api-client-react";

const queryClient = new QueryClient();

type ScreenType = "splash" | "setup" | "quiz" | "result";

function BrainQuestGame() {
  const [screen, setScreen] = useState<ScreenType>("splash");
  
  // User Preferences
  const [avatar, setAvatar] = useState("🦊");
  const [playerName, setPlayerName] = useState("");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  
  // Game State
  const [totalStars, setTotalStars] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [aiSource, setAiSource] = useState("");
  
  // Result State
  const [lastScore, setLastScore] = useState(0);
  const [lastCorrectCount, setLastCorrectCount] = useState(0);
  const [lastBestStreak, setLastBestStreak] = useState(0);
  const [lastHistory, setLastHistory] = useState<any[]>([]);

  const generateQuizMutation = useGenerateQuiz();

  const getFallbackQuestions = (topicLabel: string): QuizQuestion[] => {
    return Array.from({ length: 6 }, (_, i) => ({
      question: `Interesting fallback question #${i + 1} about ${topicLabel}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correct: i % 4,
      explanation: `This is a generated fallback explanation because the AI request failed. Learning about ${topicLabel} is fun!`,
      fun_fact: `Did you know ${topicLabel} is fascinating?`
    }));
  };

  const handleStartQuiz = useCallback(() => {
    if (!topic || !difficulty) return;
    
    setScreen("quiz");
    setQuestions([]);
    setAiSource("");
    
    generateQuizMutation.mutate({
      data: {
        topic: topic.label,
        difficulty: difficulty.id as "easy" | "medium" | "hard"
      }
    }, {
      onSuccess: (res) => {
        setQuestions(res.questions);
        setAiSource(res.source_summary);
      },
      onError: (err) => {
        console.error("Failed to generate quiz, using fallbacks:", err);
        setQuestions(getFallbackQuestions(topic.label));
        setAiSource("Offline Mode: Built-in knowledge");
      }
    });
  }, [topic, difficulty, generateQuizMutation]);

  const handleQuizComplete = (score: number, correctCount: number, bestStreak: number, history: any[]) => {
    setLastScore(score);
    setLastCorrectCount(correctCount);
    setLastBestStreak(bestStreak);
    setLastHistory(history);
    setTotalStars(prev => prev + score);
    setScreen("result");
  };

  return (
    <>
      {screen === "splash" && (
        <SplashScreen onComplete={() => setScreen("setup")} />
      )}
      
      {screen === "setup" && (
        <SetupScreen
          avatar={avatar} setAvatar={setAvatar}
          playerName={playerName} setPlayerName={setPlayerName}
          topic={topic} setTopic={setTopic}
          difficulty={difficulty} setDifficulty={setDifficulty}
          onStart={handleStartQuiz}
          totalStars={totalStars}
        />
      )}
      
      {screen === "quiz" && topic && difficulty && (
        <QuizScreen
          topic={topic}
          difficulty={difficulty}
          questions={questions}
          loading={generateQuizMutation.isPending}
          aiSource={aiSource}
          onExit={() => setScreen("setup")}
          onComplete={handleQuizComplete}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          score={lastScore}
          correctCount={lastCorrectCount}
          totalQuestions={questions.length || 6}
          bestStreak={lastBestStreak}
          history={lastHistory}
          topic={topic}
          avatar={avatar}
          playerName={playerName}
          onPlayAgain={handleStartQuiz}
          onChangeTopic={() => {
            setTopic(null);
            setScreen("setup");
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrainQuestGame />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
