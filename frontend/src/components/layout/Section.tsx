import type { ReactNode } from 'react';
import './Section.css';

interface SectionProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Section({ children, className = '', style }: SectionProps) {
  return (
    <section className={`section ${className}`.trim()} style={style}>
      {children}
    </section>
  );
}
