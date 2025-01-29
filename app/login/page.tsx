'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username);
    router.push('/groups');
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 