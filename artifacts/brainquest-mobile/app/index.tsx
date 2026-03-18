import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

// Types
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  fun_fact: string;
}

// Constants
const TOPICS = [
  { id: "math", label: "Math", emoji: "🔢", color: "#FF6B6B" },
  { id: "science", label: "Science", emoji: "🔬", color: "#11998e" },
  { id: "animals", label: "Animals", emoji: "🦁", color: "#f7971e" },
  { id: "space", label: "Space", emoji: "🚀", color: "#4776e6" },
  { id: "geography", label: "Geography", emoji: "🌍", color: "#56CCF2" },
  { id: "history", label: "History", emoji: "📜", color: "#c94b4b" },
  { id: "technology", label: "Technology", emoji: "💻", color: "#8e54e9" },
  { id: "sports", label: "Sports", emoji: "⚽", color: "#f953c6" },
];

const DIFFICULTIES = [
  { id: "easy", label: "Easy", stars: "⭐", time: 25, bonus: 0 },
  { id: "medium", label: "Medium", stars: "⭐⭐", time: 20, bonus: 2 },
  { id: "hard", label: "Hard", stars: "⭐⭐⭐", time: 15, bonus: 5 },
];

const AVATARS = ["🦊", "🐼", "🦄", "🐸", "🤖", "🦋", "🐧", "🦖"];

type ScreenType = "splash" | "setup" | "quiz" | "result";

