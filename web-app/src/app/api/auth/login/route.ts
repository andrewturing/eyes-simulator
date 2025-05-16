import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { UserCollection } from '@/models/User';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body;
    console.log('Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to MongoDB
    let client;
    try {
      client = await clientPromise;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const db = client.db(process.env.MONGODB_DATABASE);
    const users = db.collection(UserCollection);

    // Find user by email
    const user = await users.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare passwords
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
    }

    if (!passwordMatch) {
      console.log('Password does not match for user:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login successful for user:', email);

    // Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    console.log('JWT token created');

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      }
    });

    // Set secure HTTP-only cookie with updated settings
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      // Use secure=false when in Docker to test, or set explicitly based on environment
      secure: false, // process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      // Make sure there's no domain restriction that could cause issues in Docker
      domain: undefined
    });

    console.log('Auth cookie set on response with updated settings');
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
} 