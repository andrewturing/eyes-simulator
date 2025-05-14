import { MongoClient, Db } from 'mongodb';

// Construct MongoDB URI from individual parameters if available
let MONGODB_URI: string = process.env.MONGODB_URI || '';

if (!MONGODB_URI && process.env.MONGODB_HOST) {
  const username = encodeURIComponent(process.env.MONGODB_USER || '');
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD || '');
  const host = process.env.MONGODB_HOST;
  const port = process.env.MONGODB_PORT || '27017';
  const authPart = username && password ? `${username}:${password}@` : '';
  
  MONGODB_URI = `mongodb://${authPart}${host}:${port}`;
  console.log(`Created MongoDB URI from parameters: ${MONGODB_URI}`);
}

// Default to localhost if no configured URI
MONGODB_URI = MONGODB_URI || 'mongodb://localhost:27017';

const MONGODB_DB = process.env.MONGODB_DATABASE || process.env.MONGODB_DB || 'eye-simulator';

// Cached connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Log connection attempt
  console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
  
  try {
    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(MONGODB_DB);
    
    // Cache the connection
    cachedClient = client;
    cachedDb = db;
    
    console.log(`Successfully connected to MongoDB database: ${MONGODB_DB}`);
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
} 