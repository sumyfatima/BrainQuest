export const TOPICS = [
  { id: "math",       label: "Math",        emoji: "🔢", gradient: ["#FF6B6B", "#FF8E53"], shadow: "rgba(255,107,107,0.25)" },
  { id: "science",    label: "Science",     emoji: "🔬", gradient: ["#11998e", "#38ef7d"], shadow: "rgba(17,153,142,0.25)" },
  { id: "animals",    label: "Animals",     emoji: "🦁", gradient: ["#f7971e", "#ffd200"], shadow: "rgba(247,151,30,0.25)" },
  { id: "space",      label: "Space",       emoji: "🚀", gradient: ["#4776e6", "#8e54e9"], shadow: "rgba(71,118,230,0.25)" },
  { id: "geography",  label: "Geography",   emoji: "🌍", gradient: ["#11998e", "#56CCF2"], shadow: "rgba(86,204,242,0.25)" },
  { id: "history",    label: "History",     emoji: "📜", gradient: ["#c94b4b", "#4b134f"], shadow: "rgba(201,75,75,0.25)" },
  { id: "technology", label: "Technology",  emoji: "💻", gradient: ["#2980b9", "#6dd5fa"], shadow: "rgba(41,128,185,0.25)" },
  { id: "sports",     label: "Sports",      emoji: "⚽", gradient: ["#f953c6", "#b91d73"], shadow: "rgba(249,83,198,0.25)" },
];

export const DIFFICULTIES = [
  { id: "easy",   label: "Easy",   stars: "⭐",     desc: "Perfect for beginners", time: 25 },
  { id: "medium", label: "Medium", stars: "⭐⭐",   desc: "A real challenge!",     time: 20 },
  { id: "hard",   label: "Hard",   stars: "⭐⭐⭐", desc: "For super brains!",     time: 15 },
] as const;

export const AVATARS = ["🦊", "🐼", "🦄", "🐸", "🤖", "🦋", "🐧", "🦖"];

export type Topic = typeof TOPICS[number];
export type Difficulty = typeof DIFFICULTIES[number];

export const LOADING_MESSAGES = [
  "🌐 Searching the internet for facts...",
  "🤖 AI is reading articles & news...",
  "🧠 Crafting smart questions for you...",
  "✨ Almost ready...",
];
