import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  vintageStamp?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  vintageStamp,
  icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`cellar-field ${error ? 'cellar-field--error' : ''} ${className}`}>
      {(label || vintageStamp) && (
        <div className="cellar-field__header">
          {label && (
            <label htmlFor={inputId} className="cellar-field__label">
              {label}
            </label>
          )}
          {vintageStamp && (
            <span className="cellar-field__stamp">{vintageStamp}</span>
          )}
        </div>
      )}
      <div className="cellar-field__input-wrap">
        {icon && <span className="cellar-field__icon">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`cellar-field__input ${icon ? 'cellar-field__input--has-icon' : ''}`}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span className={`cellar-field__message ${error ? 'cellar-field__message--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  options,
  children,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`cellar-field ${error ? 'cellar-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="cellar-field__label">
          {label}
        </label>
      )}
      <div className="cellar-field__select-wrap">
        <select ref={ref} id={selectId} className="cellar-field__select" {...props}>
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span className="cellar-field__select-arrow">▾</span>
      </div>
      {(error || helperText) && (
        <span className={`cellar-field__message ${error ? 'cellar-field__message--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  helperText,
  error,
  className = '',
  id,
  ...props
}, ref) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`cellar-field ${error ? 'cellar-field--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={areaId} className="cellar-field__label">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={areaId}
        className="cellar-field__textarea"
        {...props}
      />
      {(error || helperText) && (
        <span className={`cellar-field__message ${error ? 'cellar-field__message--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';
