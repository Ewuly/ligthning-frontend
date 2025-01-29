'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Link href="/login" className="text-white hover:text-blue-100">
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span>{user.username}</span>
      <button
        onClick={logout}
        className="text-white hover:text-blue-100"
      >
        Logout
      </button>
    </div>
  );
} 