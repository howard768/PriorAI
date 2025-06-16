import React from 'react';

const PriorAILogoMark = ({ width = 100, height = 100, className }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="priorAIGradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      
      {/* P Mark - Centered and scaled for square format */}
      <g id="p-mark-only">
        {/* Main P shape with rounded corners */}
        <path
          d="M 15 75 
             L 15 25 
             Q 15 15 25 15 
             L 45 15 
             Q 65 15 65 35 
             L 65 40 
             Q 65 60 45 60 
             L 35 60 
             L 35 75 
             Q 35 85 25 85 
             L 25 85 
             Q 15 85 15 75 
             Z
             M 35 30 
             L 35 45 
             L 42 45 
             Q 48 45 48 40 
             L 48 35 
             Q 48 30 42 30 
             L 35 30 
             Z"
          fill="#1F2937"
        />
        
        {/* AI Dots - Positioned relative to P */}
        <circle cx="72" cy="50" r="6" fill="#6366F1" />
        <circle cx="85" cy="50" r="6" fill="#818CF8" />
      </g>
    </svg>
  );
};

export default PriorAILogoMark; 