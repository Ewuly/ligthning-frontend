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

    const stats = groups.map(group => {
      return calculateGroupStats(group, username!);
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Error fetching statistics' }, { status: 500 });
  }
}

function calculateGroupStats(group: any, username: string) {
  const totalExpenses = group.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  const personalExpenses = group.expenses
    .filter((exp: any) => exp.paidBy === username)
    .reduce((sum: number, exp: any) => sum + exp.amount, 0);

  const payerCounts: { [key: string]: number } = {};
  group.expenses.forEach((exp: any) => {
    payerCounts[exp.paidBy] = (payerCounts[exp.paidBy] || 0) + 1;
  });

  const mostFrequentPayer = Object.entries(payerCounts)
    .reduce((max, [username, count]) => 
      count > (max.count || 0) ? { username, count } : max,
      { username: '', count: 0 }
    );

  const expensesByMonth: { [key: string]: number } = {};
  group.expenses.forEach((exp: any) => {
    const date = new Date(exp.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    expensesByMonth[monthKey] = (expensesByMonth[monthKey] || 0) + exp.amount;
  });

  return {
    groupId: group._id,
    groupName: group.name,
    totalExpenses,
    personalExpenses,
    averageExpense: group.expenses.length ? Math.round(totalExpenses / group.expenses.length) : 0,
    highestExpense: group.expenses.reduce(
      (max: any, exp: any) => exp.amount > (max.amount || 0)
        ? { amount: exp.amount, description: exp.description, date: exp.createdAt }
        : max,
      {}
    ),
    mostFrequentPayer,
    expensesByMonth: Object.entries(expensesByMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.month.localeCompare(a.month))
  };
} 