import { Check, Clock, Telescope } from 'lucide-react';
import './RoadmapSection.css';

const PHASES = [
  {
    phase: 'Now',
    label: 'MVP Live',
    icon: Check,
    items: [
      '4 jar types — Collect, Save, All-or-Nothing, Fund a Dream',
      'Bonding curve $FJAR rewards for every contributor',
      'Time-lock — Bitcoin enforces the unlock date',
      'All-or-nothing refund with burn-on-refund protection',
      '0.5% withdraw fee funds protocol development',
    ],
  },
  {
    phase: 'Next',
    label: 'Coming Soon',
    icon: Clock,
    items: [
      'NFT thank-you cards — contributors receive unique art on every contribution',
      '$FJAR staking for BTC yield share',
      'Custom jar visuals and branding',
      'Jar discovery — search, filter, featured jars',
    ],
  },
  {
    phase: 'Vision',
    label: 'The Bigger Picture',
    icon: Telescope,
    items: [
      'Multi-recipient jars with multisig',
      'Recurring contributions — automated savings',
      'Corporate treasury jars',
      'Lightning Network integration',
      '$FJAR governance — community-directed protocol fees',
    ],
  },
];

export function RoadmapSection() {
  return (
    <section className="roadmap">
      <div className="roadmap-header">
        <div>
          <div className="section-label">[03] Roadmap</div>
          <h2 className="roadmap-title">
            Where We Are.<br />Where We&rsquo;re Going.
          </h2>
        </div>
        <span className="roadmap-sub">Building in public on Bitcoin L1</span>
      </div>

      <div className="roadmap-phases">
        {PHASES.map(({ phase, label, icon: Icon, items }) => (
          <div className="roadmap-phase" key={phase}>
            <div className="roadmap-phase-header">
              <span className="roadmap-phase-badge" data-phase={phase.toLowerCase()}>
                <Icon size={12} />
                {phase}
              </span>
              <span className="roadmap-phase-label">{label}</span>
            </div>
            <ul className="roadmap-phase-list">
              {items.map((item) => (
                <li key={item} className="roadmap-phase-item">
                  <span className="roadmap-bullet" data-phase={phase.toLowerCase()} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
