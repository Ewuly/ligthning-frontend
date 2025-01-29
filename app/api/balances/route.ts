import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Group from '@/models/Group';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    await connectDB();
    
    const groups = await Group.find({
      members: username
    }).lean();

    const balances = groups.map(group => {
      const userBalances = calculateBalances(group, username!);
      return {
        group: {
          _id: group._id,
          name: group.name
        },
        ...userBalances
      };
    });

    return NextResponse.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    return NextResponse.json({ error: 'Error fetching balances' }, { status: 500 });
  }
}

function calculateBalances(group: any, username: string) {
  const balances: { [key: string]: number } = {};
  let totalBalance = 0;
  const toReceive: { from: string; amount: number }[] = [];
  const toPay: { to: string; amount: number }[] = [];

  // Initialize balances
  group.members.forEach((member: string) => {
    balances[member] = 0;
  });

  // Calculate all balances
  group.expenses.forEach((expense: any) => {
    const splitAmount = expense.amount / expense.splitBetween.length;
    balances[expense.paidBy] += expense.amount;
    expense.splitBetween.forEach((member: string) => {
      balances[member] -= splitAmount;
    });
  });

  // Calculate user's total balance
  totalBalance = balances[username];

  // Calculate who owes what to whom
  Object.entries(balances).forEach(([member, balance]) => {
    if (member !== username) {
      if (balance < 0 && balances[username] > 0) {
        toReceive.push({
          from: member,
          amount: Math.min(Math.abs(balance), balances[username])
        });
      } else if (balance > 0 && balances[username] < 0) {
        toPay.push({
          to: member,
          amount: Math.min(balance, Math.abs(balances[username]))
        });
      }
    }
  });

  return {
    amount: totalBalance,
    toReceive,
    toPay
  };
} 