import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

export async function GET() {
  try {
    await connectDB();
    const groups = await Group.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(groups || []);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Error fetching groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    const group = await Group.create(body);
    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Error creating group' }, { status: 500 });
  }
} 