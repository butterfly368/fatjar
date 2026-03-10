import { StepCard } from '../../components/ui/StepCard';
import './HowItWorks.css';

const STEPS = [
  {
    number: 'Step 01',
    title: 'Create',
    description:
      'Set your vault name, goal amount, time-lock, and optional beneficiary.',
  },
  {
    number: 'Step 02',
    title: 'Fund',
    description:
      'Contributors back it with BTC and earn $FJAR tokens. Early backers earn more.',
  },
  {
    number: 'Step 03',
    title: 'Resolve',
    description:
      'Goal met? Withdraw the BTC. Goal missed? Everyone gets a full refund.',
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how-header">
        <h2 className="how-title">Three Steps.<br />Zero Fees.</h2>
        <span className="how-sub">Bitcoin-native from start to finish</span>
      </div>
      <div className="steps-grid">
        {STEPS.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
