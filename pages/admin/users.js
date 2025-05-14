// pages/admin/users.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from './layout';

export default function UserManagement() {
  const router = useRouter();
  const { data: session } = useSession();
  const { role: roleFilter, page = 1 } = router.query;
  
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(roleFilter || 'all');
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Check if user has permission to manage users
  const canManageUsers = session?.user?.role === 'admin' && session?.user?.permissions?.canManageUsers;
  
  useEffect(() => {
    if (!canManageUsers) {
      router.push('/admin');
    }
  }, [canManageUsers, router]);
  
  useEffect(() => {
    if (roleFilter) {
      setActiveFilter(roleFilter);
    }
  }, [roleFilter]);
  
  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [page, activeFilter, canManageUsers]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      
      if (activeFilter && activeFilter !== 'all') {
        queryParams.append('role', activeFilter);
      }
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    router.push({
      pathname: '/admin/users',
      query: filter !== 'all' ? { role: filter, page: 1 } : { page: 1 }
    }, undefined, { shallow: true });
  };
  
  const handlePageChange = (newPage) => {
    router.push({
      pathname: '/admin/users',
      query: {
        ...(activeFilter !== 'all' ? { role: activeFilter } : {}),
        page: newPage
      }
    }, undefined, { shallow: true });
  };
  
  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      role: user.role || 'user',
      permissions: {
        canApproveContent: user.permissions?.canApproveContent || false,
        canEditContent: user.permissions?.canEditContent || false,
        canDeleteContent: user.permissions?.canDeleteContent || false,
        canManageUsers: user.permissions?.canManageUsers || false
      }
    });
  };
  
  const handleCancelEdit = () => {
    setEditingUser(null);
    setError('');
    setSuccess('');
  };
  
  const handleRoleChange = (e) => {
    setEditingUser({
      ...editingUser,
      role: e.target.value
    });
  };
  
  const handlePermissionChange = (permission) => {
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [permission]: !editingUser.permissions[permission]
      }
    });
  };
  
  const handleSaveUser = async () => {
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingUser._id,
          role: editingUser.role,
          permissions: editingUser.permissions
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the user in the list
        setUsers(users.map(user => user._id === editingUser._id ? data.data : user));
        setSuccess('User updated successfully');
        setEditingUser(null);
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('An error occurred while updating user');
    }
  };
  
  if (!canManageUsers) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">You do not have permission to manage users</p>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">User Management</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage user roles and permissions
        </p>
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="role-filter" className="sr-only">Select a filter</label>
          <select
            id="role-filter"
            name="role-filter"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={activeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="content_validator">Content Validators</option>
            <option value="user">Regular Users</option>
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
              All Users
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'admin'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('admin')}
            >
              Admins
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'content_validator'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('content_validator')}
            >
              Content Validators
            </button>
            <button
              type="button"
              className={`${
                activeFilter === 'user'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
              onClick={() => handleFilterChange('user')}
            >
              Regular Users
            </button>
          </div>
        </div>
      </div>
      
      {/* User List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                          user.role === 'content_validator' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {user.role === 'admin' ? 'Admin' : 
                          user.role === 'content_validator' ? 'Content Validator' : 
                          'User'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      {user._id !== session.user.id && (
                        <button
                          type="button"
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit Permissions
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">No users found</p>
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
                of <span className="font-medium">{pagination.total}</span> users
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
      
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCancelEdit}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Edit User: {editingUser.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {editingUser.email}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={editingUser.role}
                      onChange={handleRoleChange}
                    >
                      <option value="user">Regular User</option>
                      <option value="content_validator">Content Validator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Permissions
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          id="canApproveContent"
                          name="canApproveContent"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={editingUser.permissions.canApproveContent}
                          onChange={() => handlePermissionChange('canApproveContent')}
                        />
                        <label htmlFor="canApproveContent" className="ml-2 block text-sm text-gray-900">
                          Can approve content
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="canEditContent"
                          name="canEditContent"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={editingUser.permissions.canEditContent}
                          onChange={() => handlePermissionChange('canEditContent')}
                        />
                        <label htmlFor="canEditContent" className="ml-2 block text-sm text-gray-900">
                          Can edit content
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="canDeleteContent"
                          name="canDeleteContent"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={editingUser.permissions.canDeleteContent}
                          onChange={() => handlePermissionChange('canDeleteContent')}
                        />
                        <label htmlFor="canDeleteContent" className="ml-2 block text-sm text-gray-900">
                          Can delete content
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="canManageUsers"
                          name="canManageUsers"
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={editingUser.permissions.canManageUsers}
                          onChange={() => handlePermissionChange('canManageUsers')}
                        />
                        <label htmlFor="canManageUsers" className="ml-2 block text-sm text-gray-900">
                          Can manage users
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  onClick={handleSaveUser}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 