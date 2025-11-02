import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-gray-800/50 rounded-lg shadow-lg p-6 relative group backdrop-blur-sm ${className}`}
    >
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 rounded-lg opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default Card;