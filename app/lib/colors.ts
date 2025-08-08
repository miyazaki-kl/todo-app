export type BadgeColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';

export const colorClasses: Record<BadgeColor, string> = {
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  gray: 'bg-gray-100 text-gray-800',
};

export const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
  lg: 'px-3 py-2 text-base',
  small: 'px-2 py-1 text-xs',
  medium: 'px-2.5 py-1.5 text-sm',
  large: 'px-3 py-2 text-base',
};

export const getColorClasses = (color: string): string => {
  return colorClasses[color as BadgeColor] || colorClasses.gray;
};

export const getSizeClasses = (size: string): string => {
  return sizeClasses[size as BadgeSize] || sizeClasses.medium;
};