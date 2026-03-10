import { StepCard } from '../../components/ui/StepCard';
import './HowItWorks.css';

const STEPS = [
  {
    number: 'Step 01',
    title: 'Create a Jar',
    description:
      'Name it, set a goal if you want, pick when it unlocks.',
  },
  {
    number: 'Step 02',
    title: 'Share the Link',
    description:
      'Send it to your people. They contribute BTC directly and earn $FJAR tokens.',
  },
  {
    number: 'Step 03',
    title: 'Open the Jar',
    description:
      'When the time comes, the creator \u2014 or a chosen beneficiary \u2014 withdraws. Set a goal? If it\u2019s not met, everyone gets their BTC back.',
  },
];

export function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how-header">
        <h2 className="how-title">Three Steps.<br />Zero Fees.</h2>
        <span className="how-sub">From jar to sats — no middleman, no platform cut.</span>
      </div>
      <div className="steps-grid">
        {STEPS.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </div>
    </section>
  );
}
