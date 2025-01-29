import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectDB();
    
    const group = await Group.findByIdAndUpdate(
      params.id,
      { 
        $push: { 
          expenses: {
            ...body,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error adding expense:', error);
    return NextResponse.json(
      { error: 'Error adding expense' },
      { status: 500 }
    );
  }
} 