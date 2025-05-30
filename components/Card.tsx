
import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white shadow-lg rounded-xl overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="bg-green-600 text-white p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

export default Card;
