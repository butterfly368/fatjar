import './StepCard.css';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="step-card">
      <div className="step-card-num">{number}</div>
      <h3 className="step-card-title">{title}</h3>
      <p className="step-card-desc">{description}</p>
    </div>
  );
}
