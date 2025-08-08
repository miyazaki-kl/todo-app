'use client';

import { useApiData, useApiMutation } from './useApiData';
import { apiClient } from '@/app/lib/api-client';
import { getCurrentUserId } from '@/app/lib/user-utils';
import { Todo } from '@/app/types/todo';

export interface CreateTodoData {
  title: string;
  description?: string;
  assignedToId?: number | null;
  projectId?: number | null;
  labelIds?: number[];
}

export interface UpdateTodoData extends CreateTodoData {
  id: number;
  completed?: boolean;
}

export interface TodoFilters {
  projectId?: number;
  assignedToId?: number;
  createdById?: number;
  currentUserId?: number;
}

export function useTodos(filters: TodoFilters = {}) {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const endpoint = queryString ? `/todos?${queryString}` : '/todos';

  return useApiData<Todo[]>(endpoint);
}

export function useTodo(id: number | null) {
  return useApiData<Todo>(
    id ? `/todos/${id}` : '',
    { enabled: !!id }
  );
}

export function useCreateTodo() {
  return useApiMutation<Todo, CreateTodoData>(
    async (data) => {
      const createdById = getCurrentUserId();
      return apiClient.post<Todo>('/todos', {
        ...data,
        createdById,
      });
    }
  );
}

export function useUpdateTodo() {
  return useApiMutation<Todo, UpdateTodoData>(
    async ({ id, ...data }) => {
      return apiClient.put<Todo>(`/todos/${id}`, data);
    }
  );
}

export function useToggleTodoComplete() {
  return useApiMutation<Todo, { todo: Todo }>(
    async ({ todo }) => {
      return apiClient.put<Todo>(`/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed,
      });
    }
  );
}

export function useDeleteTodo() {
  return useApiMutation<void, number>(
    async (id) => {
      return apiClient.delete<void>(`/todos/${id}`);
    }
  );
}