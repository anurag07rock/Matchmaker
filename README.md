# The Date Crew - Matchmaker CRM Fullstack Application

A production-ready CRM and matchmaking dashboard designed for professional matchmakers. This application manages client portfolios, calculates algorithmic compatibility, integrates AI for personalized match introductions, and runs on a robust Node.js/Express backend with a PostgreSQL database.

---

## 🚀 Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 App Router (React 19)
- **Styling**: Tailwind CSS v4 (dark-theme glassmorphism)
- **Deployment**: Vercel

### Backend
- **Framework**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via `pg`) with fallback to local SQLite for development
- **Authentication**: JWT & bcryptjs
- **Deployment**: Render

### AI Engine
- **Provider**: OpenAI API (`gpt-4o-mini`)
- **Features**: Generates Match Compatibility Summaries, Long-Term Potential Analyses, and Personalized Introduction Emails.

---

## 🛠️ Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- (Optional) A local PostgreSQL database

### 1. Database & Backend Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Configure Environment Variables (`server/.env`):
```env
# Optional: If not provided, the server falls back to local SQLite
DATABASE_URL=your_postgresql_connection_string

# Required: Secret for JWT signing
JWT_SECRET=your_super_secret_jwt_key

# Optional: Server Port (default 5000)
PORT=5000
```

Start the backend (this will automatically seed 100+ profiles if the DB is empty):
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal in the root directory:
```bash
npm install
```

Configure Environment Variables (`.env.local`):
```env
# Point to your local backend server
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Required for AI Match Generation
OPENAI_API_KEY=your_openai_api_key
```

Start the frontend:
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🔑 Sample Login Credentials

Use the following seeded credentials to access the matchmaking dashboard:

- **Email**: `maggie@thedatecrew.com`
- **Password**: `password123`

---

## 📡 API Endpoints

The backend provides a comprehensive RESTful API under `/api/v1`:

### Auth
- `POST /auth/login` - Authenticate and receive a JWT token.
- `POST /auth/register` - Create a new matchmaker account.

### Customers
- `GET /customers` - Retrieve all customers and their associated notes.
- `GET /customers/:id` - Retrieve a specific customer profile.
- `POST /customers` - Onboard a new customer.
- `PATCH /customers/:id` - Update customer details.

### Matches
- `GET /matches/:customerId` - Retrieve match history for a specific customer.
- `POST /matches/propose` - Propose a new match between two customers.
- `POST /matches/send` - Send a match recommendation (updates status to 'approved' and logs the activity).
- `PATCH /matches/:id` - Update the status of a specific match pairing.
- `DELETE /matches/:id` - Delete a match pairing.

### Notes
- `GET /notes/:customerId` - Retrieve matchmaker notes for a customer.
- `POST /notes` - Add a new note (logs an activity event).
- `PUT /notes/:id` - Edit a note.
- `DELETE /notes/:id` - Delete a note.

---

## 🧮 Matching Engine Logic

Matches are calculated programmatically inside `src/services/matching/matcher.ts`, returning a compatibility score out of **100**.

### Hard Filters
- **Gender Preferences**: Must align with both candidates' preferences.
- **Dealbreakers**: Disqualifies candidates matching a client's non-negotiables (e.g., smoker, no pets).

### Male Client Scoring
- Prefers younger women (25 points).
- Prefers candidate to be shorter (25 points).
- Prefers candidate to have a lower income (25 points).
- Aligned family planning / child preference (25 points).

### Female Client Scoring
- **Profession compatibility** (15 points): High score for identical or complementary fields (e.g., tech/tech).
- **Values alignment** (15 points): Assesses religious background and shared interests.
- **Education alignment** (15 points): Assesses if both share similar degree tiers (e.g., postgraduate).
- **Relocation compatibility** (15 points): Checks city alignment and openness to relocation.
- **Family outlook** (15 points): Evaluates matching desires for having children.
- **Languages** (10 points): Overlap in spoken languages.
- **Lifestyle** (15 points): Alignment in diet, smoking, and drinking habits.

---

## 🧠 AI Integration

The platform includes a mandatory AI feature utilizing OpenAI's `gpt-4o-mini` model.

When viewing a match recommendation, clicking **AI Matchmaker Brief** triggers a call to `/api/generate-match-analysis`.
The AI generates:
1. **Summary**: A professional overview of why the two clients match.
2. **Potential Analysis**: Deep dive into long-term potential, values, and lifestyle alignment.
3. **Introduction**: A personalized email draft from the matchmaker introducing the pair.

*Note: The platform includes a seamless fallback generator. If the OpenAI API key is missing or the request fails, the system immediately generates a realistic mock brief without crashing.*

---

## ☁️ Deployment Instructions

### 1. Backend (Render)
The repository includes a `render.yaml` Blueprint for automated backend deployment.
1. Create a free PostgreSQL database on Supabase or Render.
2. In the Render Dashboard, click **New > Blueprint**.
3. Connect your Git repository.
4. Render will automatically detect the `render.yaml` file and provision a Node.js Web Service.
5. In the Render Dashboard, set the `DATABASE_URL` environment variable to your PostgreSQL connection string.

### 2. Frontend (Vercel)
1. In the Vercel Dashboard, click **Add New > Project**.
2. Import your Git repository.
3. In the Environment Variables section, add:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g., `https://matchmaker-api.onrender.com/api/v1`).
   - `OPENAI_API_KEY`: Your OpenAI key.
4. Click **Deploy**. Vercel will automatically build the Next.js frontend and deploy it.
