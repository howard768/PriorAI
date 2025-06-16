import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  Download, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

const ControlPanel = ({ onTriggerScraping, onRefresh, lastUpdated, loading }) => {
  const [scrapingLoading, setScrapingLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState(['medicare', 'commercial']);
  const [scrapingStatus, setScrapingStatus] = useState(null);

  const sources = [
    { id: 'medicare', label: 'Medicare LCD', description: 'Local Coverage Determinations' },
    { id: 'medicaid', label: 'State Medicaid', description: 'All 50 state PDLs' },
    { id: 'commercial', label: 'Commercial Payers', description: 'UHC, Anthem, Aetna, etc.' },
    { id: 'guidelines', label: 'Medical Guidelines', description: 'ADA, AACE, Endocrine Society' },
    { id: 'kaiser', label: 'Kaiser Permanente', description: '9 regional plans' },
    { id: 'molina', label: 'Molina Healthcare', description: '12 state plans' },
    { id: 'centene', label: 'Centene Corporation', description: '9 subsidiaries' },
    { id: 'independence', label: 'Independence BCBS', description: 'PA/NJ/DE region' }
  ];

  const handleTriggerScraping = async () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one source to scrape');
      return;
    }

    setScrapingLoading(true);
    try {
      const result = await onTriggerScraping(selectedSources);
      setScrapingStatus({
        type: 'success',
        message: `Scraping job started: ${result.job_id}`,
        estimatedCompletion: result.estimated_completion
      });
      
      // Clear status after 10 seconds
      setTimeout(() => setScrapingStatus(null), 10000);
    } catch (error) {
      setScrapingStatus({
        type: 'error',
        message: `Failed to start scraping: ${error.message}`
      });
      setTimeout(() => setScrapingStatus(null), 5000);
    } finally {
      setScrapingLoading(false);
    }
  };

  const handleSourceToggle = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">System Control Panel</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
        </div>
      </div>

      {scrapingStatus && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          scrapingStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {scrapingStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{scrapingStatus.message}</span>
          {scrapingStatus.estimatedCompletion && (
            <span className="text-xs">
              ETA: {new Date(scrapingStatus.estimatedCompletion).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleTriggerScraping}
              disabled={scrapingLoading || selectedSources.length === 0}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                scrapingLoading || selectedSources.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {scrapingLoading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Starting Scraping...</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>Start Policy Scraping</span>
                </>
              )}
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>

            <button
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium border-2 border-green-300 text-green-700 hover:border-green-500 hover:text-green-600 transition-all"
            >
              <Download size={20} />
              <span>Export Policies</span>
            </button>
          </div>
        </div>

        {/* Source Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Data Sources 
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({selectedSources.length} selected)
            </span>
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sources.map(source => (
              <label
                key={source.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSources.includes(source.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => handleSourceToggle(source.id)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{source.label}</div>
                  <div className="text-sm text-gray-600">{source.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <div className="font-medium text-green-800">AI Service</div>
              <div className="text-sm text-green-600">Operational</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <Zap size={20} className="text-indigo-600" />
            <div>
              <div className="font-medium text-indigo-800">Data Collection</div>
              <div className="text-sm text-indigo-600">Active</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <Settings size={20} className="text-purple-600" />
            <div>
              <div className="font-medium text-purple-800">Analytics</div>
              <div className="text-sm text-purple-600">Real-time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 