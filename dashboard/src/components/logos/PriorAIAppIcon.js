import React from 'react';

const PriorAIAppIcon = ({ width = 100, height = 100, className }) => {
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
        <linearGradient id="priorAIGradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      
      {/* Rounded square background with gradient */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx="20"
        ry="20"
        fill="url(#priorAIGradientIcon)"
      />
      
      {/* White P Mark - Centered and scaled for icon */}
      <g id="p-mark-icon">
        {/* Main P shape with rounded corners */}
        <path
          d="M 20 70 
             L 20 30 
             Q 20 20 30 20 
             L 45 20 
             Q 60 20 60 35 
             L 60 40 
             Q 60 55 45 55 
             L 35 55 
             L 35 70 
             Q 35 80 25 80 
             L 25 80 
             Q 20 80 20 70 
             Z
             M 35 32 
             L 35 43 
             L 42 43 
             Q 47 43 47 40 
             L 47 35 
             Q 47 32 42 32 
             L 35 32 
             Z"
          fill="#FFFFFF"
        />
        
        {/* AI Dots - White with slight transparency */}
        <circle cx="68" cy="50" r="5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="80" cy="50" r="5" fill="#FFFFFF" opacity="0.7" />
      </g>
    </svg>
  );
};

export default PriorAIAppIcon; 