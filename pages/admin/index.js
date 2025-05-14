import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from './layout';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalContent: 0,
    pendingContent: 0,
    approvedContent: 0,
    rejectedContent: 0,
    needsRevisionContent: 0
  });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/content?limit=5');
        const data = await response.json();
        
        if (data.success) {
          // Calculate stats
          const pending = data.data.filter(item => item.status === 'Pending').length;
          const approved = data.data.filter(item => item.status === 'Approved').length;
          const rejected = data.data.filter(item => item.status === 'Rejected').length;
          const needsRevision = data.data.filter(item => item.status === 'Needs Revision').length;
          
          setStats({
            totalContent: data.pagination.total,
            pendingContent: pending,
            approvedContent: approved,
            rejectedContent: rejected,
            needsRevisionContent: needsRevision
          });
          
          setRecentContent(data.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back, {session?.user?.name}. Here's an overview of your content management system.
        </p>
      </div>
      
      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Content</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalContent}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-500">{stats.pendingContent}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-500">{stats.approvedContent}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-500">{stats.rejectedContent}</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Needs Revision</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-500">{stats.needsRevisionContent}</dd>
          </div>
        </div>
      </div>
      
      {/* Recent Content */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Content</h2>
          <Link href="/admin/content" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>
        
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {recentContent.length > 0 ? (
              recentContent.map((content) => (
                <li key={content._id}>
                  <Link href={`/admin/content/${content._id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{content.title}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${content.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                              content.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                              content.status === 'Needs Revision' ? 'bg-orange-100 text-orange-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {content.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Source: {content.source}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Added on {new Date(content.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                No content available
              </li>
            )}
          </ul>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Content</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Add new psychoeducational content to the system for review.</p>
              </div>
              <div className="mt-5">
                <Link href="/admin/content/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add Content
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Review Pending Content</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Review and validate content that is pending approval.</p>
              </div>
              <div className="mt-5">
                <Link href="/admin/content?status=Pending" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Review Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 