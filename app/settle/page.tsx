'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Balance {
  group: {
    _id: string;
    name: string;
  };
  amount: number;
  toReceive: {
    from: string;
    amount: number;
  }[];
  toPay: {
    to: string;
    amount: number;
  }[];
}

export default function SettleBalance() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchBalances();
    }
  }, [user]);

  const fetchBalances = async () => {
    try {
      const response = await fetch(`/api/balances?username=${user?.username}`);
      if (!response.ok) throw new Error('Failed to fetch balances');
      const data = await response.json();
      setBalances(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (amount: number, to: string) => {
    // TODO: Implement Lightning Network payment
    alert(`Payment of ${amount} sats will be sent to ${to}`);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Settle Balances</h2>
        <Link
          href="/"
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Menu
        </Link>
      </div>

      <div className="space-y-6">
        {balances.map((balance) => (
          <div key={balance.group._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {balance.group.name}
            </h3>
            
            <div className="mb-4">
              <p className={`text-lg font-semibold ${
                balance.amount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                Overall Balance: {balance.amount} sats
              </p>
            </div>

            {balance.toReceive.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">To Receive:</h4>
                <div className="space-y-2">
                  {balance.toReceive.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-green-50 p-3 rounded">
                      <span>{item.from} owes you {item.amount} sats</span>
                      <button
                        onClick={() => handlePay(item.amount, item.from)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Request Payment
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {balance.toPay.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">To Pay:</h4>
                <div className="space-y-2">
                  {balance.toPay.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-red-50 p-3 rounded">
                      <span>You owe {item.to} {item.amount} sats</span>
                      <button
                        onClick={() => handlePay(item.amount, item.to)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Pay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {balances.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No balances to settle
          </div>
        )}
      </div>
    </div>
  );
} 