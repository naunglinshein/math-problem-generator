import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get problem history with scores
    const { data: history, error } = await supabase
      .from('math_problem_submissions')
      .select(`
        *,
        math_problem_sessions (
          problem_text,
          correct_answer,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
      throw new Error('Failed to fetch problem history');
    }

    // Get total statistics from ALL records (using count queries)
    const { count: totalProblems, error: totalError } = await supabase
      .from('math_problem_submissions')
      .select('*', { count: 'exact', head: true });

    const { count: correctAnswers, error: correctError } = await supabase
      .from('math_problem_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_correct', true);

    if (totalError || correctError) {
      throw new Error('Failed to fetch statistics');
    }

    // Calculate statistics
    const accuracy = totalProblems > 0 ? (correctAnswers / totalProblems) * 100 : 0;
    
    // Calculate score
    const totalScore = (correctAnswers || 0) * 10;

    // Calculate current streak
    const sortedHistory = history.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    let streak = 0;
    for (const item of sortedHistory) {
      if (item.is_correct) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      history: history.map(item => ({
        id: item.id,
        problem_text: item.math_problem_sessions.problem_text,
        user_answer: item.user_answer,
        correct_answer: item.math_problem_sessions.correct_answer,
        is_correct: item.is_correct,
        feedback: item.feedback_text,
        score: item.is_correct ? 10 : 0,
        completed_at: item.created_at
      })),
      statistics: {
        total_problems: totalProblems,
        correct_answers: correctAnswers,
        accuracy: Math.round(accuracy),
        total_score: totalScore,
        current_streak: streak,
        display_note: "Showing latest 50 problems from your history" 
      }
    });

  } catch (error) {
    console.error('Error fetching problem history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch problem history' },
      { status: 500 }
    );
  }
}