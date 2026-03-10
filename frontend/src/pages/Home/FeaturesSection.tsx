import { useState } from 'react';
import { AccordionItem } from '../../components/ui/AccordionItem';
import { Tag } from '../../components/ui/Tag';
import { MOCK_FEATURES, TAGS } from '../../services/mockData';
import './FeaturesSection.css';

export function FeaturesSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="features">
      <div className="features-left">
        <div className="section-label">[01] The Protocol</div>
        <h2 className="features-title">
          A PIGGY BANK<br />
          BUILT ON<br />
          BITCOIN L1
        </h2>
        <div className="features-tags">
          {TAGS.map((tag, i) => (
            <Tag key={tag} label={tag} active={i === 0} />
          ))}
        </div>
      </div>
      <div>
        {MOCK_FEATURES.map((feature, i) => (
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
