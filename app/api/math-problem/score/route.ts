import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get only the count of correct answers - most efficient
    const { count: correctAnswers, error: countError } = await supabase
      .from('math_problem_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_correct', true);

    if (countError) throw new Error('Failed to fetch score');

    const totalScore = (correctAnswers || 0) * 10; // 10 points per correct answer

    return NextResponse.json({
      total_score: totalScore,
      correct_answers: correctAnswers || 0
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'CDN-Cache-Control': 'no-cache',
        'Vercel-CDN-Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error fetching score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch score' },
      { status: 500 }
    );
  }
}