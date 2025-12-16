import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      if (onChange.length === 2) {
        onChange(name, e.target.value);
      } else {
        onChange(e);
      }
    }
  };

  const handleBlur = (e) => {
    if (onBlur) {
      if (onBlur.length === 1 && typeof onBlur !== 'function') {
        onBlur(name);
      } else {
        onBlur(e);
      }
    }
  };

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      
      {error && (
        <p className="form-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;