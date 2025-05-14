import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

// Routes that don't require authentication
const publicRoutes = ['/', 
                       '/login', 
                       '/register', 
                       '/api/auth/login', 
                       '/api/auth/register', 
                       '/auth-test',
                       '/cookie-test',
                       '/api/debug',
                       '/simulator',
                       '/api/auth/set-test-cookie'];

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname;
  
  // Log current path and check cookies
  console.log(`⭐ Middleware checking path: ${currentPath}`);
  const allCookies = request.cookies.getAll();
  console.log(`🍪 Cookies (${allCookies.length}):`, allCookies.map(c => `${c.name}=${c.value?.substring(0, 5)}...`));
  
  // Always allow access to API routes
  if (currentPath.startsWith('/api/')) {
    console.log('👍 API route - allowing access');
    return NextResponse.next();
  }

  // Allow access to assets and Next.js files
  if (currentPath.startsWith('/_next') || 
      currentPath.startsWith('/images') || 
      currentPath === '/favicon.ico') {
    return NextResponse.next();
  }

  // Allow access to public routes
  if (publicRoutes.includes(currentPath)) {
    console.log(`👍 Public route - allowing access to ${currentPath}`);
    return NextResponse.next();
  }
  
  // Check for authentication token directly
  const authToken = request.cookies.get('auth-token')?.value;
  
  if (!authToken) {
    console.log('🔒 No auth token - redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(url);
  }
  
  // Verify token
  try {
    const payload = authToken ? verifyToken(authToken) : null;
    
    if (!payload) {
      console.log('🔒 Invalid token - redirecting to login');
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', currentPath);
      return NextResponse.redirect(url);
    }
    
    console.log(`✅ Valid token - allowing access for ${currentPath}`);
    console.log(`👤 User: ${payload.userId} (${payload.email})`);
    return NextResponse.next();
  } catch (error) {
    console.error('🔒 Token verification error:', error);
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', currentPath);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 