import React from 'react';

const Card = ({ 
  children, 
  title, 
  className = '',
  padding = true,
  shadow = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border';
  const shadowClass = shadow ? 'shadow-md' : '';
  const paddingClass = padding ? 'p-6' : '';
  
  const classes = `${baseClasses} ${shadowClass} ${paddingClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;