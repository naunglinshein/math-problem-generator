import { NextRequest, NextResponse } from 'next/server';
import { genAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { problem_text, problem_type, difficulty } = await request.json();

    if (!problem_text) {
      return NextResponse.json({ error: 'Missing problem text' }, { status: 400 });
    }

    const steps = await generateAISolutionSteps(problem_text, problem_type, difficulty);

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Error generating solution steps:', error);
    return NextResponse.json({
      steps: ['Break the problem into smaller parts and solve each step carefully.']
    });
  }
}

// Generate step-by-step solution with AI
async function generateAISolutionSteps(
  problemText: string,
  problemType: string,
  difficulty: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are helping a Primary 5 student (10-11 years old) with a math problem.
        Problem: "${problemText}"
        Operation: ${problemType || 'random'}
        Difficulty: ${difficulty || 'random'}

        Provide a **step-by-step solution** for this problem.
        - Use simple, clear language.
        - Break the problem into small steps.
        - Return **only the steps** as an array of strings, one step per string.
        - Do NOT provide extra commentary.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

    let steps: string[] = [];
    try {
        steps = JSON.parse(text);
        if (!Array.isArray(steps)) throw new Error('Not an array');
    } catch (err) {
        console.error('Failed to parse AI steps as JSON, fallback to splitting lines', err);
        steps = text.split(/\r?\n/).filter(line => line.trim() !== '');
    }
    return steps;
  } catch (error) {
    console.error('AI solution steps error:', error);
    return ['Break the problem into smaller parts and solve each step carefully.'];
  }
}
