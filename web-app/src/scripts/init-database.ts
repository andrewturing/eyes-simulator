/**
 * MongoDB Database Initialization Script
 * 
 * This script initializes the MongoDB database and required collections
 * Run with: npx ts-node src/scripts/init-database.ts
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function initializeDatabase() {
  // Build MongoDB URI
  let MONGODB_URI: string = process.env.MONGODB_URI || '';

  if (!MONGODB_URI && process.env.MONGODB_HOST) {
    const username = encodeURIComponent(process.env.MONGODB_USER || '');
    const password = encodeURIComponent(process.env.MONGODB_PASSWORD || '');
    const host = process.env.MONGODB_HOST;
    const port = process.env.MONGODB_PORT || '27017';
    const authPart = username && password ? `${username}:${password}@` : '';
    
    MONGODB_URI = `mongodb://${authPart}${host}:${port}`;
    console.log(`Using MongoDB URI: ${MONGODB_URI}`);
  }

  // Default to localhost if no configured URI
  MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017';
  
  const MONGODB_DB = process.env.MONGODB_DATABASE || process.env.MONGODB_DB || 'eye-simulator';

  let client: MongoClient | null = null;
  
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    
    const db = client.db(MONGODB_DB);
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const requiredCollections = ['configurations', 'users'];
    
    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
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
      } else {
        console.log(`Collection ${collectionName} already exists`);
      }
    }
    
    console.log('Database initialization completed successfully');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the initialization function
initializeDatabase(); 