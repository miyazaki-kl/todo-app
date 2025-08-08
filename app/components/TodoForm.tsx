'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useApiData } from '@/app/hooks/useApiData';
import { useCreateTodo, useUpdateTodo, useDeleteTodo } from '@/app/hooks/useTodo';
import LabelSelector from './LabelSelector';
import ProjectSelector from './ProjectSelector';
import { Todo } from '@/app/types/todo';

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface TodoFormProps {
  onTodoCreated: () => void;
  onCancel?: () => void;
  onTodoDeleted?: (id: string) => void;
  todoId?: string;
  projectId?: number;
  initialData?: {
    title: string;
    description: string;
    assignedToId?: number | null;
    projectId?: number | null;
    completed?: boolean;
    labelIds?: number[];
  };
  isEditMode?: boolean;
  onTodoUpdated?: () => void;
}

export default function TodoForm({ 
  onTodoCreated, 
  onCancel,
  onTodoDeleted, 
  todoId,
  projectId,
  initialData, 
  isEditMode = false, 
  onTodoUpdated 
}: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assignedToId, setAssignedToId] = useState<number | null>(initialData?.assignedToId || null);
  const [formProjectId, setFormProjectId] = useState<number | null>(
    projectId || initialData?.projectId || null
  );
  const [completed, setCompleted] = useState(initialData?.completed || false);
  const [labelIds, setLabelIds] = useState<number[]>(initialData?.labelIds || []);
  
  // 新しいフックを使用
  const { data: users } = useApiData<User[]>('/users');
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const todoData = {
        title,
        description,
        assignedToId: assignedToId || null,
        projectId: formProjectId || null,
        completed,
        labelIds,
      };

      if (isEditMode && todoId) {
        await updateTodo.mutate({
          id: parseInt(todoId),
          ...todoData,
        });
        onTodoUpdated?.();
      } else {
        await createTodo.mutate(todoData);
        // フォームリセット
        setTitle('');
        setDescription('');
        setAssignedToId(null);
        if (!projectId) {
          setFormProjectId(null);
        }
        setCompleted(false);
        setLabelIds([]);
        onTodoCreated();
      }
    } catch (error) {
      // エラーはフック内でハンドルされる
    }
  };

  const handleDelete = async () => {
    if (!todoId) return;
    
    try {
      await deleteTodo.mutate(parseInt(todoId));
      onTodoDeleted?.(todoId);
    } catch (error) {
      // エラーはフック内でハンドルされる
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
          担当者
        </label>
        <select
          id="assignedTo"
          value={assignedToId || ''}
          onChange={(e) => setAssignedToId(e.target.value ? parseInt(e.target.value) : null)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">担当者なし</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>
      {isEditMode && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            ステータス
          </label>
          <select
            id="status"
            value={completed ? 'completed' : 'pending'}
            onChange={(e) => setCompleted(e.target.value === 'completed')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="pending">未完了</option>
            <option value="completed">完了</option>
          </select>
        </div>
      )}
      {!projectId && (
        <ProjectSelector
          selectedProjectId={formProjectId}
          onProjectChange={setFormProjectId}
        />
      )}
      <LabelSelector
        selectedLabelIds={labelIds}
        onLabelsChange={setLabelIds}
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={createTodo.isLoading || updateTodo.isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
{isLoading ? (isEditMode ? '更新中...' : '作成中...') : (isEditMode ? 'Todoを更新' : 'Todoを作成')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            キャンセル
          </button>
        )}
        {todoId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteTodo.isLoading}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {deleteTodo.isLoading ? '削除中...' : '削除'}
          </button>
        )}
      </div>
    </form>
  );
} 