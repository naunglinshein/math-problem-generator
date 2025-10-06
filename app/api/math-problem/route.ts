import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { genAI } from "@/lib/gemini";

export async function POST(request: NextRequest) {
    try {
        const { difficulty, problem_type } = await request.json();

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
        Generate a math word problem suitable for Primary 5 students (10-11 years old).
        Difficulty level: ${difficulty === 'random' ? 'choose randomly between Easy, Medium, or Hard' : difficulty}.
        Operation type: ${problem_type === 'random' ? 'choose randomly from addition, subtraction, multiplication, division' : problem_type}.

        The problem must:
            - Involve one or more of these operations: addition, subtraction, multiplication, division.
            - Use only whole numbers.
            - Be engaging and relatable to children.
            - Have a clear question with only one correct numerical answer.
            - Use simple, age-appropriate language (short sentences, clear vocabulary).
            - Avoid fractions, decimals, or negative numbers.
            - Keep numbers reasonably small (1-100) for easy calculation.

        IMPORTANT:
            - Return ONLY valid JSON in this exact format, no extra text, explanations, or punctuation outside the JSON:
            {
                "problem_text": "The math word problem here...",
                "final_answer": 42
            }

            EXAMPLE OUTPUT:
            {
                "problem_text": "Sarah has 15 stickers. She gives 3 stickers to each of her 4 friends. How many stickers does she have left?",
                "final_answer": 3
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean and parse the response
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        
        let mathProblem;
        try {
            mathProblem = JSON.parse(cleanText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', cleanText);
            // Fallback problem
            mathProblem = {
                problem_text: "A farmer has 25 chickens and 17 ducks. How many birds does he have in total?",
                final_answer: 42
            };
        }

        // Validate required fields
        if (!mathProblem.problem_text || typeof mathProblem.final_answer !== 'number') {
            throw new Error('Invalid problem format from AI');
        }

        // Save to Supabase
        const { data: session, error } = await supabase
            .from('math_problem_sessions')
            .insert({
                problem_text: mathProblem.problem_text,
                correct_answer: mathProblem.final_answer,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            throw new Error('Failed to save problem to database');
        }

        return NextResponse.json({
            session_id: session.id,
            problem_text: mathProblem.problem_text
        });
    } catch (error) {
        console.error('Error generating math problem:', error);
        return NextResponse.json(
        { error: error instanceof Error ? error.message : JSON.stringify(error) },
        { status: 500 }
        );
    }
}