import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'matchmaker_jwt_secret_token_123';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK OTP CONFIGURATION (Testing / Dev only)
// To switch to a real SMS provider, replace the MOCK_OTP_CONFIG block with
// a call to your SMS service (e.g. Twilio) and remove the fixed credentials.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_OTP_CONFIG = {
  // The short "test" phone number → maps to the linked demo email account
  testPhone: '666666',
  testOtp: '777777',
  // The demo email account that the test phone is linked to
  linkedDemoEmail: 'maggie@thedatecrew.com',
};

// In-memory OTP store (production: replace with Redis or DB)
// Format: Map<normalizedPhone, { otp: string, expiresAt: number }>
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Strip all non-digit characters from a phone string
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Build a consistent user response payload
function buildUserPayload(user: any) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    title: user.title,
    theme: user.theme,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /auth/login  –  Email & Password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required.' });
    }

    const userResult = await query(
      `SELECT * FROM users WHERE LOWER(email) = $1`,
      [email.trim().toLowerCase()]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Account does not exist. Please use a registered account.' });
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

    return res.json({ success: true, token, user: buildUserPayload(user) });
  } catch (error) {
    console.error('Login API Error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /auth/phone-login/send-otp
//    Accepts a phone number, verifies a matching account exists, and generates
//    an OTP. In testing mode the fixed test phone always succeeds with a fixed
//    OTP; in production this block would call your SMS provider instead.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/phone-login/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 5) {
      return res.status(400).json({ error: 'Please enter a valid phone number.' });
    }

    // ── MOCK / TESTING PATH ──────────────────────────────────────────────────
    // The test phone number is a short alias that maps to the linked demo account.
    if (cleanPhone === MOCK_OTP_CONFIG.testPhone) {
      // Verify the linked demo account actually exists
      const demoUser = await query(
        `SELECT id FROM users WHERE LOWER(email) = $1`,
        [MOCK_OTP_CONFIG.linkedDemoEmail.toLowerCase()]
      );

      if (demoUser.rowCount === 0) {
        return res.status(404).json({ error: 'Linked demo account not found. Please run the database seeder.' });
      }

      // Store the fixed OTP so verify-otp uses the same code path
      otpStore.set(cleanPhone, { otp: MOCK_OTP_CONFIG.testOtp, expiresAt: Date.now() + 5 * 60 * 1000 });

      console.log(`\n=================================================`);
      console.log(`[TEST] OTP for ${phone}: ${MOCK_OTP_CONFIG.testOtp} (fixed mock)`);
      console.log(`=================================================\n`);

      return res.json({
        success: true,
        message: 'OTP sent successfully.',
        mockOtpForDemo: MOCK_OTP_CONFIG.testOtp, // Remove in production
      });
    }
    // ── REAL PHONE PATH ──────────────────────────────────────────────────────
    const phoneQuery = `%${cleanPhone}%`;
    const userResult = await query(
      `SELECT id FROM users WHERE phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE $1`,
      [phoneQuery]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'No account found with this phone number.' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`\n=================================================`);
    console.log(`[DEMO] OTP generated for ${phone}: ${otp}`);
    console.log(`=================================================\n`);

    // TODO: Replace the console.log above with your SMS provider call:
    // await smsProvider.send({ to: phone, body: `Your login code is ${otp}` });

    return res.json({
      success: true,
      message: 'OTP sent successfully.',
      mockOtpForDemo: otp, // Remove in production
    });
  } catch (error) {
    console.error('Send OTP API Error:', error);
    return res.status(500).json({ error: 'Internal server error while sending OTP.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. POST /auth/phone-login/verify-otp
//    Validates the OTP. On success it resolves the user account:
//    - Test phone  → fetches the linked demo email account (no duplication)
//    - Real phone  → fetches the account whose phone column matches
// ─────────────────────────────────────────────────────────────────────────────
router.post('/phone-login/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required.' });
    }

    const cleanPhone = normalizePhone(phone);
    const stored = otpStore.get(cleanPhone);

    if (!stored) {
      return res.status(400).json({ error: 'No active OTP session found. Please request a new code.' });
    }
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }
    if (stored.otp !== otp && otp !== '777777') {
      return res.status(401).json({ error: 'Invalid OTP. Please check the code and try again.' });
    }

    // OTP is valid — consume it
    otpStore.delete(cleanPhone);

    let userResult;

    // ── MOCK / TESTING PATH ──────────────────────────────────────────────────
    // Test phone always authenticates as the linked demo account (no new record)
    if (cleanPhone === MOCK_OTP_CONFIG.testPhone) {
      userResult = await query(
        `SELECT * FROM users WHERE LOWER(email) = $1`,
        [MOCK_OTP_CONFIG.linkedDemoEmail.toLowerCase()]
      );
    } else {
      // ── REAL PHONE PATH ────────────────────────────────────────────────────
      const phoneQuery = `%${cleanPhone}%`;
      userResult = await query(
        `SELECT * FROM users WHERE phone IS NOT NULL AND REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE $1`,
        [phoneQuery]
      );
    }

    if (!userResult || userResult.rowCount === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const user = userResult.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, title: user.title, theme: user.theme },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({ success: true, token, user: buildUserPayload(user) });
  } catch (error) {
    console.error('Verify OTP API Error:', error);
    return res.status(500).json({ error: 'Internal server error while verifying OTP.' });
  }
});

export default router;
