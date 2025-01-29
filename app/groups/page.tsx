'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AddExpenseForm from '@/components/AddExpenseForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Expense {
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

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/groups?username=${user?.username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const createNewGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName,
          members: newGroupMembers.split(',').map(member => member.trim()),
          owner: user?.username,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create group');
      }
      
      setShowNewGroupModal(false);
      setNewGroupName('');
      setNewGroupMembers('');
      await fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        Loading groups...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Groups</h2>
        <div className="space-x-4">
          <Link 
            href="/"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Menu
          </Link>
          <button 
            onClick={() => setShowNewGroupModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Group
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <Link 
            href={`/groups/${group._id}`}
            key={group._id}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
                <p className="text-gray-600 mb-2">Members: {group.members.join(', ')}</p>
                <p className="text-sm text-gray-500">
                  Created on {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  Balance: {group.expenses.reduce((acc, exp) => acc + exp.amount, 0)} sats
                </p>
                <p className="text-sm text-gray-500">{group.expenses.length} expenses</p>
              </div>
            </div>
          </Link>
        ))}

        {groups.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            <p>No groups yet. Create your first group to get started!</p>
          </div>
        )}
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Group</h3>
            <form onSubmit={createNewGroup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Members (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newGroupMembers}
                    onChange={(e) => setNewGroupMembers(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Alice, Bob, Charlie"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNewGroupModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}