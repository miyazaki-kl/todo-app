import BaseBadge from './BaseBadge';
import { Label } from '@/app/types/todo';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md';
}

export default function LabelBadge({ label, size = 'sm' }: LabelBadgeProps) {
  return <BaseBadge text={label.name} color={label.color} size={size} />;
}