'use client';

import { useState } from 'react';

interface AddExpenseFormProps {
  groupId: string;
  members: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddExpenseForm({ groupId, members, onSuccess, onCancel }: AddExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState(members[0] || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(members);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
          description,
          paidBy,
          splitBetween,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (member: string) => {
    setSplitBetween(prev =>
      prev.includes(member)
        ? prev.filter(m => m !== member)
        : [...prev, member]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (sats)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount in satoshis"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What is this expense for?"
            required
          />
        </div>

        <div>
          <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
            Paid By
          </label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {members.map(member => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Between
          </label>
          <div className="space-y-2">
            {members.map(member => (
              <label key={member} className="flex items-center">
                <input
                  type="checkbox"
                  checked={splitBetween.includes(member)}
                  onChange={() => handleMemberToggle(member)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                {member}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </form>
  );
}