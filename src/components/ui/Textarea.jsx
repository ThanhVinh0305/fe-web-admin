import React from 'react';

const Textarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(name, e.target.value);
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
      
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`input-field resize-vertical ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
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

export default Textarea;