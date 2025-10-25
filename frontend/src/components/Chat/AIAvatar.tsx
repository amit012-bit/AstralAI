/**
 * AI Avatar Component - Professional Woman Design
 * Custom avatar for the AI agent with a well-dressed, professional appearance
 */

import React from 'react';

interface AIAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AIAvatar: React.FC<AIAvatarProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {/* Avatar Container */}
      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
        {/* Professional Woman Avatar SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hair */}
          <path
            d="M20 35 Q30 25 40 30 Q50 25 60 30 Q70 25 80 35 L85 45 Q85 55 80 65 L75 70 Q70 75 65 70 Q60 75 55 70 Q50 75 45 70 Q40 75 35 70 Q30 75 25 70 L20 65 Q15 55 20 45 Z"
            fill="#8B4513"
            stroke="#654321"
            strokeWidth="1"
          />
          
          {/* Face */}
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="#FDBCB4"
            stroke="#E8A598"
            strokeWidth="1"
          />
          
          {/* Blazer/Professional Attire */}
          <path
            d="M30 75 Q35 85 50 90 Q65 85 70 75 L75 85 L75 95 L25 95 L25 85 L30 75"
            fill="#1E40AF"
            stroke="#1E3A8A"
            strokeWidth="1"
          />
          
          {/* Blazer Lapel */}
          <path
            d="M35 75 Q40 80 45 78 Q50 80 55 78 Q60 80 65 75"
            fill="#1E3A8A"
            stroke="#1E3A8A"
            strokeWidth="0.5"
          />
          
          {/* Blouse */}
          <path
            d="M40 75 Q50 78 60 75 L60 85 L40 85 Z"
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="0.5"
          />
          
          {/* Eyes */}
          <ellipse cx="42" cy="45" rx="3" ry="4" fill="#1F2937" />
          <ellipse cx="58" cy="45" rx="3" ry="4" fill="#1F2937" />
          
          {/* Eye highlights */}
          <circle cx="43" cy="43" r="1" fill="#FFFFFF" />
          <circle cx="59" cy="43" r="1" fill="#FFFFFF" />
          
          {/* Eyebrows */}
          <path d="M38 40 Q42 38 46 40" stroke="#8B4513" strokeWidth="1.5" fill="none" />
          <path d="M54 40 Q58 38 62 40" stroke="#8B4513" strokeWidth="1.5" fill="none" />
          
          {/* Nose */}
          <path d="M50 45 Q50 50 50 55" stroke="#E8A598" strokeWidth="1" fill="none" />
          
          {/* Lips */}
          <path d="M45 60 Q50 63 55 60" stroke="#DC2626" strokeWidth="1.5" fill="none" />
          
          {/* Earrings */}
          <circle cx="25" cy="50" r="2" fill="#FFD700" />
          <circle cx="75" cy="50" r="2" fill="#FFD700" />
          
          {/* Necklace */}
          <path d="M42 65 Q50 68 58 65" stroke="#FFD700" strokeWidth="1" fill="none" />
          <circle cx="50" cy="67" r="1" fill="#FFD700" />
          
          {/* AI Indicator - Subtle tech element */}
          <circle cx="80" cy="25" r="8" fill="#10B981" opacity="0.8" />
          <path d="M76 25 L78 27 L84 21" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm">
        <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-sm -z-10"></div>
    </div>
  );
};

export default AIAvatar;
