import React from 'react';
import { 
  Database, 
  Shield, 
  TrendingUp, 
  Users, 
  Pill, 
  BarChart3,
  CheckCircle,
  Clock
} from 'lucide-react';

const MetricCard = ({ icon: Icon, value, label, subtext, color = "blue", trend = null }) => (
  <div className="metric-card">
    <div className={`text-${color}-600 mb-3`}>
      <Icon size={32} />
    </div>
    <div className="metric-value text-gray-800">
      {value}
    </div>
    <div className="metric-label text-gray-600">
      {label}
    </div>
    {subtext && (
      <div className="text-xs text-gray-500 mt-1">
        {subtext}
      </div>
    )}
    {trend && (
      <div className={`text-xs mt-2 flex items-center justify-center ${
        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        <TrendingUp size={12} className="mr-1" />
        {trend > 0 ? '+' : ''}{trend}%
      </div>
    )}
  </div>
);

const MetricsGrid = ({ metadata, analytics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="metric-card animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-3"></div>
            <div className="w-16 h-8 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="w-20 h-4 bg-gray-300 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  const confidence = metadata?.coverage_summary?.avg_confidence || 0;
  const confidencePercent = Math.round(confidence * 100);
  const marketCoverage = analytics?.market_coverage?.coverage_percentage || 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        icon={Database}
        value={metadata?.total_policies || 0}
        label="Total Policies"
        subtext="AI-extracted requirements"
        color="blue"
        trend={analytics?.growth_metrics?.policies_added_last_30_days > 0 ? 15 : null}
      />
      
      <MetricCard
        icon={Users}
        value={metadata?.coverage_summary?.unique_payers || 0}
        label="Payers Covered"
        subtext="Across all plan types"
        color="purple"
        trend={8}
      />
      
      <MetricCard
        icon={Pill}
        value={metadata?.coverage_summary?.unique_medications || 0}
        label="Medications"
        subtext="GLP-1 treatments tracked"
        color="green"
      />
      
      <MetricCard
        icon={Shield}
        value={`${confidencePercent}%`}
        label="AI Confidence"
        subtext="Average extraction quality"
        color="emerald"
        trend={confidencePercent > 90 ? 5 : null}
      />
      
      <MetricCard
        icon={BarChart3}
        value={`${Math.round(marketCoverage)}%`}
        label="Market Coverage"
        subtext="US healthcare landscape"
        color="orange"
        trend={marketCoverage > 5 ? 12 : null}
      />
      
      <MetricCard
        icon={CheckCircle}
        value={analytics?.data_moat_strength?.policy_versions || 0}
        label="Policy Versions"
        subtext="Change tracking enabled"
        color="cyan"
      />
      
      <MetricCard
        icon={TrendingUp}
        value={`${Math.round((analytics?.data_moat_strength?.learning_accuracy || 0) * 100)}%`}
        label="Learning Accuracy"
        subtext="Prediction model performance"
        color="indigo"
      />
      
      <MetricCard
        icon={Clock}
        value={analytics?.growth_metrics?.policies_added_last_30_days || 0}
        label="Recent Growth"
        subtext="Policies added (30 days)"
        color="pink"
        trend={analytics?.growth_metrics?.policies_added_last_30_days > 0 ? 20 : null}
      />
    </div>
  );
};

export default MetricsGrid; 