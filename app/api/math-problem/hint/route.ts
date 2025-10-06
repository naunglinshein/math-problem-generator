import { NextRequest, NextResponse } from 'next/server';
import { genAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { problem_text, problem_type, difficulty } = await request.json();

    if (!problem_text) {
      return NextResponse.json({ error: 'Missing problem text' }, { status: 400 });
    }

    const hint = await generateAIHint(problem_text, problem_type, difficulty);

    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    return NextResponse.json({ hint: 'Think carefully about the numbers and operation involved.' });
  }
}

// AI hint generation
async function generateAIHint(problemText: string, problemType: string, difficulty: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are helping a Primary 5 student (10-11 years old) with a math problem.
        Problem: "${problemText}"
        Operation: ${problemType || 'random'}
        Difficulty: ${difficulty || 'random'}

        Provide a **helpful hint**, but do NOT give the answer. 
        - Use simple, clear language.
        - Be short (1-2 sentences).
        - Encourage the student to think about the numbers and steps.
        Return **only the hint** as plain text.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (error) {
    console.error('AI hint error:', error);
    return "Try looking at the numbers carefully and decide which operation to use first.";
  }
}
