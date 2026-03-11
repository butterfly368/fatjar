import { useState } from 'react';
import { Inbox, Gift, Target, Rocket } from 'lucide-react';
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
    title: 'Tiny Fee, Only on Withdrawal',
    description:
      'Contributing is free \u2014 100% of every sat goes into the jar. When the creator withdraws, a 0.5% fee supports the protocol. You only pay network gas.',
    meta: '0.5% withdraw fee',
  },
];

const JAR_TYPES = [
  { icon: Inbox, label: 'Collect', desc: 'Collect money for anything. You withdraw when the jar opens.' },
  { icon: Gift, label: 'Save for Someone', desc: 'Save for someone you love. They open the jar.' },
  { icon: Target, label: 'All-or-Nothing', desc: 'Set a goal. Hit it or everyone gets refunded.' },
  { icon: Rocket, label: 'Fund a Dream', desc: "Fund someone's dream. Goal met = they get it." },
];

const TAGS = ['Bitcoin L1', '0.5% Fee', '$FJAR Rewards', 'Time-Lock'];

export function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="features">
      <div className="features-left">
        <div className="section-label">[01] Why FatJar</div>
        <h2 className="features-title">
          What Makes<br />
          FatJar<br />
          Different
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

        {/* Jar Types — scannable grid instead of accordion */}
        <div className="jar-types-section">
          <div className="jar-types-label">Four Ways to Use a Jar</div>
          <div className="jar-types-grid">
            {JAR_TYPES.map(({ icon: Icon, label, desc }) => (
              <div className="jar-type-card" key={label}>
                <div className="jar-type-icon"><Icon size={18} /></div>
                <div className="jar-type-name">{label}</div>
                <div className="jar-type-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
