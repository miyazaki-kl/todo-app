import React from 'react';
import { Label } from '../types/todo';

interface LabelBadgeProps {
  label: Label;
  size?: 'sm' | 'md';
}

const colorClasses = {
  red: 'bg-red-100 text-red-800',
  orange: 'bg-orange-100 text-orange-800',
  blue: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  green: 'bg-green-100 text-green-800',
  gray: 'bg-gray-100 text-gray-800',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1.5 text-sm',
};

export default function LabelBadge({ label, size = 'sm' }: LabelBadgeProps) {
  const colorClass = colorClasses[label.color as keyof typeof colorClasses] || colorClasses.gray;
  const sizeClass = sizeClasses[size];

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass}`}>
      {label.name}
    </span>
  );
}