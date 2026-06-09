import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb, query } from './db/connection';
import { createSchema } from './db/schema';
import { seed } from './db/seeder';

// Routes
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import matchRoutes from './routes/matches';
import noteRoutes from './routes/notes';
import activityRoutes from './routes/activities';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Next.js server (local or deployed Vercel)
app.use(cors({
  origin: '*', // For development flexibility. Can narrow down in production.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Register routes under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/activities', activityRoutes);

async function startServer() {
  try {
    // 1. Initialize Database Adapter
    await initDb();

    // 2. Setup Tables
    await createSchema();

    // 3. Auto-seed if the database is brand new (no users exist)
    const userCheck = await query('SELECT COUNT(*) as count FROM users');
    const userCount = Number(userCheck.rows[0]?.count || 0);
    
    if (userCount === 0) {
      console.log('Database appears empty. Running auto-seeder...');
      await seed();
    } else {
      console.log(`Database already contains ${userCount} users. Skipping auto-seeding.`);
    }

    // 4. Listen
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Matchmaker Backend Server started on port ${PORT}`);
      console.log(` API URL: http://localhost:${PORT}/api/v1`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