const API_BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`
  : "http://localhost:8080/api";

export default function BrainQuestApp() {
  const insets = useSafeAreaInsets();

  // Screens
  const [screen, setScreen] = useState<ScreenType>("splash");

  // User state
  const [avatar, setAvatar] = useState("🦊");
  const [playerName, setPlayerName] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[0] | null>(null);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[0] | null>(null);

  // Game state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [history, setHistory] = useState<Array<{ question: string; correct: boolean; topic: string }>>([]);
  const [aiSource, setAiSource] = useState("");

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const currentQ = questions[qIndex];
  const maxTime = difficulty?.time || 20;

  // Splash animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setScreen("setup"), 2500);
    return () => clearTimeout(t);
  }, []);

  // Timer
  useEffect(() => {
    if (screen !== "quiz" || answered || loading || !currentQ) return;
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qIndex, screen, answered, loading, currentQ]);

  // Generate questions
  const handleGenerateQuestions = useCallback(
    async (topicObj: (typeof TOPICS)[0], diff: (typeof DIFFICULTIES)[0]) => {
      setLoading(true);
      setQuestions([]);
      setQIndex(0);
      setScore(0);
      setStreak(0);
      setSelected(null);
      setAnswered(false);

      const msgs = [
        "🌐 Searching the internet...",
        "🤖 AI reading latest facts...",
        "🧠 Creating smart questions...",
        "✨ Almost ready...",
      ];
      let msgIdx = 0;
      setLoadMsg(msgs[0]);
      const msgInt = setInterval(() => {
        msgIdx = Math.min(msgIdx + 1, msgs.length - 1);
        setLoadMsg(msgs[msgIdx]);
      }, 1800);

      try {
        const response = await fetch(`${API_BASE_URL}/quiz/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicObj.label,
            difficulty: diff.id as "easy" | "medium" | "hard",
          }),
        });

        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setAiSource(data.source_summary || "AI-generated questions");
        } else {
          throw new Error("No questions returned");
        }
      } catch (error) {
        console.error("Error generating questions:", error);
        const fallback: QuizQuestion[] = Array.from({ length: 6 }, (_, i) => ({
          question: `Fun question #${i + 1} about ${topicObj.label}?`,
          options: ["Answer A", "Answer B", "Answer C", "Answer D"],
          correct: i % 4,
          explanation: `This is a great fact about ${topicObj.label}!`,
          fun_fact: `Did you know ${topicObj.label} is fascinating?`,
        }));
        setQuestions(fallback);
        setAiSource("Built-in knowledge (offline)");
      } finally {
        clearInterval(msgInt);
        setLoading(false);
      }
    },
    []
  );

  const handleAnswer = (idx: number) => {
    if (answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(idx);

    if (currentQ && idx === currentQ.correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((s) => Math.max(s, newStreak));
      const diffBonus = difficulty?.bonus || 0;
      const streakBonus = newStreak >= 3 ? 5 : 0;
      setScore((s) => s + 10 + diffBonus + streakBonus);
    } else {
      setStreak(0);
    }

    setHistory((h) => [
      ...h,
      {
        question: currentQ?.question || "Unknown",
        correct: idx === (currentQ?.correct ?? -1),
        topic: topic?.label || "Unknown",
      },
    ]);
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= questions.length) {
      setTotalStars((t) => t + score);
      setScreen("result");
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const startQuiz = (t: (typeof TOPICS)[0], d: (typeof DIFFICULTIES)[0]) => {
    setTopic(t);
    setDifficulty(d);
    setHistory([]);
    setScreen("quiz");
    handleGenerateQuestions(t, d);
  };

  // SPLASH SCREEN
  if (screen === "splash") {
    return (
      <View style={[styles.splashRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: "center" }}>
          <Text style={{ fontSize: 80 }}>🎓</Text>
          <Text style={styles.splashTitle}>BrainQuest</Text>
          <Text style={styles.splashSub}>Learn • Play • Grow</Text>
        </Animated.View>
      </View>
    );
  }

  // SETUP SCREEN
  if (screen === "setup") {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.logo}>🎓 BrainQuest</Text>
          <View style={styles.starsChip}>
            <Text style={styles.starsText}>⭐ {totalStars}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.setupContent} showsVerticalScrollIndicator={false}>
          <View style={styles.greetBox}>
            <Text style={{ fontSize: 56 }}>{avatar}</Text>
            <Text style={styles.greetTitle}>Who is learning today?</Text>
          </View>

          <View style={styles.avatarRow}>
            {AVATARS.map((a) => (
              <TouchableOpacity
                key={a}
                onPress={() => setAvatar(a)}
                style={[styles.avatarBtn, avatar === a && styles.avatarBtnActive]}
              >
                <Text style={{ fontSize: 28 }}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.nameInput}
            placeholder="Enter your name..."
            placeholderTextColor="#666"
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={16}
          />

          <Text style={styles.sectionTitle}>🎯 Pick a Topic</Text>
          <View style={styles.topicGrid}>
            {TOPICS.map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTopic(topic?.id === t.id ? null : t)}
                style={[
                  styles.topicCard,
                  {
                    backgroundColor: t.color,
                    borderColor: topic?.id === t.id ? "#fff" : "transparent",
                    borderWidth: topic?.id === t.id ? 3 : 0,
                    transform: [{ scale: topic?.id === t.id ? 1.06 : 1 }],
                  },
                ]}
              >
                <Text style={{ fontSize: 28 }}>{t.emoji}</Text>
                <Text style={styles.topicLabel}>{t.label}</Text>
                {topic?.id === t.id && <Text style={styles.topicCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>⚡ Choose Difficulty</Text>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.id}
                onPress={() => setDifficulty(difficulty?.id === d.id ? null : d)}
                style={[styles.diffCard, difficulty?.id === d.id && styles.diffCardActive]}
              >
                <Text style={{ fontSize: 20 }}>{d.stars}</Text>
                <Text style={[styles.diffLabel, difficulty?.id === d.id && { color: "#4776e6" }]}>
                  {d.label}
                </Text>
                <Text style={styles.diffTime}>⏱ {d.time}s/q</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            disabled={!topic || !difficulty}
            onPress={() => topic && difficulty && startQuiz(topic, difficulty)}
            style={[
              styles.bigBtn,
              {
                backgroundColor: topic ? topic.color : "#555",
                opacity: !topic || !difficulty ? 0.4 : 1,
              },
            ]}
          >
            <Text style={styles.bigBtnText}>🚀 Start Quiz!</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // QUIZ SCREEN
  if (screen === "quiz") {
    const timerPct = (timeLeft / maxTime) * 100;
    const timerColor = timerPct > 50 ? "#11998e" : timerPct > 25 ? "#f7971e" : "#FF6B6B";

    return (
      <SafeAreaView style={[styles.root, { backgroundColor: Colors.dark.background }]}>
        <StatusBar barStyle="light-content" />

        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setScreen("setup")} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#aaa", fontSize: 13, fontWeight: "600" }}>
              {topic?.emoji} {topic?.label}
            </Text>
            {streak >= 2 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak} Streak!</Text>
              </View>
            )}
          </View>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        <View style={[styles.progressBg, { backgroundColor: Colors.dark.card }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((qIndex + 1) / Math.max(questions.length, 1)) * 100}%`,
                backgroundColor: topic?.color,
              },
            ]}
          />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🤖</Text>
            <Text style={styles.loadingTitle}>AI is thinking...</Text>
            <Text style={styles.loadingMsg}>{loadMsg}</Text>
            <ActivityIndicator size="large" color={topic?.color || "#4776e6"} style={{ marginVertical: 16 }} />
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>🌐 Web Search + Claude AI</Text>
            </View>
          </View>
        ) : currentQ ? (
          <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}>
            <View style={styles.timerRow}>
              <View style={styles.timerTrack}>
                <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: timerColor }]} />
              </View>
              <Text style={[styles.timerNum, { color: timerColor }]}>{timeLeft}s</Text>
            </View>

            <View style={[styles.questionCard, { backgroundColor: Colors.dark.card }]}>
              <Text style={styles.qMeta}>
                Question {qIndex + 1} of {questions.length}
              </Text>
              <Text style={styles.qText}>{currentQ.question}</Text>
            </View>

            {currentQ.options.map((opt: string, i: number) => {
              const isCorrect = i === currentQ.correct;
              const isSelected = i === selected;
              let bgColor = Colors.dark.card;
              let borderColor = "transparent";

              if (answered) {
                if (isCorrect) {
                  bgColor = "#38ef7d18";
                  borderColor = "#38ef7d88";
                } else if (isSelected) {
                  bgColor = "#FF6B6B18";
                  borderColor = "#FF6B6B88";
                }
              }

              return (
                <TouchableOpacity
                  key={i}
                  disabled={answered}
                  onPress={() => !answered && handleAnswer(i)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: bgColor,
                      borderColor,
                      borderWidth: answered && (isCorrect || isSelected) ? 2 : 1,
                      opacity: answered && !isCorrect && !isSelected ? 0.35 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.optBadge,
                      {
                        backgroundColor:
                          answered && isCorrect
                            ? "#38ef7d"
                            : answered && isSelected
                              ? "#FF6B6B"
                              : "#ffffff18",
                      },
                    ]}
                  >
                    <Text style={styles.optBadgeText}>
                      {answered && isCorrect ? "✓" : answered && isSelected ? "✗" : ["A", "B", "C", "D"][i]}
                    </Text>
                  </View>
                  <Text style={styles.optText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}

            {answered && (
              <View
                style={[
                  styles.feedbackCard,
                  {
                    backgroundColor:
                      selected === currentQ.correct ? "rgba(56, 239, 125, 0.1)" : "rgba(255, 107, 107, 0.1)",
                    borderColor: selected === currentQ.correct ? "rgba(56, 239, 125, 0.3)" : "rgba(255, 107, 107, 0.3)",
                  },
                ]}
              >
                <Text style={{ fontSize: 36, textAlign: "center", marginBottom: 8 }}>
                  {selected === -1 ? "⏱️" : selected === currentQ.correct ? "🎉" : "😅"}
                </Text>
                <Text style={styles.feedbackTitle}>
                  {selected === -1 ? "Time's up!" : selected === currentQ.correct ? "Correct!" : `Answer: ${currentQ.options[currentQ.correct]}`}
                </Text>
                <Text style={styles.feedbackExplain}>{currentQ.explanation}</Text>
                {currentQ.fun_fact && <Text style={styles.funFact}>💡 {currentQ.fun_fact}</Text>}
                <TouchableOpacity
                  onPress={nextQuestion}
                  style={[styles.bigBtn, { backgroundColor: topic?.color, marginTop: 12 }]}
                >
                  <Text style={styles.bigBtnText}>
                    {qIndex + 1 >= questions.length ? "See Results 🏁" : "Next →"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {aiSource && !loading && <Text style={styles.sourceTag}>🌐 {aiSource}</Text>}
            <View style={{ height: 20 }} />
          </ScrollView>
        ) : null}
      </SafeAreaView>
    );
  }

  // RESULT SCREEN
  if (screen === "result") {
    const correct = history.filter((h) => h.correct).length;
    const pct = Math.round((correct / questions.length) * 100);
    const grade =
      pct >= 90
        ? { label: "🏆 Genius!", color: "#FFD93D" }
        : pct >= 70
          ? { label: "🥈 Star Player!", color: "#C0C0C0" }
          : pct >= 50
            ? { label: "🥉 Good Job!", color: "#CD7F32" }
            : { label: "🎮 Keep Going!", color: "#11998e" };

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 70 }}>
              {pct >= 90 ? "🏆" : pct >= 70 ? "🥈" : pct >= 50 ? "🥉" : "🎮"}
            </Text>
            <Text style={[styles.gradeName, { color: grade.color }]}>{grade.label}</Text>
            <Text style={styles.playerInfo}>
              {avatar} {playerName || "Explorer"}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {[
              { icon: "⭐", val: score, label: "Stars Earned" },
              { icon: "🎯", val: `${pct}%`, label: "Accuracy" },
              { icon: "🔥", val: bestStreak, label: "Best Streak" },
              { icon: "✅", val: `${correct}/${questions.length}`, label: "Correct" },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: Colors.dark.card }]}>
                <Text style={{ fontSize: 26 }}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.reviewTitle}>📋 Question Review</Text>
          <View style={styles.reviewList}>
            {questions.map((q, i) => {
              const h = history[i];
              return (
                <View
                  key={i}
                  style={[
                    styles.reviewItem,
                    {
                      backgroundColor: Colors.dark.card,
                      borderColor: h?.correct ? "#38ef7d44" : "#FF6B6B44",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 16 }}>{h?.correct ? "✅" : "❌"}</Text>
                  <Text style={[styles.reviewText, { flex: 1 }]}>{q.question}</Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={() => topic && difficulty && startQuiz(topic, difficulty)}
            style={[styles.bigBtn, { backgroundColor: topic?.color, marginTop: 16 }]}
          >
            <Text style={styles.bigBtnText}>🔄 Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setHistory([]);
              setScreen("setup");
            }}
            style={[styles.bigBtn, { backgroundColor: "#4776e6", marginTop: 10 }]}
          >
            <Text style={styles.bigBtnText}>🏠 Change Topic</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

// Styles
const styles = StyleSheet.create({
  splashRoot: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: "center",
    justifyContent: "center",
  },
  splashTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    marginTop: 8,
  },
  splashSub: {
    fontSize: 16,
    color: "#888",
    marginTop: 4,
  },

  root: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.card,
  },
  logo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4776e6",
  },
  starsChip: {
    backgroundColor: "#FFF8E0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  starsText: {
    color: "#E67E22",
    fontWeight: "800",
    fontSize: 14,
  },

  setupContent: {
    padding: 16,
  },
  greetBox: {
    alignItems: "center",
    paddingVertical: 20,
  },
  greetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.dark.text,
    marginTop: 8,
  },

  avatarRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  avatarBtn: {
    fontSize: 26,
    backgroundColor: "#1a1a2e",
    borderColor: "#2a2a3e",
    borderWidth: 2.5,
    borderRadius: 14,
    padding: 8,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBtnActive: {
    backgroundColor: "#2a3a5e",
    borderColor: "#4776e6",
    transform: [{ scale: 1.15 }],
  },

  nameInput: {
    width: "100%",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderColor: "#333",
    borderWidth: 2,
    fontSize: 16,
    color: Colors.dark.text,
    backgroundColor: "#1a1a2e",
    marginBottom: 16,
  },

  sectionTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 12,
    marginTop: 8,
  },

  topicGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  topicCard: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  topicLabel: {
    fontWeight: "800",
    fontSize: 13,
    color: "#fff",
  },
  topicCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 50,
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "900",
    fontSize: 12,
    color: "#333",
  },

  diffRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  diffCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderColor: "#444",
    borderWidth: 2,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
  },
  diffCardActive: {
    backgroundColor: "#2a3a5e",
    borderColor: "#4776e6",
  },
  diffLabel: {
    fontWeight: "800",
    fontSize: 14,
    color: Colors.dark.text,
  },
  diffTime: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },

  bigBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bigBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 17,
  },

  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#161628",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "#ffffff18",
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadge: {
    backgroundColor: "#f7971e",
    color: "#333",
    fontWeight: "800",
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 99,
    marginTop: 4,
  },
  streakText: {
    color: "#333",
    fontWeight: "800",
    fontSize: 11,
  },
  scorePill: {
    backgroundColor: "#ffffff18",
    color: "#FFD93D",
    fontWeight: "800",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  scoreText: {
    color: "#FFD93D",
    fontWeight: "800",
    fontSize: 14,
  },

  progressBg: {
    height: 6,
    position: "relative",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
  },

  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  loadingMsg: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
    minHeight: 20,
  },
  aiBadge: {
    marginTop: 28,
    backgroundColor: "#ffffff12",
    color: "#888",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  aiBadgeText: {
    color: "#888",
    fontSize: 12,
  },

  quizContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  timerTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#ffffff18",
    borderRadius: 99,
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRadius: 99,
  },
  timerNum: {
    fontWeight: "900",
    fontSize: 16,
    minWidth: 28,
  },

  questionCard: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderColor: "#ffffff12",
    borderWidth: 1,
  },
  qMeta: {
    fontSize: 11,
    color: "#666",
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  qText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f0f0f0",
    lineHeight: 28,
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderColor: "#ffffff18",
    borderWidth: 1,
    marginBottom: 10,
  },
  optBadge: {
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: 13,
    color: "#fff",
  },
  optBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  optText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e0e0e0",
    lineHeight: 22,
    flex: 1,
  },

  feedbackCard: {
    marginTop: 12,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderColor: "#ffffff18",
    borderWidth: 1,
  },
  feedbackTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  feedbackExplain: {
    fontSize: 13,
    color: "#aaa",
    lineHeight: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  funFact: {
    backgroundColor: "#ffffff0c",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#FFD93D",
    lineHeight: 18,
    textAlign: "center",
  },

  sourceTag: {
    textAlign: "center",
    fontSize: 11,
    color: "#555",
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff08",
    borderRadius: 99,
  },

  resultContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  gradeName: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 6,
  },
  playerInfo: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },

  statsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  reviewTitle: {
    fontWeight: "800",
    fontSize: 15,
    color: "#fff",
    marginBottom: 10,
  },
  reviewList: {
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  reviewText: {
    fontSize: 13,
    color: "#ccc",
    lineHeight: 20,
  },
});
