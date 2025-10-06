import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { genAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { session_id, user_answer, difficulty } = await request.json();

    if (!session_id || user_answer === undefined || user_answer === '') {
      return NextResponse.json(
        { error: 'Missing session_id or user_answer' },
        { status: 400 }
      );
    }

    // Get the original problem session
    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Problem session not found' },
        { status: 404 }
      );
    }

    const userAnswerNum = parseFloat(user_answer);
    if (isNaN(userAnswerNum)) {
        return NextResponse.json({ error: 'Invalid user answer' }, { status: 400 });
    }

    const correctAnswerNum = parseFloat(session.correct_answer.toString());
    const isCorrect = Math.abs(userAnswerNum - correctAnswerNum) < 0.001; // Handle floating point precision

    // Generate AI feedback
    const feedback = await generateAIFeedback(
      session.problem_text,
      correctAnswerNum,
      userAnswerNum,
      isCorrect
    );

    // Save submission to Supabase
    const { data: submission, error: submissionError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id: session_id,
        user_answer: userAnswerNum,
        is_correct: isCorrect,
        feedback_text: feedback,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Supabase submission error:', submissionError);
      throw new Error('Failed to save submission');
    }

    // Calculate score 
    const calculateScore = (isCorrect: boolean, problemText: string): number => {
      let baseScore = isCorrect ? 10 : 0;
      
      return baseScore;
    };
    const score = calculateScore(isCorrect, session.problem_text);


    return NextResponse.json({
      is_correct: isCorrect,
      feedback: feedback,
      score: score
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

async function generateAIFeedback(
  problemText: string,
  correctAnswer: number,
  userAnswer: number,
  isCorrect: boolean
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
        Provide **encouraging, educational feedback** for a Primary 5 student (10-11 years old) who ${isCorrect ? 'correctly solved' : 'attempted to solve'} this math problem.
        
        PROBLEM: "${problemText}"
        STUDENT'S ANSWER: ${userAnswer}
        CORRECT ANSWER: ${correctAnswer}
        STUDENT WAS: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

        Guidelines for feedback:
        - Feedback must be supportive, positive, and age-appropriate.
        - If incorrect: gently explain the mistake, suggest the right approach, and encourage trying again.
        - If correct: offer specific praise and maybe extend the learning
        - Keep feedback **brief and clear**, maximum 2-3 sentences (or ~150 characters).
        - Focus on the student's **thinking process**, not just the final answer.
        - Make it **personalized** to this specific answer.
        - Avoid lists, bullet points, quotes, or any extra formatting.
        - Use simple, clear language suitable for 10-11 year olds

        Return **only the feedback text**, exactly as plain text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim();

  } catch (error) {
    console.error('Error generating AI feedback:', error);
    // Fallback feedback
    return isCorrect 
      ? "Excellent work! You solved the problem correctly. Your understanding of this math concept is really growing!" 
      : "Good attempt! Let's think about this differently. Remember to carefully read the problem and check each step of your work.";
  }
}