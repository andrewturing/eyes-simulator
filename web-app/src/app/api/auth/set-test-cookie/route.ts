import { NextResponse } from 'next/server';

export async function GET() {
  // Create response
  const response = NextResponse.json({
    success: true,
    message: 'Test cookie has been set',
  });
  
  // Set a test cookie
  response.cookies.set({
    name: 'test-cookie',
    value: 'test-value-' + new Date().toISOString(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });
  
  return response;
} 