export interface Label {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
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
  labels?: {
    label: Label;
  }[];
} 