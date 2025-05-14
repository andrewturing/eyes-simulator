import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function verifyAuth(): Promise<AuthResult> {
  try {
    // For API routes, get cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    if (!decoded || !decoded.userId) {
      return { success: false, error: 'Invalid token' };
    }
    
    return { success: true, userId: decoded.userId };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication error' 
    };
  }
} 