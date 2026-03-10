import './Tag.css';

interface TagProps {
  label: string;
  active?: boolean;
}

export function Tag({ label, active = false }: TagProps) {
  return <span className={`tag${active ? ' tag-active' : ''}`}>{label}</span>;
}
