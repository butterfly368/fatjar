import './AccordionItem.css';

interface AccordionItemProps {
  title: string;
  description: string;
  meta: string;
  isOpen: boolean;
  onToggle: () => void;
}

export function AccordionItem({ title, description, meta, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className={`acc-item${isOpen ? ' acc-item-open' : ''}`} onClick={onToggle}>
      <div className="acc-header">
        <span className="acc-title">{title}</span>
        <span className="acc-arrow">+</span>
      </div>
      <div className="acc-body">
        <p className="acc-desc">{description}</p>
        <div className="acc-meta">{meta}</div>
      </div>
    </div>
  );
}
