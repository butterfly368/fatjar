import './StatBlock.css';

interface StatBlockProps {
  label: string;
  value: string;
  accent?: string;
}

export function StatBlock({ label, value, accent }: StatBlockProps) {
  return (
    <div className="stat-block">
      <div className="stat-block-label">{label}</div>
      <div className="stat-block-value">
        <span className="stat-block-accent">{value}</span>
        {accent && ` ${accent}`}
      </div>
    </div>
  );
}
