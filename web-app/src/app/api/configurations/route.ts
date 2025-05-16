import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/serverDb';
import { verifyAuth } from '@/utils/auth';

// GET /api/configurations - Get all configurations
export async function GET() {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;

    const configurations = await db
      .collection('configurations')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ configurations });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

// POST /api/configurations - Create a new configuration
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, configuration } = body;

    if (!name || !configuration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;

    const newConfiguration = {
      name,
      configuration,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection('configurations').insertOne(newConfiguration);

    return NextResponse.json({
      message: 'Configuration created successfully',
      configurationId: result.insertedId,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating configuration:', error);
    return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 });
  }
} 