import React from 'react';

const PriorAILogo = ({ width = 200, height, className }) => {
  // Calculate height based on aspect ratio if not provided
  const aspectRatio = 400 / 150;
  const calculatedHeight = height || width / aspectRatio;

  return (
    <svg
      width={width}
      height={calculatedHeight}
      viewBox="0 0 400 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="priorAIGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
        </filter>
      </defs>
      
      {/* P Mark */}
      <g id="p-mark" filter="url(#shadow)">
        {/* Main P shape with rounded corners */}
        <path
          d="M 20 120 
             L 20 30 
             Q 20 20 30 20 
             L 60 20 
             Q 90 20 90 50 
             L 90 60 
             Q 90 90 60 90 
             L 50 90 
             L 50 120 
             Q 50 130 40 130 
             L 30 130 
             Q 20 130 20 120 
             Z
             M 50 40 
             L 50 70 
             L 55 70 
             Q 65 70 65 60 
             L 65 50 
             Q 65 40 55 40 
             L 50 40 
             Z"
          fill="#111827"
        />
        
        {/* AI Dots - made larger and more vibrant */}
        <circle cx="105" cy="75" r="10" fill="url(#priorAIGradient)" />
        <circle cx="128" cy="75" r="10" fill="#818CF8" />
      </g>
      
      {/* Wordmark - PriorAI as one word */}
      <g id="wordmark">
        {/* "Prior" text */}
        <text
          x="160"
          y="85"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="52"
          fontWeight="700"
          fill="#111827"
        >
          Prior
        </text>
        
        {/* "AI" text - positioned immediately after "Prior" */}
        <text
          x="275"
          y="85"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontSize="52"
          fontWeight="800"
          fill="url(#priorAIGradient)"
        >
          AI
        </text>
      </g>
    </svg>
  );
};

export default PriorAILogo; 