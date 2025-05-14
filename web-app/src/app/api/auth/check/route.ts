import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Print all cookies for debugging
  const cookies = request.cookies.getAll();
  console.log('Cookies in auth check:', cookies.map(c => `${c.name}=${c.value?.substring(0, 10)}...`));
  
  // Check for auth-token cookie specifically
  const authToken = request.cookies.get('auth-token')?.value;
  
  if (authToken) {
    // Verify token validity
    const payload = verifyToken(authToken);
    
    return NextResponse.json({
      authenticated: !!payload,
      tokenExists: true,
      tokenPrefix: authToken.substring(0, 10) + '...',
      userId: payload?.userId,
    });
  }
  
  return NextResponse.json({
    authenticated: false,
    tokenExists: false,
    allCookies: cookies.map(c => c.name),
  });
} 