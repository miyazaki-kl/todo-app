import BaseBadge from './BaseBadge';
import { Project } from '@/app/types/todo';

interface ProjectBadgeProps {
  project: Project;
  size?: 'small' | 'medium' | 'large';
}

export default function ProjectBadge({ project, size = 'medium' }: ProjectBadgeProps) {
  return <BaseBadge text={project.name} color={project.color} size={size} />;
}