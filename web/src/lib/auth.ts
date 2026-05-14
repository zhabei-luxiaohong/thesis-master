const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'thesis-master-dev-secret-change-in-production';
const TOKEN_EXPIRY = '7d';
export function hashPassword(password: string): string { return bcrypt.hashSync(password, 10); }
export function verifyPassword(password: string, hash: string): boolean { return bcrypt.compareSync(password, hash); }
export function generateToken(userId: string): string { return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY }); }
export function verifyToken(token: string): { userId: string } | null { try { return jwt.verify(token, JWT_SECRET) as { userId: string }; } catch { return null; } }
export function getUserIdFromRequest(req: Request): string | null { const auth = req.headers.get('authorization'); if (!auth || !auth.startsWith('Bearer ')) return null; const token = auth.slice(7); const payload = verifyToken(token); return payload?.userId || null; }
