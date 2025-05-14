import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { UserCollection } from '@/models/User';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Connect to MongoDB to get the latest user data
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DATABASE);
    const users = db.collection(UserCollection);
    
    // Find user by ID
    const dbUser = await users.findOne({ _id: new ObjectId(user.userId) });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return user without password
    const userWithoutPassword = {
      _id: dbUser._id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt
    };
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'An error occurred while fetching user data' }, { status: 500 });
  }
} 