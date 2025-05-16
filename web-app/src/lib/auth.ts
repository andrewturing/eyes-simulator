import { sign, verify } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

const TOKEN_NAME = 'auth-token';
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export function createToken(payload: TokenPayload): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  try {
    return verify(token, process.env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// For API routes - set cookie on response
export function setAuthCookieOnResponse(res: NextResponse, token: string): NextResponse {
  res.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: false, // Set to false to work in Docker environments
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY,
    path: '/',
    domain: undefined // Ensure no domain restriction
  });
  return res;
}

// For API routes - clear cookie on response
export function clearAuthCookieOnResponse(res: NextResponse): NextResponse {
  res.cookies.delete(TOKEN_NAME);
  return res;
}

// Get auth token from middleware request
export function getTokenFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  return token || null;
}

// This should only be used in middleware
export function getCurrentUser(req: NextRequest): TokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
} 