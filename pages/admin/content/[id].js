import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../layout';
import { useSession } from 'next-auth/react';

export default function ContentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const canApproveContent = session?.user?.permissions?.canApproveContent || session?.user?.role === 'admin';
  
  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);
  
  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/content/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
        setReviewStatus(data.data.status);
        setReviewNotes(data.data.reviewNotes || '');
      } else {
        setError('Failed to fetch content');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('An error occurred while fetching content');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReview = async (e) => {
    e.preventDefault();
    
    if (!reviewStatus) {
      setError('Please select a review status');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/content/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: id,
          status: reviewStatus,
          reviewNotes,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContent(data.data);
        setSuccess('Content has been reviewed successfully');
      } else {
        setError(data.message || 'Failed to review content');
      }
    } catch (error) {
      console.error('Error reviewing content:', error);
      setError('An error occurred while reviewing content');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Content has been deleted successfully');
        // Redirect to content list after a short delay
        setTimeout(() => {
          router.push('/admin/content');
        }, 1500);
      } else {
        setError(data.message || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('An error occurred while deleting content');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading content...</p>
        </div>
      </AdminLayout>
    );
  }
  
  if (!content) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Content not found'}</p>
          <Link href="/admin/content" className="text-indigo-600 hover:text-indigo-500">
            Back to Content List
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-tight text-gray-900">Content Review</h1>
        <div className="mt-3 flex sm:mt-0 sm:ml-4">
          <Link href="/admin/content" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back to List
          </Link>
          {session?.user?.role === 'admin' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>
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
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{content.title}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Source: {content.source} {content.sourceUrl && `(${content.sourceUrl})`}
              </p>
            </div>
            <div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${content.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                  content.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                  content.status === 'Needs Revision' ? 'bg-orange-100 text-orange-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {content.status}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{content.description}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Author</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{content.author || 'Not specified'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {content.tags && content.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  'No tags'
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Submitted By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {content.submittedBy ? `${content.submittedBy.name} (${content.submittedBy.email})` : 'System'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(content.createdAt).toLocaleString()}
              </dd>
            </div>
            {content.reviewedBy && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Reviewed By</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {`${content.reviewedBy.name} (${content.reviewedBy.email})`}
                </dd>
              </div>
            )}
            {content.lastReviewedAt && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Review Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(content.lastReviewedAt).toLocaleString()}
                </dd>
              </div>
            )}
            <div className="bg-white px-4 py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 mb-3">Content</dt>
              <dd className="mt-1 text-sm text-gray-900 prose max-w-none">
                <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  {content.content}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Review Form */}
      {canApproveContent && (
        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Review Content</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Provide your review decision and any notes for this content.</p>
            </div>
            <form onSubmit={handleReview} className="mt-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Review Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select a status</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="Pending">Keep Pending</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Review Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Provide any feedback or notes about this content"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 