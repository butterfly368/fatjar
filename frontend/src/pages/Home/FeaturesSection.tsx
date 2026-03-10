import { useState } from 'react';
import { AccordionItem } from '../../components/ui/AccordionItem';
import { Tag } from '../../components/ui/Tag';
import './FeaturesSection.css';

const FEATURES = [
  {
    title: 'Money-Back on Missed Goals',
    description:
      'Set a funding goal and your contributors are protected. If the goal isn\u2019t met, every sat goes back automatically.',
    meta: 'Built-in refunds',
  },
  {
    title: 'Locked Until You\u2019re Ready',
    description:
      'Set when the jar opens. Bitcoin enforces it \u2014 no one can withdraw early, not even you.',
    meta: 'Time-lock',
  },
  {
    title: 'Early Users Earn More',
    description:
      'Every contribution earns $FJAR tokens. The earlier you use FatJar, the more you get per BTC.',
    meta: '$FJAR rewards',
  },
  {
    title: 'Zero Fees',
    description:
      '100% of every contribution goes into the jar. You only pay network gas.',
    meta: '0% platform fee',
  },
  {
    title: 'Four Jar Types',
    description:
      'Collect money for anything. Save for someone you love. Set a group goal with built-in refunds. Fund someone\u2019s dream. Pick what fits.',
    meta: 'Flexible',
  },
];

const TAGS = ['Bitcoin L1', 'Zero Fees', '$FJAR Rewards', 'Time-Lock'];

export function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="features">
      <div className="features-left">
        <div className="section-label">[01] Why FatJar</div>
        <h2 className="features-title">
          WHAT MAKES<br />
          FATJAR<br />
          DIFFERENT
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
