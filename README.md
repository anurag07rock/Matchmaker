# The Date Crew - Professional Matchmaker Dashboard CRM MVP

An internal CRM and matchmaking dashboard designed for professional matchmakers to manage client portfolios, view comprehensive biographical data, calculate compatibility ranks, query AI-generated relationship briefs, and compose match recommendation emails.

---

## 🚀 Tech Stack (Locked)

- **Frontend**: Next.js 16 App Router (with React 19 compliance)
- **Styling**: Tailwind CSS v4 (designed with a dark-theme-first glassmorphism aesthetic)
- **Icons**: Lucide React
- **Types**: Strict TypeScript
- **Backend**: Next.js API Routes (Route Handlers)
- **AI Engine**: OpenAI API (`gpt-4o-mini` with json format structural validation)
- **Cache**: File-level in-memory caching mapping evaluated client pairs

---

## 🛠️ Setup & Installation Guide

### Prerequisites
- Node.js (version 18.17.0 or higher recommended)
- npm (version 9+ or higher)

### 1. Installation
Extract or clone the project files to your directory and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory and add your OpenAI credentials.
```env
OPENAI_API_KEY=your_openai_api_key_here
```
*Note: If the key is not set or the API fails, the dashboard automatically invokes a local fallback matching engine to generate rich, contextual briefings. The application will not crash.*

### 3. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 4. Build for Production
Verify typescript compliance and build the optimized production package:
```bash
npm run build
```

---

## 🔑 Login Credentials

The CRM dashboard uses mock session authentication. Use the following credentials to access the main interface:
- **Matchmaker ID**: `matchmaker`
- **Security Password**: `password`

---

## 🧮 Algorithmic Matching Logic

Matches are calculated programmatically inside `src/services/matching/matcher.ts` returning compatibility ratings from **0 to 100**.

### Target Filters (Hard Filters)
- **Gender Matches**: Candidates are filtered out unless they match the gender preferences of both participants.
- **Dealbreakers**: Profiles are excluded if they violate non-negotiables (e.g. if the client has a "smoker" dealbreaker and the candidate is a smoker).

### Demographic scoring (Male Clients)
- **Gender Preference**: Candidate must be female (25 points).
- **Age**: Candidate must be younger than the client (25 points).
- **Height**: Candidate must be shorter than the client (25 points).
- **Income**: Candidate must have a lower annual income than the client (25 points).
- **Kids**: Aligned family planning preferences (25 points).

### Values & Career scoring (Female Clients)
- **Profession compatibility**: Points (up to 20) added for overlapping or complementary domains (e.g. tech/tech or medicine/medicine).
- **Values alignment**: Points (up to 20) added for shared religion and interest intersections.
- **Education alignment**: Points (up to 20) added if both share similar degree levels (e.g. both holding postgraduate credentials).
- **Location proximity**: Points (up to 20) added for matching cities or relocation flexibility.
- **Family outlook**: Points (up to 20) added for matching children desires.

---

## 🧠 AI Usage & Briefing Engine

When a matchmaker clicks **AI Matchmaker Brief** on a match suggestion card:
1. It queries `/api/generate-match-analysis` with the client and candidate IDs.
2. If `OPENAI_API_KEY` is present, it issues a structured prompt returning a JSON payload parsing:
   - **Compatibility Summary**: A 2-3 sentence counselor summary.
   - **Relationship Potential**: Detailed evaluation of core habits.
   - **Personalized Introduction**: A custom email pitch introducing them to each other.
3. If no key is set or the API rate-limits, it activates the **Local Mock Analyzer** that parses client hobbies, careers, and cities to generate rich briefings dynamically.
4. Generated briefs are cached in-memory using a file-level map matching `${clientId}_${candidateId}` to prevent redundant API queries.

---

## 📝 Key Design Assumptions

1. **Local State Synchronization**: Updates to client status (e.g. Active, Paused, Matched) or newly submitted internal notes are saved in React memory state. They remain persistent during your session but reset upon browser reload, keeping the app database-ready.
2. **Unified Height/Income Parsing**: Metric/imperial height strings (`5'11"`, `170 cm`) and income strings (`$120,000 / year`) are parsed programmatically to ensure sorting calculations are accurate.
3. **Accessibility (A11y)**: Focus rings are customized for keyboard navigation. HTML forms, inputs, and button selectors are configured with semantic labels, unique IDs, and `aria-label` tags for screen readers.

---

## ☁️ Vercel Deployment Instructions

Follow these steps to deploy your dashboard directly to Vercel:

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "feat: complete Date Crew Matchmaker CRM"
   ```
2. **Push to GitHub / GitLab / Bitbucket**:
   - Create a repository on your Git hosting provider.
   - Link the remote and push your branch.
3. **Import to Vercel**:
   - Log in to your Vercel account and click **Add New** > **Project**.
   - Import your git repository.
4. **Configure Environment Variables**:
   - In Vercel's project dashboard setup, locate the **Environment Variables** section.
   - Add `OPENAI_API_KEY` and input your OpenAI developer key.
5. **Deploy**:
   - Vercel automatically detects Next.js configurations. Click **Deploy**.
   - Vercel builds the pages, tests typescript compliance, and deploys it to a production URL.
