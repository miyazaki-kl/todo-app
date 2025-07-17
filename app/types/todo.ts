export interface Label {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string;
  createdById: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
}

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  createdById?: number | null;
  assignedToId?: number | null;
  projectId?: number | null;
  createdBy?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  assignedTo?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  project?: Project | null;
  labels?: {
    label: Label;
  }[];
} 