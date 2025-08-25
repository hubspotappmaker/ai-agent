import React, { useState, useEffect } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { MessageOutlined, MailOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getHistory } from '../service/history.service';
import type { Activity } from '../types/history';

const Activity: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      // TODO: Get portalId from context or props
      const portalId = "243429254"; // Temporarily hardcoded
      const offset = (page - 1) * pageSize;
      const response = await getHistory({ 
        portalId, 
        limit: pageSize, 
        offset 
      });
      setActivities(response.data.activities);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Unable to load activity data');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined className="text-green-600" />;
      case 'failed':
        return <CloseCircleOutlined className="text-red-600" />;
      default:
        return <ClockCircleOutlined className="text-yellow-600" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageOutlined className="text-blue-600" />;
      case 'email':
        return <MailOutlined className="text-purple-600" />;
      default:
        return <FileTextOutlined className="text-gray-600" />;
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (loading) {
    return (
      <div className="h-[65vh] flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[65vh] flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-[65vh] overflow-hidden flex flex-col p-6">
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="w-5 h-5 text-[#667eea]" />
        <h3 className="text-lg font-semibold text-slate-800">Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: 'thin' }}>
        {activities.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No activities found
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getActionIcon(activity.type)}</span>
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {activity.action.replace(/_/g, ' ').toUpperCase()}
                  </p>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(activity.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 truncate">{activity.note}</p>
                <p className="text-xs text-slate-500">{formatDate(activity.createdAt)}</p>
              </div>
              <button 
                onClick={() => handleView(activity)} 
                className="text-[#667eea] text-sm hover:underline ml-2"
              >
                View
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                currentPage === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LeftOutlined className="w-3 h-3" />
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 text-sm rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#667eea] text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-md transition-colors ${
                currentPage === totalPages
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Next
              <RightOutlined className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getActionIcon(selectedActivity.type)}</span>
                  <h4 className="text-base font-semibold text-slate-900">
                    {selectedActivity.action.replace(/_/g, ' ').toUpperCase()}
                  </h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedActivity.status)}
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedActivity.status)}`}>
                      {selectedActivity.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{formatDate(selectedActivity.createdAt)}</p>
              </div>
              <button onClick={closeModal} className="text-slate-600 hover:text-slate-900 text-sm">
                Close
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Description</h5>
                <p className="text-sm text-slate-800 whitespace-pre-wrap">{selectedActivity.note}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-slate-600 mb-1">Type</h5>
                  <p className="text-sm text-slate-800">{selectedActivity.type}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-slate-600 mb-1">Engine</h5>
                  <p className="text-sm text-slate-800">{selectedActivity.engineName}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-slate-600 mb-1">Model</h5>
                  <p className="text-sm text-slate-800">{selectedActivity.modelName}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-slate-600 mb-1">Max Token</h5>
                  <p className="text-sm text-slate-800">{selectedActivity.maxToken}</p>
                </div>
              </div>
              
              {selectedActivity.errorMessage && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h5 className="text-sm font-medium text-red-700 mb-2">Error</h5>
                  <p className="text-sm text-red-800">{selectedActivity.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;


