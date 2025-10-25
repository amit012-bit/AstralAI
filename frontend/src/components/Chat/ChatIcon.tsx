/**
 * Custom AI Agent Icon Component
 * Professional chat bubble icon with modern design
 */

import React from 'react';

interface ChatIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ChatIcon: React.FC<ChatIconProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main chat bubble */}
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H16L20 22V4C20 2.9 19.1 2 20 2Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
        
        {/* Inner chat bubble for depth */}
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H16L18 20V4C18 2.9 17.1 2 18 2H20Z"
          fill="currentColor"
          fillOpacity="0.7"
        />
        
        {/* Speech dots */}
        <circle cx="7" cy="9" r="1" fill="white" />
        <circle cx="12" cy="9" r="1" fill="white" />
        <circle cx="17" cy="9" r="1" fill="white" />
        
        {/* Message lines */}
        <rect x="6" y="12" width="8" height="1" rx="0.5" fill="white" fillOpacity="0.8" />
        <rect x="6" y="14" width="6" height="1" rx="0.5" fill="white" fillOpacity="0.6" />
        
        {/* Subtle gradient overlay */}
        <defs>
          <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H16L20 22V4C20 2.9 19.1 2 20 2Z"
          fill="url(#chatGradient)"
        />
      </svg>
    </div>
  );
};

export default ChatIcon;
