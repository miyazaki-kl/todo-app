'use client';

import React from 'react';
import { Project } from '../types/todo';

interface ProjectBadgeProps {
  project: Project;
  size?: 'small' | 'medium' | 'large';
}

export default function ProjectBadge({ project, size = 'medium' }: ProjectBadgeProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'pink':
        return 'bg-pink-100 text-pink-800';
      case 'gray':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'medium':
        return 'px-2.5 py-1.5 text-sm';
      case 'large':
        return 'px-3 py-2 text-base';
      default:
        return 'px-2.5 py-1.5 text-sm';
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${getColorClasses(project.color)} ${getSizeClasses(size)}`}
    >
      {project.name}
    </span>
  );
}