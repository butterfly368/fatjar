import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <input className={`input-field${error ? ' input-error' : ''} ${className}`.trim()} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

export function TextArea({ label, error, className = '', ...props }: TextAreaProps) {
  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <textarea className={`input-field${error ? ' input-error' : ''} ${className}`.trim()} {...props} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
