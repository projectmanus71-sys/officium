
import React from 'react';

interface LogoProps {
  size?: number;
  color?: string;
  glow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 40, color = "#6366f1", glow = true }) => {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {glow && (
        <div 
          className="absolute inset-0 blur-xl opacity-40 animate-pulse" 
          style={{ backgroundColor: color, borderRadius: '35%' }}
        />
      )}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-2xl"
      >
        {/* Outer Ring - Circadian Rhythm Segments */}
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="2" strokeDasharray="10 5" opacity="0.2" />
        
        {/* Main Logo Shape - The "Nexus O" */}
        <path 
          d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15ZM50 75C36.19 75 25 63.81 25 50C25 36.19 36.19 25 50 25C63.81 25 75 36.19 75 50C75 63.81 63.81 75 50 75Z" 
          fill={color}
        />
        
        {/* Inner Core - Biological Structure */}
        <path 
          d="M50 35L63 42.5V57.5L50 65L37 57.5V42.5L50 35Z" 
          fill="white"
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
        
        {/* Connection Points */}
        <circle cx="50" cy="15" r="3" fill={color} />
        <circle cx="85" cy="50" r="3" fill={color} />
        <circle cx="50" cy="85" r="3" fill={color} />
        <circle cx="15" cy="50" r="3" fill={color} />
      </svg>
    </div>
  );
};

export default Logo;
