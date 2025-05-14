import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/serverDb';
import { verifyAuth } from '@/utils/auth';

// GET /api/configurations - Get all configurations for current user
export async function GET() {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;

    const configurations = await db.collection('configurations')
      .find({ userId })
      .project({ name: 1, createdAt: 1, updatedAt: 1, _id: 1 })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ configurations });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 });
  }
}

// POST /api/configurations - Save a new configuration
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;
    const { name, configuration } = await req.json();

    if (!name || !configuration) {
      return NextResponse.json({ error: 'Configuration name and data are required' }, { status: 400 });
    }

    // Validate configuration name
    if (!/^[a-zA-Z0-9 _-]{3,50}$/.test(name)) {
      return NextResponse.json({ 
        error: 'Invalid configuration name. Use 3-50 alphanumeric characters, spaces, hyphens, or underscores.' 
      }, { status: 400 });
    }

    // Check if configuration with this name already exists for this user
    const existingConfig = await db.collection('configurations').findOne({ 
      userId, 
      name 
    });

    if (existingConfig) {
      // Update existing configuration
      await db.collection('configurations').updateOne(
        { _id: existingConfig._id },
        { 
          $set: { 
            configuration,
            updatedAt: new Date()
          } 
        }
      );
      return NextResponse.json({ 
        message: 'Configuration updated successfully',
        id: existingConfig._id
      });
    } else {
      // Create new configuration
      const result = await db.collection('configurations').insertOne({
        userId,
        name,
        configuration,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return NextResponse.json({ 
        message: 'Configuration saved successfully',
        id: result.insertedId
      });
    }
  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
} 