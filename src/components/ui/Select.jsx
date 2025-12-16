import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Chọn...',
  error,
  required = false,
  disabled = false,
  className = '',
  children,
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

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
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
      
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        {!children && placeholder && <option value="">{placeholder}</option>}
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="form-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;