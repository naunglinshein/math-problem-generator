# Math Problem Generator - Developer Assessment Starter Kit

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/naunglinshein/math-problem-generator.git
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "final_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [ ] AI generates appropriate Primary 5 level math problems
- [ ] Problems and answers are saved to Supabase
- [ ] User submissions are saved with feedback
- [ ] AI generates helpful, personalized feedback
- [ ] UI is clean and mobile-responsive
- [ ] Error handling for API failures
- [ ] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

When submitting your assessment, provide:

1. **GitHub Repository URL**: Make sure it's public
2. **Live Demo URL**: Your Vercel deployment
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://codpokdumxztdlkhacbc.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvZHBva2R1bXh6dGRsa2hhY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NDA1NzksImV4cCI6MjA3NTExNjU3OX0.YYLbhlzUx-cg9Nps4gEeosG7zSDj8MVru_PBRR_NkHs
   ```

## Implementation Notes

*Please fill in this section with any important notes about your implementation, design decisions, challenges faced, or features you're particularly proud of.*

### My Implementation:

- Implemented /api/math-problem to generate new math problems using AI. Reason: provides dynamic, varied problems for users without hardcoding questions.
- Implemented /api/math-problem/submit to evaluate answers and provide feedback using AI (“Correct” / “Incorrect”). Reason: ensures real-time validation and learning feedback.
- Implemented /api/math-problem/hint to generate AI-based hints. Reason: gives students guidance without revealing answers.
- Implemented /api/math-problem/solution-steps to generate step-by-step solutions using AI. Reason: helps students learn correct procedures after attempting the problem.
- Implemented /api/math-problem/score to efficiently calculate total score using database count queries. Reason: provides fast score updates without loading full history data.
- Implemented /api/math-problem/history to display problem history with accurate statistics. Reason: allows students to review their learning journey and track progress.
- Added toast notifications (layout.tsx) for all errors. Reason: improves UX and informs the user when something goes wrong.
- Implemented problem generation logic in page.tsx. Reason: handles UI interaction for generating new problems.
- Implemented answer submission logic in page.tsx. Reason: ensures seamless user interaction and updates feedback state.
- Implemented hint generation logic in page.tsx. Reason: allows users to request hints and dynamically display them.
- Implemented step-by-step solution logic in page.tsx. Reason: helps students review the correct solution after attempting the problem.
- Implemented score tracking logic with real-time updates. Reason: motivates students with visible progress indicators.
- Implemented history view modal with lazy loading. Reason: provides comprehensive analytics without impacting main interface performance.
- Added Select boxes for difficulty (Random/Easy/Medium/Hard) and problem type (Random/Addition/Subtraction/Multiplication/Division). Reason: allows dynamic problem generation and testing different difficulty levels.
- Added Show Hint and Show Solution Steps buttons in page.tsx. Reason: improves UX by giving the user control over what guidance to see.
- Added View History button and score display in header. Reason: makes progress tracking easily accessible.
- Added loading spinner component for Generate New Problem, Submit Answer, Show Hint, and Show Solution Steps buttons. Reason: provides visual feedback during asynchronous operations, improving user experience.
- Added loading states for score display and history modal. Reason: ensures smooth user experience during data fetching.
- Added boxes to display hint and solution steps. Reason: separates UI for problem, hints, and solutions for clarity.
- Added statistics cards (total problems, accuracy, score, streak) in history modal. Reason: provides at-a-glance progress metrics.
- Added history items with clear correct/incorrect indicators and answer comparison. Reason: enables effective learning from past mistakes.
- Added lib/gemini.ts to handle all AI interactions (problem generation, answer validation, hints, and step-by-step solutions). Reason: makes AI integration modular and maintainable.
- Changed postcss.config.mjs to postcss.config.js because Tailwind CSS was not working with .mjs. Reason: fixed build issues and ensured styles load correctly.
- Added TooltipWrapper component to show helpful messages when hovering over disabled buttons (e.g., “Please enter your answer before submitting”). Reason: improves UX by explaining why actions are unavailable.


## Design Decisions and Reasoning:

- All AI-powered endpoints: problem generation, answer feedback, hints, and step-by-step solutions. Reason: creates a dynamic, intelligent learning experience.
- Separate score API for efficient updates: Uses database count queries instead of loading full history. Reason: ensures fast performance even with large datasets.
- Lazy-loaded history data: History only fetches when user clicks "View History". Reason: maintains fast initial load times and responsive problem-solving interface.
- Limited history display (50 most recent): Shows recent problems with full statistics from all data. Reason: balances performance with comprehensive analytics.
- Always show correct answers in history: Provides immediate learning feedback without hidden answers. Reason: enhances educational value and transparency.
- Step-by-step solutions appear only after submission. Reason: encourages students to attempt the problem first before seeing the answer.
- Numbered list for solution steps. Reason: preserves order, making it easier for students to follow.
- Toast notifications for error handling. Reason: improves user experience and debugging.
- Toast notifications and loading indicators. Reason: enhances UX and prevents multiple submissions.
- Modal-based history view: Keeps main interface clean and focused on problem-solving. Reason: maintains optimal learning flow without distractions.

## Challenges:

- Ensuring AI outputs clean arrays of steps without extra markdown or JSON formatting. Solved by stripping code block markers and parsing JSON safely.
- Integrating Tailwind CSS properly with project configuration.
- Implementing efficient score calculation without loading full submission history. Solved by using Supabase count queries and separate API endpoints.
- Managing multiple loading states for score, history, and individual operations. Solved with specific state variables for each async operation.

## Features I’m Proud Of:

- Fully AI-driven math problem system.
- Thoughtful UX flow: problem → submit → optional hint → optional solution.
- Comprehensive progress tracking: Real-time score updates with detailed history analytics.
- Performance-optimized architecture: Efficient API design with lazy loading and database aggregation.
- Educational history view: Clear answer comparison and statistics to reinforce learning.
- Robust error handling and loading states for smooth frontend experience.
- Motivational scoring system: Visual progress indicators that encourage continued learning.

## Key Technical Achievements:
- Database optimization: Used count queries instead of full data retrieval for statistics
- Performance separation: Isolated heavy history loading from core problem-solving flow
- Real-time feedback: Instant score updates while maintaining fast interface
- Scalable architecture: Efficient APIs that work with large datasets
- Educational design: History view that actually helps learning, not just tracking

## Additional Features (Optional)

If you have time, consider adding:

- [ ] Difficulty levels (Easy/Medium/Hard)
- [ ] Problem history view
- [ ] Score tracking
- [ ] Different problem types (addition, subtraction, multiplication, division)
- [ ] Hints system
- [ ] Step-by-step solution explanations

---

Good luck with your assessment! 🎯