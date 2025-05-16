import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/utils/serverDb';
import { verifyAuth } from '@/utils/auth';
import { ObjectId } from 'mongodb';

// Add explicit route segment config to indicate Node.js runtime
export const runtime = 'nodejs';

// GET /api/configurations/[id] - Get a specific configuration
export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid configuration ID' }, { status: 400 });
    }

    const configuration = await db.collection('configurations').findOne({
      _id: new ObjectId(id),
      userId
    });

    if (!configuration) {
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 });
    }

    return NextResponse.json({ configuration });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

// DELETE /api/configurations/[id] - Delete a configuration
export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const userId = authResult.userId;
    const id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid configuration ID' }, { status: 400 });
    }

    const result = await db.collection('configurations').deleteOne({
      _id: new ObjectId(id),
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Configuration not found or not authorized to delete' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return NextResponse.json({ error: 'Failed to delete configuration' }, { status: 500 });
  }
} 