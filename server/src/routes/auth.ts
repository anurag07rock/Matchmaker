import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'matchmaker_jwt_secret_token_123';

// 1. POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and Password are required.' });
    }

    const queryStr = emailOrPhone.trim().toLowerCase();
    const cleanPhoneVal = emailOrPhone.replace(/\D/g, '');

    // Search by email or phone
    const userResult = await query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR (phone IS NOT NULL AND REPLACE(phone, ' ', '') LIKE $2)`,
      [queryStr, `%${cleanPhoneVal}%`]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Account does not exist. Please register first.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Security password mismatch. Please try again.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, title: user.title, theme: user.theme },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        title: user.title,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// 2. POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, phone, password, name, title, theme } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, Password and Name are required.' });
    }

    // Check if account already exists
    const checkUser = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (checkUser.rowCount > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;

    await query(
      `INSERT INTO users (id, email, phone, password, name, title, theme) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, email.trim().toLowerCase(), phone || null, hashedPassword, name.trim(), title || 'Matchmaking Agent', theme || 'light']
    );

    const token = jwt.sign(
      { id: userId, email, name, title: title || 'Matchmaking Agent', theme: theme || 'light' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        phone,
        name,
        title: title || 'Matchmaking Agent',
        theme: theme || 'light'
      }
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

export default router;
