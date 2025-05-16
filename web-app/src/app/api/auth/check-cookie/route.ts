import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Print all cookies for debugging
  const allCookies = request.cookies.getAll();
  
  // Get the auth token specifically
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Create response
  const response = NextResponse.json({
    timestamp: new Date().toISOString(),
    authCookieExists: !!authToken,
    cookieNames: allCookies.map(c => c.name),
    authTokenPrefix: authToken ? authToken.substring(0, 10) + '...' : null,
    cookieCount: allCookies.length,
    userAgent: request.headers.get('user-agent'),
    host: request.headers.get('host'),
    dockerEnv: true,
  });
  
  return response;
} 