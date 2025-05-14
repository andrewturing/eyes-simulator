import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/serverDb';

export async function GET() {
  try {
    console.log('Checking database setup...');
    const { db } = await connectToDatabase();

    // Check if required collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['configurations', 'users'];
    const missingCollections = requiredCollections.filter(name => !collectionNames.includes(name));
    
    // Create missing collections if any
    for (const collectionName of missingCollections) {
      console.log(`Creating collection: ${collectionName}`);
      await db.createCollection(collectionName);
      
      // Create indexes if needed
      if (collectionName === 'configurations') {
        console.log('Creating indexes for configurations collection');
        await db.collection('configurations').createIndex({ userId: 1 });
        await db.collection('configurations').createIndex({ name: 1, userId: 1 }, { unique: true });
      }
      
      if (collectionName === 'users') {
        console.log('Creating indexes for users collection');
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
      }
    }
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection counts with proper typing
    const collectionCounts: Record<string, number> = {};
    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        collectionCounts[collectionName] = await db.collection(collectionName).countDocuments();
      } else {
        collectionCounts[collectionName] = 0;
      }
    }
    
    return NextResponse.json({
      status: 'success',
      message: missingCollections.length > 0 
        ? `Created ${missingCollections.length} missing collections` 
        : 'All required collections exist',
      database: {
        name: db.databaseName,
        collections: collectionNames,
        stats: dbStats,
        counts: collectionCounts
      }
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to set up database',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 