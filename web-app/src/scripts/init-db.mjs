/**
 * Database initialization script
 * Run this script once to set up the initial MongoDB collections and indexes
 * 
 * Usage: node src/scripts/init-db.mjs
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envConfig = readFileSync(envPath, 'utf8');
  const env = dotenv.parse(envConfig);
  
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
} catch (error) {
  console.error('Error loading .env.local file:', error);
}

// Check if environment variables are defined
if (!process.env.MONGODB_HOST || 
    !process.env.MONGODB_PORT || 
    !process.env.MONGODB_DATABASE || 
    !process.env.MONGODB_USER || 
    !process.env.MONGODB_PASSWORD) {
  console.error('MongoDB environment variables are not defined. Please check .env.local file.');
  process.exit(1);
}

// MongoDB connection string
const uri = `mongodb://${process.env.MONGODB_USER}:${encodeURIComponent(process.env.MONGODB_PASSWORD)}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin`;

async function initDb() {
  console.log('Starting database initialization...');
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database
    const db = client.db(process.env.MONGODB_DATABASE);
    
    // Create users collection if it doesn't exist
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      console.log('Creating users collection...');
      await db.createCollection('users');
    } else {
      console.log('Users collection already exists');
    }

    // Create indexes
    console.log('Creating indexes on users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Created unique index on email field');

    // Create simulation data collection
    if (!(await db.listCollections({ name: 'simulations' }).toArray()).length) {
      console.log('Creating simulations collection...');
      await db.createCollection('simulations');
      await db.collection('simulations').createIndex({ userId: 1 });
      console.log('Created index on userId field in simulations collection');
    } else {
      console.log('Simulations collection already exists');
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await client.close();
    console.log('Closed MongoDB connection');
  }
}

// Run the initialization
initDb().catch(console.error); 