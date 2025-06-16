import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useApiData, useRealtimeUpdates } from './hooks/useApiData';
import MetricsGrid from './components/MetricsGrid';
import DataVisualization from './components/DataVisualization';
import ControlPanel from './components/ControlPanel';
import PriorAuthForm from './components/PriorAuthForm';
import DemoNotice from './components/DemoNotice';
import { PriorAILogo } from './components/logos';
import { AlertCircle, FileText, BarChart3 } from 'lucide-react';

// Dashboard component (existing functionality)
function Dashboard() {
  const { 
    policies, 
    metadata, 
    analytics, 
    loading, 
    error, 
    lastUpdated, 
    refetch, 
    triggerScraping 
  } = useApiData();

  // Set up real-time updates
  useRealtimeUpdates(refetch);

  const handleTriggerScraping = async (sources) => {
    const result = await triggerScraping(sources);
    // Trigger a refresh after a short delay to see new data
    setTimeout(refetch, 2000);
    return result;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h1 className="text-xl font-bold">Connection Error</h1>
          </div>
          <p className="text-gray-600 mb-4">
            Unable to connect to the data collection service. Please ensure the service is running on port 3002.
          </p>
          <button
            onClick={refetch}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry Connection
          </button>
          <p className="text-xs text-gray-500 mt-3">
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Overview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Data Moat Metrics
          </h2>
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>
        <MetricsGrid 
          metadata={metadata} 
          analytics={analytics} 
          loading={loading} 
        />
      </section>

      {/* Data Visualizations */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Policy Intelligence Analytics
          </h2>
          <div className="text-gray-600 text-sm">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
        </div>
        <DataVisualization 
          policies={policies} 
          loading={loading} 
        />
      </section>

      {/* Control Panel */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          System Operations
        </h2>
        <ControlPanel
          onTriggerScraping={handleTriggerScraping}
          onRefresh={refetch}
          lastUpdated={lastUpdated}
          loading={loading}
        />
      </section>

      {/* Recent Policies Preview */}
      {policies && policies.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recent Policy Extractions
          </h2>
          <div className="dashboard-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Payer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Medication</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Confidence</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Extracted</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Requirements</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.slice(0, 5).map((policy, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {policy.payer}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {policy.medication}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          policy.confidence_score >= 0.95 
                            ? 'bg-green-100 text-green-800' 
                            : policy.confidence_score >= 0.9
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {Math.round(policy.confidence_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        {new Date(policy.extracted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="flex space-x-1">
                          {policy.requirements?.eligibility_criteria?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">
                              {policy.requirements.eligibility_criteria.length} criteria
                            </span>
                          )}
                          {policy.requirements?.step_therapy?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                              Step therapy
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Navigation component
function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="flex space-x-1">
      <Link
        to="/"
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
          location.pathname === '/' 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Analytics Dashboard</span>
        <span className="sm:hidden">Analytics</span>
      </Link>
      <Link
        to="/prior-auth"
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
          location.pathname === '/prior-auth' 
            ? 'bg-indigo-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Prior Authorization</span>
        <span className="sm:hidden">Prior Auth</span>
      </Link>
    </nav>
  );
}

// Main App component with routing
function App() {
  const [showDemoNotice, setShowDemoNotice] = useState(true);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="pr-6 sm:pr-8 lg:pr-10">
                  <div className="bg-gradient-to-r from-indigo-50 to-transparent p-2 sm:p-3 -m-2 sm:-m-3 rounded-lg">
                    <PriorAILogo className="h-8 sm:h-10 lg:h-12" width={160} />
                  </div>
                </div>
              </div>
              
              <Navigation />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prior-auth" element={<PriorAuthForm />} />
          </Routes>
        </main>

        {/* Demo Notice */}
        {showDemoNotice && (
          <DemoNotice onClose={() => setShowDemoNotice(false)} />
        )}
      </div>
    </Router>
  );
}

export default App; 