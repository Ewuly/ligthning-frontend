'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface GroupStats {
  groupId: string;
  groupName: string;
  totalExpenses: number;
  personalExpenses: number;
  averageExpense: number;
  highestExpense: {
    amount: number;
    description: string;
    date: string;
  };
  mostFrequentPayer: {
    username: string;
    count: number;
  };
  expensesByMonth: {
    month: string;
    amount: number;
  }[];
}

export default function Statistics() {
  const [stats, setStats] = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/statistics?username=${user?.username}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <Link
          href="/"
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Menu
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {stats.map((groupStats) => (
          <div key={groupStats.groupId} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">{groupStats.groupName}</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-xl font-semibold">{groupStats.totalExpenses} sats</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Your Expenses</p>
                  <p className="text-xl font-semibold">{groupStats.personalExpenses} sats</p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Average Expense</p>
                  <p className="text-xl font-semibold">{groupStats.averageExpense} sats</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Most Active Payer</p>
                  <p className="text-xl font-semibold">{groupStats.mostFrequentPayer.username}</p>
                  <p className="text-sm text-gray-500">({groupStats.mostFrequentPayer.count} payments)</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Highest Expense</h4>
                <p className="text-lg font-semibold">{groupStats.highestExpense.amount} sats</p>
                <p className="text-sm text-gray-600">{groupStats.highestExpense.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(groupStats.highestExpense.date).toLocaleDateString()}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Monthly Expenses</h4>
                <div className="space-y-2">
                  {groupStats.expensesByMonth.map((month, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{month.month}</span>
                      <span className="font-semibold">{month.amount} sats</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {stats.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500 md:col-span-2">
            No statistics available
          </div>
        )}
      </div>
    </div>
  );
} 