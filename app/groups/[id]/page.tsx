'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AddExpenseForm from '@/components/AddExpenseForm';

interface Expense {
  _id: string;
  amount: number;
  description: string;
  paidBy: string;
  splitBetween: string[];
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  members: string[];
  createdAt: string;
  expenses: Expense[];
}

export default function GroupDetails() {
  const params = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroup();
  }, [params.id]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = async () => {
    setShowAddExpense(false);
    await fetchGroup();
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!group) return <div className="text-center py-12">Group not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{group.name}</h2>
        <div className="space-x-4">
          <Link
            href="/groups"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Groups
          </Link>
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-3">Group Members</h3>
        <div className="flex flex-wrap gap-2">
          {group.members.map((member) => (
            <span
              key={member}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
            >
              {member}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Expenses</h3>
        <div className="space-y-4">
          {group.expenses.map((expense) => (
            <div
              key={expense._id}
              className="border-b pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{expense.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by: {expense.paidBy}
                  </p>
                  <p className="text-sm text-gray-500">
                    Split between: {expense.splitBetween.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {expense.amount} sats
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {group.expenses.length === 0 && (
            <p className="text-gray-500 text-center">No expenses yet</p>
          )}
        </div>
      </div>

      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <AddExpenseForm
              groupId={group._id}
              members={group.members}
              onSuccess={handleExpenseAdded}
              onCancel={() => setShowAddExpense(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 