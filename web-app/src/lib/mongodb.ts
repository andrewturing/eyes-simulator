import { MongoClient } from 'mongodb';

// Use default values if environment variables are not defined
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'EyesSimulator';
const MONGODB_USER = process.env.MONGODB_USER || '';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || '';

// Construct MongoDB URI
let uri: string;

if (!MONGODB_USER || !MONGODB_PASSWORD) {
  // Connect without authentication if username or password is not provided
  uri = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
  console.log('Using MongoDB connection without authentication');
} else {
  // Connect with authentication
  uri = `mongodb://${MONGODB_USER}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;
  console.log('Using MongoDB connection with authentication');
}

console.log(`Connecting to MongoDB at ${MONGODB_HOST}:${MONGODB_PORT}`);

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error('MongoDB connection error:', err);
      throw err;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch(err => {
    console.error('MongoDB connection error:', err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 