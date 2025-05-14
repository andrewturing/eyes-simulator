import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // This route is for debugging purposes only and should be removed in production
  
  const authToken = request.cookies.get('auth-token')?.value;
  const tokenPayload = authToken ? verifyToken(authToken) : null;
  
  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET ? 'Set (first 4 chars: ' + process.env.JWT_SECRET.substring(0, 4) + ')' : 'Not set',
      mongodbHost: process.env.MONGODB_HOST ? 'Set' : 'Not set',
      mongodbDatabase: process.env.MONGODB_DATABASE || 'Not set',
    },
    authentication: {
      cookieExists: !!authToken,
      tokenValid: !!tokenPayload,
      userId: tokenPayload?.userId || null,
      email: tokenPayload?.email || null,
    },
    cookies: request.cookies.getAll().map(c => c.name)
  });
} 