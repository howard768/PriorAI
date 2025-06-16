import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#84CC16'];

const ConfidenceChart = ({ policies }) => {
  // Group policies by confidence ranges
  const confidenceRanges = {
    'Perfect (100%)': 0,
    'Excellent (95-99%)': 0,
    'Good (90-94%)': 0,
    'Fair (80-89%)': 0,
    'Poor (<80%)': 0
  };

  policies.forEach(policy => {
    const confidence = policy.confidence_score * 100;
    if (confidence === 100) {
      confidenceRanges['Perfect (100%)']++;
    } else if (confidence >= 95) {
      confidenceRanges['Excellent (95-99%)']++;
    } else if (confidence >= 90) {
      confidenceRanges['Good (90-94%)']++;
    } else if (confidence >= 80) {
      confidenceRanges['Fair (80-89%)']++;
    } else {
      confidenceRanges['Poor (<80%)']++;
    }
  });

  const data = Object.entries(confidenceRanges).map(([range, count]) => ({
    range,
    count,
    percentage: policies.length > 0 ? ((count / policies.length) * 100).toFixed(1) : 0
  }));

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Confidence Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="range" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [value, 'Policies']}
            labelFormatter={(label) => `Confidence: ${label}`}
          />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const PayerDistribution = ({ policies }) => {
  // Count policies by payer
  const payerCounts = {};
  policies.forEach(policy => {
    payerCounts[policy.payer] = (payerCounts[policy.payer] || 0) + 1;
  });

  // Convert to array and sort by count
  const data = Object.entries(payerCounts)
    .map(([payer, count]) => ({ payer, count, percentage: ((count / policies.length) * 100).toFixed(1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 payers

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Payers by Policy Count</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            label={({ payer, percentage }) => `${payer}: ${percentage}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [value, 'Policies']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const MedicationCoverage = ({ policies }) => {
  // Count policies by medication
  const medicationCounts = {};
  policies.forEach(policy => {
    // Normalize medication names (combine similar entries)
    let medication = policy.medication;
    if (medication && medication.toLowerCase().includes('glp-1 receptor agonist')) {
      medication = 'GLP-1 Receptor Agonists (General)';
    }
    medicationCounts[medication] = (medicationCounts[medication] || 0) + 1;
  });

  // Convert to array and calculate percentages
  const totalPolicies = policies.length;
  const data = Object.entries(medicationCounts)
    .map(([medication, count]) => ({ 
      medication, 
      count,
      percentage: Math.round((count / totalPolicies) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Use a pie chart for better visualization of distribution
  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Medication Coverage Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ medication, percentage }) => `${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} policies`, name]}
            labelFormatter={(label) => 'Medication Coverage'}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => `${value} (${entry.payload.count})`}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Add a summary table below for clarity */}
      <div className="mt-4 text-sm">
        <div className="border-t pt-3">
          {data.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex justify-between py-1">
              <span className="text-gray-600">{item.medication}</span>
              <span className="font-medium">{item.count} ({item.percentage}%)</span>
            </div>
          ))}
          {data.length > 5 && (
            <div className="text-gray-500 text-xs mt-1">
              +{data.length - 5} more medications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PolicyGrowthTrend = ({ policies }) => {
  // Group policies by extraction date
  const dailyCounts = {};
  
  policies.forEach(policy => {
    // Use last_updated if extracted_at is null
    const dateField = policy.extracted_at || policy.last_updated;
    if (dateField) {
      const date = new Date(dateField).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    }
  });

  // Create cumulative data for the last 7 days
  const sortedDates = Object.keys(dailyCounts).sort();
  
  // Calculate total cumulative up to 7 days ago
  let totalBefore = 0;
  if (sortedDates.length > 7) {
    sortedDates.slice(0, -7).forEach(date => {
      totalBefore += dailyCounts[date];
    });
  }
  
  // Now calculate cumulative for the last 7 days
  let cumulative = totalBefore;
  const data = sortedDates.slice(-7).map(date => {
    cumulative += dailyCounts[date];
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      policies: cumulative,
      daily: dailyCounts[date]
    };
  });

  return (
    <div className="dashboard-card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Policy Growth Trend (7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="policies" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            name="Total Policies"
          />
          <Line 
            type="monotone" 
            dataKey="daily" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
            name="Daily Added"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const DataVisualization = ({ policies, loading }) => {
  if (loading || !policies || policies.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dashboard-card animate-pulse">
            <div className="w-48 h-6 bg-gray-300 rounded mb-4"></div>
            <div className="w-full h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ConfidenceChart policies={policies} />
      <PayerDistribution policies={policies} />
      <MedicationCoverage policies={policies} />
      <PolicyGrowthTrend policies={policies} />
    </div>
  );
};

export default DataVisualization; 