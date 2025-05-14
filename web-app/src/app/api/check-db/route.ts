import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/utils/serverDb';

export async function GET() {
  // Check MongoDB connection
  let dbStatus = 'unknown';
  let dbError = null;
  let dbInfo = null;
  
  try {
    const { db } = await connectToDatabase();
    // Check connection with ping command
    await db.command({ ping: 1 });
    dbStatus = 'connected';
    
    // Get database info
    const dbStats = await db.stats();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    dbInfo = {
      name: db.databaseName,
      collections: collectionNames,
      stats: {
        size: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        collections: dbStats.collections,
        indexes: dbStats.indexes
      }
    };
  } catch (error) {
    dbStatus = 'error';
    dbError = error instanceof Error ? error.message : 'Unknown error connecting to database';
  }
  
  // Check auth
  let authStatus = 'unknown';
  let userId = null;
  let authError = null;
  
  try {
    // Get cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      authStatus = 'no_token';
      authError = 'No authentication token found';
    } else {
      // Verify the token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        
        if (!decoded || !decoded.userId) {
          authStatus = 'invalid_token';
          authError = 'Invalid token structure';
        } else {
          authStatus = 'authenticated';
          userId = decoded.userId;
        }
      } catch (jwtError) {
        authStatus = 'invalid_token';
        authError = jwtError instanceof Error ? jwtError.message : 'Error verifying token';
      }
    }
  } catch (error) {
    authStatus = 'error';
    authError = error instanceof Error ? error.message : 'Unknown error checking authentication';
  }
  
  const env = {
    nodeEnv: process.env.NODE_ENV || 'undefined',
    mongoHost: process.env.MONGODB_HOST || 'undefined',
    mongoPort: process.env.MONGODB_PORT || 'undefined',
    mongoDatabase: process.env.MONGODB_DATABASE || process.env.MONGODB_DB || 'undefined',
    mongoUser: process.env.MONGODB_USER ? '[SET]' : 'undefined',
    mongoPassword: process.env.MONGODB_PASSWORD ? '[SET]' : 'undefined',
    mongoUri: process.env.MONGODB_URI ? '[SET]' : 'undefined'
  };
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: dbStatus === 'connected' ? 'success' : 'error',
    message: dbStatus === 'connected' 
      ? `Successfully connected to database ${dbInfo?.name}` 
      : `Failed to connect to database: ${dbError}`,
    database: dbInfo,
    error: dbError,
    authentication: {
      status: authStatus,
      userId,
      error: authError
    },
    environment: env
  });
} 