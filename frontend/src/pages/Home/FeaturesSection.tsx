import { useState } from 'react';
import { AccordionItem } from '../../components/ui/AccordionItem';
import { Tag } from '../../components/ui/Tag';
import './FeaturesSection.css';

const FEATURES = [
  {
    title: 'All-or-Nothing Guarantee',
    description:
      'Your BTC returns if the goal isn\u2019t met. Trustless, automatic.',
    meta: 'Refund on failure',
  },
  {
    title: 'Time-Locked by Bitcoin',
    description:
      'The most secure network enforces your timeline. No admin keys, no overrides.',
    meta: 'Bitcoin L1 security',
  },
  {
    title: 'Early Backer Rewards',
    description:
      '$FJAR tokens via bonding curve. First in, most rewarded.',
    meta: 'Bonding curve',
  },
  {
    title: 'Zero Platform Fees',
    description:
      '100% of BTC goes to the vault. Network gas only.',
    meta: '0% fee',
  },
  {
    title: 'Four Vault Modes',
    description:
      'Open collection, trust fund, all-or-nothing pledge, or funded grant. You decide.',
    meta: 'Flexible design',
  },
];

const TAGS = ['OPNet', 'OP20 Token', 'Bonding Curve', 'Time-Lock'];

export function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="features">
      <div className="features-left">
        <div className="section-label">[01] The Protocol</div>
        <h2 className="features-title">
          TRUSTLESS<br />
          VAULTS ON<br />
          BITCOIN L1
        </h2>
        <div className="features-tags">
          {TAGS.map((tag, i) => (
            <Tag key={tag} label={tag} active={i === 0} />
          ))}
        </div>
      </div>
      <div>
        {FEATURES.map((feature, i) => (
          <AccordionItem
            key={feature.title}
            title={feature.title}
            description={feature.description}
            meta={feature.meta}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </section>
  );
}
