import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { pool } from './db';
import { createUser, findUserByEmail, generateVerificationToken, hashToken, createEmailVerification, verifyPassword } from './auth';

const app = express();
app.use(cors()); // allow requests from any origin in development (adjust for production)
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('JWT_SECRET not set - generate one and put in .env');
}

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    // check existing
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await createUser(name, email.toLowerCase(), password);

    // create verification token and persist hashed form
    const rawToken = generateVerificationToken();
    await createEmailVerification(user.id, rawToken);

    // TODO: send email with verification link (ex: https://your-app/verify?token=rawToken)
    // For now return message and token for dev (remove token in production)
    return res.json({ ok: true, message: 'Registered. Check your email for verification link (DEV token included).', token: rawToken });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Verify endpoint (user clicks link from email)
app.get('/auth/verify', async (req, res) => {
  const rawToken = req.query.token as string;
  if (!rawToken) return res.status(400).send('Missing token');

  try {
    const tokenHash = hashToken(rawToken);
    const result = await pool.query(`SELECT id, user_id, token_expires, used FROM auth.email_verifications WHERE token = $1 LIMIT 1`, [tokenHash]);
    const row = result.rows[0];
    if (!row) return res.status(400).send('Invalid token');

    if (row.used) return res.status(400).send('Token already used');
    const expiresAt = new Date(row.token_expires);
    if (expiresAt < new Date()) return res.status(400).send('Token expired');

    // mark email verified for user
    await pool.query('UPDATE auth.users SET email_verified = true WHERE id = $1', [row.user_id]);
    await pool.query('UPDATE auth.email_verifications SET used = true WHERE id = $1', [row.id]);

    return res.send('Email verified. You can now login.');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const userRow = await findUserByEmail(email);
    if (!userRow) return res.status(401).json({ message: 'Invalid credentials' });

    // check password
    const ok = await verifyPassword(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (!userRow.email_verified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    // create JWT (short lived)
    const token = jwt.sign({ userId: userRow.id, email: userRow.email }, JWT_SECRET || 'temp-secret', {
      expiresIn: '2h',
    });

    // update last_login
    await pool.query('UPDATE auth.users SET last_login = now() WHERE id = $1', [userRow.id]);

    return res.json({ token, user: { id: userRow.id, name: userRow.name, email: userRow.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});