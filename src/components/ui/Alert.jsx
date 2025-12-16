import React from 'react';

const Alert = ({ type = 'info', children, onClose, className = '' }) => {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800 border-l-green-400',
    error: 'bg-red-50 border-red-200 text-red-800 border-l-red-400',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 border-l-yellow-400',
    info: 'bg-blue-50 border-blue-200 text-blue-800 border-l-blue-400',
  };

  return (
    <div className={`border-l-4 p-4 ${types[type]} ${className}`}>
      <div className="flex">
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-current hover:bg-opacity-10"
            onClick={onClose}
          >
            <span className="sr-only">Đóng</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;