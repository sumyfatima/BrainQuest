import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { GenerateQuizBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/quiz/generate", async (req, res) => {
  const parseResult = GenerateQuizBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { topic, difficulty } = parseResult.data;

  const systemPrompt = `You are an expert educational quiz creator for kids aged 7–13.
Generate exactly 6 multiple-choice questions about the requested topic for the given difficulty level.
Return ONLY a raw JSON object (no markdown fences, no extra text) in this exact structure:
{
  "source_summary": "Brief 1-sentence description of the topic facts used",
  "questions": [
    {
      "question": "Question text?",
      "options": ["A text", "B text", "C text", "D text"],
      "correct": 0,
      "explanation": "Fun 1-2 sentence explanation of why this is correct, with an interesting fact.",
      "fun_fact": "A bonus wow fact related to this question!"
    }
  ]
}
Make questions fun, age-appropriate, and genuinely educational. Mix engaging and informative questions.
For easy difficulty: use well-known, straightforward facts.
For medium difficulty: use interesting facts that require some thought.
For hard difficulty: use challenging facts that test deeper knowledge.`;

  const userPrompt = `Create 6 ${difficulty} difficulty quiz questions about "${topic}" for kids aged 7-13.
Make the questions engaging, accurate, and varied — include facts kids would find amazing!`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    const rawText = textBlock.text.trim();
    const clean = rawText.replace(/```json|```/g, "").trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");

    const parsed = JSON.parse(match[0]);

    if (!parsed.questions || parsed.questions.length === 0) {
      throw new Error("No questions in response");
    }

    res.json({
      source_summary: parsed.source_summary || "AI-generated quiz questions",
      questions: parsed.questions.slice(0, 6),
    });
  } catch (err) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ error: "Failed to generate quiz questions" });
  }
});

export default router;
