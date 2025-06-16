import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import config from '../config/environment';

const DemoNotice = ({ onClose }) => {
  if (!config.IS_DEMO) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
          <p className="mt-1 text-sm text-yellow-700">
            This is a demonstration version of PriorAI. Backend services are not connected. 
            Form submissions will use simulated responses.
          </p>
          <div className="mt-3">
            <a
              href="https://github.com/howard768/PriorAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              View on GitHub →
            </a>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-yellow-600 hover:text-yellow-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DemoNotice; 