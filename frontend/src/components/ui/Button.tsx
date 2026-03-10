import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  to?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', to, children, className = '', ...props }: ButtonProps) {
  const cls = `btn btn-${variant} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
