import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to Lightning Tricount</h2>
        <p className="text-gray-600 mb-4">
          Split expenses with your friends using Bitcoin Lightning Network. Fast, secure, and easy to use.
        </p>
        <Link 
          href="/groups"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">Recent Groups</h3>
          <p className="text-gray-500">No groups yet. Create your first group to get started!</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link 
              href="/groups"
              className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
            >
              ➕ Create New Group
            </Link>
            <Link 
              href="/settle"
              className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
            >
              💰 Settle Balance
            </Link>
            <Link 
              href="/statistics"
              className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100"
            >
              📊 View Statistics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}