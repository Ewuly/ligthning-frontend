'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AddExpenseForm from '@/components/AddExpenseForm';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  _id: string;
  amount: number;
  description: string;
  paidBy: string;
  splitBetween: string[];
  createdAt: string;
}

interface PaymentRequest {
  _id: string;
  from: string;
  to: string;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  members: string[];
  createdAt: string;
  expenses: Expense[];
  paymentRequests: PaymentRequest[];
}

interface Balance {
  user: string;
  amount: number;
  pendingRequests: PaymentRequest[];
}

export default function GroupDetails() {
  const params = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [balances, setBalances] = useState<Balance[]>([]);
  const router = useRouter();
  const [requestedPayments, setRequestedPayments] = useState<Set<string>>(new Set());

  const calculateBalances = (data: Group) => {
    const balanceMap: { [key: string]: number } = {};
    const pendingRequests = data.paymentRequests?.filter(req => req.status === 'pending') || [];
    
    // Initialize balances
    data.members.forEach((member: string) => {
      balanceMap[member] = 0;
    });

    // Add null check for expenses
    if (data.expenses) {
      data.expenses.forEach((expense: Expense) => {
        const splitAmount = expense.amount / expense.splitBetween.length;
        balanceMap[expense.paidBy] += expense.amount;
        expense.splitBetween.forEach(member => {
          balanceMap[member] -= splitAmount;
        });
      });
    }

    return Object.entries(balanceMap).map(([user, amount]) => ({
      user,
      amount,
      pendingRequests: pendingRequests.filter(
        req => (req.from === user || req.to === user)
      )
    }));
  };

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch group');
      const data = await response.json();
      
      // Add null check before setting group and calculating balances
      if (data) {
        setGroup(data);
        const calculatedBalances = calculateBalances(data);
        setBalances(calculatedBalances);

        // Initialize requestedPayments with null check
        const existingRequests = new Set(
          data.paymentRequests
            ?.filter(req => req.status === 'pending' && req.from === user?.username)
            ?.map(req => req.to) || []
        );
        setRequestedPayments(existingRequests);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadGroupData();
  }, [user, params.id, router]);

  const handleExpenseAdded = async () => {
    setShowAddExpense(false);
    await loadGroupData();
  };

  const handleRequestPayment = async (amount: number, to: string) => {
    try {
      setRequestedPayments(prev => new Set([...prev, to]));

      const response = await fetch(`/api/groups/${params.id}/payment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: user?.username,
          to,
          amount,
        }),
      });

      if (!response.ok) {
        setRequestedPayments(prev => {
          const newSet = new Set(prev);
          newSet.delete(to);
          return newSet;
        });
        throw new Error('Failed to create payment request');
      }
      await loadGroupData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create payment request');
    }
  };

  const handlePay = async (requestId: string) => {
    try {
      // TODO: Implement Lightning Network payment
      alert('Lightning payment will be implemented here');
      
      const response = await fetch(`/api/groups/${params.id}/payment-requests/${requestId}/pay`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to process payment');
      await loadGroupData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process payment');
    }
  };

  const handleDirectPay = async (amount: number, to: string) => {
    try {
      // TODO: Implement Lightning Network payment
      alert(`Lightning payment of ${amount} sats will be sent to ${to}`);
      
      const response = await fetch(`/api/groups/${params.id}/payment-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: to,
          to: user?.username,
          amount,
          status: 'paid',
        }),
      });

      if (!response.ok) throw new Error('Failed to process payment');
      await loadGroupData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process payment');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!group) return <div className="text-center py-12">Group not found</div>;
  if (!balances.length) return <div className="text-center py-12">Loading balances...</div>;

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Balances</h3>
        <div className="space-y-4">
          {balances.map((balance) => (
            <div
              key={balance.user}
              className={`flex justify-between items-center p-3 rounded-lg ${
                user?.username === balance.user ? 'bg-blue-50 border border-blue-100' : ''
              }`}
            >
              <div>
                <p className="font-semibold">{balance.user}</p>
                <p className={`text-sm ${
                  balance.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {balance.amount > 0 ? 'To receive' : 'To pay'}: {Math.abs(balance.amount)} sats
                </p>
                {balance.pendingRequests
                  .filter(req => req.status === 'pending')
                  .map(request => (
                    <p key={request._id} className="text-sm text-orange-600">
                      {request.to === balance.user
                        ? `Payment request from ${request.from}: ${request.amount} sats`
                        : request.from === balance.user
                        ? `Payment requested by ${request.to}: ${request.amount} sats`
                        : null
                      }
                    </p>
                  ))}
              </div>
              <div className="space-x-2">
                {user?.username !== balance.user && balance.amount < 0 && (
                  <button
                    onClick={() => handleRequestPayment(Math.abs(balance.amount), balance.user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Request Payment
                  </button>
                )}
                {user?.username === balance.user && balance.amount < 0 && (
                  balance.pendingRequests
                    .filter(req => req.to === user.username && req.status === 'pending')
                    .map(request => (
                      <button
                        key={request._id}
                        onClick={() => handlePay(request._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Pay {request.amount} sats
                      </button>
                    ))
                )}
                {balance.pendingRequests
                  .filter(req => req.from === user?.username && req.status === 'pending')
                  .map(request => (
                    <span key={request._id} className="text-orange-600 text-sm">
                      Payment requested
                    </span>
                  ))
                }
              </div>
            </div>
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