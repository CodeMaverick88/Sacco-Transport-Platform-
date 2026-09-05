import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { query } from './db';

const SALT_ROUNDS = 12;

export async function findUserByEmail(email: string) {
  const res = await query('SELECT id, name, email, password_hash, email_verified FROM auth.users WHERE email = $1', [email]);
  return res.rows[0] ?? null;
}

export async function createUser(name: string, email: string, plainPassword: string) {
  const pwHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  const res = await query(
    `INSERT INTO auth.users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, email_verified`,
    [name, email, pwHash],
  );
  return res.rows[0];
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export function generateVerificationToken() {
  // Raw token (send this in email); store hashed token in DB
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createEmailVerification(userId: string, rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24h expiry
  await query(
    `INSERT INTO auth.email_verifications (user_id, token, token_expires) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}