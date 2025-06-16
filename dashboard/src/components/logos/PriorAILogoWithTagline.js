import React from 'react';

const PriorAILogoWithTagline = ({ width = 200, height, className }) => {
  // Calculate height based on aspect ratio if not provided
  const aspectRatio = 400 / 180; // Taller to accommodate tagline
  const calculatedHeight = height || width / aspectRatio;

  return (
    <svg
      width={width}
      height={calculatedHeight}
      viewBox="0 0 400 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="priorAIGradientTagline" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      
      {/* P Mark */}
      <g id="p-mark-tagline">
        {/* Main P shape with rounded corners */}
        <path
          d="M 20 110 
             L 20 20 
             Q 20 10 30 10 
             L 60 10 
             Q 90 10 90 40 
             L 90 50 
             Q 90 80 60 80 
             L 50 80 
             L 50 110 
             Q 50 120 40 120 
             L 30 120 
             Q 20 120 20 110 
             Z
             M 50 30 
             L 50 60 
             L 55 60 
             Q 65 60 65 50 
             L 65 40 
             Q 65 30 55 30 
             L 50 30 
             Z"
          fill="#1F2937"
        />
        
        {/* AI Dots */}
        <circle cx="105" cy="65" r="8" fill="#6366F1" />
        <circle cx="125" cy="65" r="8" fill="#818CF8" />
      </g>
      
      {/* Wordmark - PriorAI as one word */}
      <g id="wordmark-tagline">
        {/* "Prior" text */}
        <text
          x="160"
          y="75"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="48"
          fontWeight="600"
          fill="#1F2937"
        >
          Prior
        </text>
        
        {/* "AI" text - positioned immediately after "Prior" */}
        <text
          x="262"
          y="75"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="48"
          fontWeight="700"
          fill="#6366F1"
        >
          AI
        </text>
        
        {/* Tagline */}
        <text
          x="160"
          y="110"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="14"
          fontWeight="400"
          fill="#9CA3AF"
          letterSpacing="0.5"
        >
          Intelligent Prior Authorization
        </text>
      </g>
    </svg>
  );
};

export default PriorAILogoWithTagline; 