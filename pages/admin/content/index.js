import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../layout';

export default function ContentManagement() {
  const router = useRouter();
  const { status: statusFilter, page = 1 } = router.query;
  
  const [contents, setContents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(statusFilter || 'all');
  
  useEffect(() => {
    if (statusFilter) {
      setActiveFilter(statusFilter);
    }
  }, [statusFilter]);
  
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        
        if (activeFilter && activeFilter !== 'all') {
          queryParams.append('status', activeFilter);
        }
        
        const response = await fetch(`/api/content?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setContents(data.data);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, [page, activeFilter]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    router.push({
      pathname: '/admin/content',
      query: filter !== 'all' ? { status: filter, page: 1 } : { page: 1 }
    }, undefined, { shallow: true });
  };
  
  const handlePageChange = (newPage) => {
    router.push({
      pathname: '/admin/content',
      query: {
        ...(activeFilter !== 'all' ? { status: activeFilter } : {}),
        page: newPage
      }
    }, undefined, { shallow: true });
  };
  
  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">Content Management</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link href="/admin/content/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Add New Content
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="status-filter" className="sr-only">Select a filter</label>
          <select
            id="status-filter"
            name="status-filter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={activeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Needs Revision">Needs Revision</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="flex space-x-4">
            <button
              type="button"
              className={`${
                activeFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'Pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('Pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'Approved'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('Approved')}
            >
              Approved
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'Rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('Rejected')}
            >
              Rejected
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'Needs Revision'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('Needs Revision')}
            >
              Needs Revision
            </button>
          </div>
        </div>
      </div>
      
      {/* Content List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : contents.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {contents.map((content) => (
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
                        {content.author && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            Author: {content.author}
                          </p>
                        )}
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
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No content found</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page === pagination.pages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * 10, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(pagination.pages).keys()].map((pageNum) => (
                  <button
                    key={pageNum + 1}
                    onClick={() => handlePageChange(pageNum + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      pagination.page === pageNum + 1
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                    pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 