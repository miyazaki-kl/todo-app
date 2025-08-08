import { getColorClasses, getSizeClasses, BadgeColor, BadgeSize } from '@/app/lib/colors';

interface BaseBadgeProps {
  text: string;
  color: string;
  size?: BadgeSize;
  className?: string;
}

export default function BaseBadge({ 
  text, 
  color, 
  size = 'medium', 
  className = '' 
}: BaseBadgeProps) {
  const colorClass = getColorClasses(color);
  const sizeClass = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass} ${className}`}>
      {text}
    </span>
  );
}