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
    // Hash links: smooth scroll instead of React Router navigation
    if (to.startsWith('#') || to.startsWith('/#')) {
      const hash = to.startsWith('/#') ? to.slice(1) : to;
      return (
        <a
          href={hash}
          className={cls}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {children}
        </a>
      );
    }
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
