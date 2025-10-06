'use client'

import { useState, useEffect } from 'react'
import toast from "react-hot-toast";
import LoadingSpinner from '@/components/LoadingSpinner'
import TooltipWrapper from '@/components/TooltipWrapper'

interface MathProblem {
  problem_text: string
  final_answer: number
}

interface SubmissionResult {
  is_correct: boolean
  correct_answer: number
  feedback: string
  submission_id: string,
  score: number,
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [difficulty, setDifficulty] = useState('random'); // default difficulty 'Random'
  const [problemType, setProblemType] = useState('random'); // default problem type 'Random'
  const [hint, setHint] = useState('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [solutionSteps, setSolutionSteps] = useState<string[] | null>(null);
  const [isLoadingSolutionSteps, setIsLoadingSolutionSteps] = useState(false);
  const [isLoadingScore, setIsLoadingScore] = useState(true);

  const [showHistory, setShowHistory] = useState(false);
  const [problemHistory, setProblemHistory] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    total_problems: 0,
    correct_answers: 0,
    accuracy: 0,
    total_score: 0,
    current_streak: 0,
    display_note: '',
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    fetchInitialScore();
  }, []);

  const generateProblem = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    setFeedback('')
    setUserAnswer('')
    setIsCorrect(null)
    setHint('')
    setSolutionSteps([])
    try {
      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: difficulty,
          problem_type: problemType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate problem')
      }

      const data = await response.json()
      setProblem({
        problem_text: data.problem_text,
        final_answer: data.final_answer
      })
      setSessionId(data.session_id)
    } catch (err) {
      console.error('Error generating problem:', err)
      toast.error('Failed to generate problem')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId || !userAnswer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    setIsSubmitting(true)
    setIsLoading(true)
    setHint('')
    setFeedback('')
    setSolutionSteps([])
    try {
      const response = await fetch('/api/math-problem/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_answer: userAnswer,
          difficulty
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const result: SubmissionResult = await response.json()
      setFeedback(result.feedback)
      setIsCorrect(result.is_correct)

      // Update total score
      await fetchInitialScore();
    } catch (err) {
      console.error('Error submitting answer:', err)
      toast.error('Failed to submit answer')
    } finally {
      setIsLoading(false)
      setIsSubmitting(false)
    }
  }

  const getHint = async () => {
    if (!sessionId || !problem) return;

    setFeedback('')
    setIsLoading(true)
    setIsLoadingHint(true);
    setHint('')
    setSolutionSteps([])
    try {
      const res = await fetch('/api/math-problem/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_text: problem.problem_text,
          problem_type: problemType,
          difficulty,
        }),
      });

      const data = await res.json();
      setHint(data.hint);
    } catch (err) {
      console.error('Error fetching hint:', err)
      toast.error('Unable to generate hint. Please try again.')
    } finally {
      setIsLoading(false)
      setIsLoadingHint(false);
    }    
  };

  const getSolutionSteps = async () => {
    if (!feedback || !sessionId || !problem) return;

    setIsLoadingSolutionSteps(true)
    setIsLoading(true)
    setFeedback('')
    setHint('')
    setSolutionSteps([])
    try {
      const response = await fetch(`/api/math-problem/solution-steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_text: problem.problem_text,
          problem_type: problemType,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch solution steps')
      }

      const data = await response.json();
      setSolutionSteps(data.steps);
    } catch (err) {
      console.error('Error fetching solution steps', err);
      toast.error('Failed to get solution steps');
    } finally {
      setIsLoading(false)
      setIsLoadingSolutionSteps(false);
    }
  };

  const fetchProblemHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/math-problem/history?t=${Date.now()}`, {
        cache: 'no-cache' 
      });
      
      if (!response.ok) throw new Error('Failed to fetch history');
      
      const data = await response.json();
      setProblemHistory(data.history);
      setStatistics(data.statistics);
      setTotalScore(data.statistics.total_score);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast.error('Failed to load problem history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchInitialScore = async () => {
    try {
      setIsLoadingScore(true);
      const response = await fetch(`/api/math-problem/score?t=${Date.now()}`, {
        cache: 'no-cache' 
      });
      if (response.ok) {
        const data = await response.json();
        setTotalScore(data.total_score);
      }
    } catch (err) {
      console.error('Error fetching initial score:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingScore(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Your Math Journey</h2>
                <button
                  onClick={() => {
                    setShowHistory(false);
                    // CLEAR data when modal closes
                    setProblemHistory([]);
                    setStatistics({
                      total_problems: 0,
                      correct_answers: 0,
                      accuracy: 0,
                      total_score: 0,
                      current_streak: 0,
                      display_note: '',
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{statistics.total_problems}</div>
                  <div className="text-sm text-blue-800">Problems Solved</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{statistics.accuracy}%</div>
                  <div className="text-sm text-green-800">Accuracy</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{statistics.total_score}</div>
                  <div className="text-sm text-yellow-800">Total Score</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{statistics.current_streak}</div>
                  <div className="text-sm text-purple-800">Current Streak</div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6">

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 text-center">
                  {statistics.display_note || "Showing your complete problem history"}
                </p>
              </div>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading your math journey...</p>
                </div>
              ) : problemHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No problems solved yet. Start your math adventure!
                </div>
              ) : (
                <div className="space-y-4">
                  {problemHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`border-l-4 ${
                        item.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      } p-4 rounded`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          item.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {item.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">{item.problem_text}</p>
                      <div className="text-sm text-gray-600">
                        Your answer: <strong>{item.user_answer}</strong> | 
                        Correct answer: <strong>{item.correct_answer}</strong> | 
                        Score: <strong>+{item.score}</strong>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 italic">"{item.feedback}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Math Problem Generator
        </h1>

        <div className="flex items-center gap-4 mb-4">
          {/* Score Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-sm text-center">Total Score</div>
            <div className="text-2xl font-bold text-center">{isLoadingScore ? (
              <LoadingSpinner />
            ) : totalScore}</div>
          </div>

          {/* History Button */}
          <button
            disabled={isLoading}
            onClick={() => {
              setShowHistory(true);
              fetchProblemHistory();
            }}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition duration-200 h-100"
          >
            View History
          </button>
        </div>

        {/* Select box for difficulty */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Select Difficulty:
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="random">Random</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Select box for problem type */}
          <div className="mb-4">
            <label htmlFor="problem-type" className="block text-sm font-medium text-gray-700 mb-1">
              Select Problem Type:
            </label>
            <select
              id="problem-type"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="random">Random</option>
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="division">Division</option>
            </select>
          </div>

          {/* Generate button */}
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isGenerating ? (
              <LoadingSpinner text="Generating..." />
            ) : 'Generate New Problem'}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6">
              {problem.problem_text}
            </p>
            
            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="number"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter your answer"
                  required
                />
              </div>
              
              {/* submit button */}
              <TooltipWrapper
                show={!userAnswer || isLoading}   // only show tooltip when disabled
                text="Please enter your answer before submitting"
              >
                <button
                  type="submit"
                  disabled={!userAnswer || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <LoadingSpinner text="Submitting..." />
                  ) : 'Submit Answer'}
                </button>
              </TooltipWrapper>

              {/* hint button */}
              <button
                onClick={getHint}
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                {isLoadingHint ? (
                  <LoadingSpinner text="Preparing your hint..." />
                ) : 'Show Hint'}

              </button>

              {/* show solution steps button */}
              <TooltipWrapper show={isLoading || !feedback} text="You need to submit an answer before viewing solution steps">
                <button
                  onClick={getSolutionSteps}
                  disabled={isLoading || !feedback}
                  className="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                >
                  {isLoadingSolutionSteps ? (
                    <LoadingSpinner text="Preparing your solution..." />
                  ) : 'Show Solution Steps'}

                </button>
              </TooltipWrapper>
              
            </form>
          </div>
        )}

        {hint && (
          <div className={`rounded-lg shadow-lg p-6 bg-blue-50 border-2 border-blue-200`}>
            <p className="text-gray-800 leading-relaxed">{hint}</p>
          </div>
        )}

        {solutionSteps && solutionSteps.length > 0 && (
          <div className={`rounded-lg shadow-lg p-6 bg-blue-50 border-2 border-blue-200`}>
            <ol className="list-decimal list-inside space-y-2 text-gray-800">
              {solutionSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}