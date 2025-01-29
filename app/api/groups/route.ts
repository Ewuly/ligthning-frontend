import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    await connectDB();
    
    // Find groups where the user is either the owner or a member
    const groups = await Group.find({
      $or: [
        { owner: username },
        { members: username }
      ]
    }).sort({ createdAt: -1 }).lean();
    
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
    
    // Add the owner to members if not already included
    if (!body.members.includes(body.owner)) {
      body.members.push(body.owner);
    }
    
    const group = await Group.create(body);
    return NextResponse.json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Error creating group' }, { status: 500 });
  }
} 