import { StepCard } from '../../components/ui/StepCard';
import { MOCK_STEPS } from '../../services/mockData';
import './HowItWorks.css';

export function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how-header">
        <h2 className="how-title">Three Steps.<br />Zero Fees.</h2>
        <span className="how-sub">Bitcoin-native from start to finish</span>
      </div>
      <div className="steps-grid">
        {MOCK_STEPS.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
