'use client';

import { useApiData, useApiMutation } from './useApiData';
import { apiClient } from '@/app/lib/password';
import { getCurrentUserId } from '@/app/lib/user-utils';
import { Project } from '@/app/types/todo';

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectData extends CreateProjectData {
  id: number;
}

export function useProjects() {
  return useApiData<Project[]>('/projects');
}

export function useProject(id: number | null) {
  return useApiData<Project>(
    id ? `/projects/${id}` : '',
    { enabled: !!id }
  );
}

export function useCreateProject() {
  return useApiMutation<Project, CreateProjectData>(
    async (data) => {
      const createdById = getCurrentUserId();
      return apiClient.post<Project>('/projects', {
        ...data,
        color: data.color || 'blue',
        createdById,
      });
    }
  );
}

export function useUpdateProject() {
  return useApiMutation<Project, UpdateProjectData>(
    async ({ id, ...data }) => {
      return apiClient.put<Project>(`/projects/${id}`, data);
    }
  );
}

export function useDeleteProject() {
  return useApiMutation<void, number>(
    async (id) => {
      return apiClient.delete<void>(`/projects/${id}`);
    }
  );
}