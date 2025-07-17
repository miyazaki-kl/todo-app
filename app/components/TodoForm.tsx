'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import LabelSelector from './LabelSelector';
import ProjectSelector from './ProjectSelector';

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface TodoFormProps {
  onTodoCreated: () => void;
  onTodoDeleted?: (id: string) => void;
  todoId?: string;
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
  onTodoDeleted, 
  todoId, 
  initialData, 
  isEditMode = false, 
  onTodoUpdated 
}: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [assignedToId, setAssignedToId] = useState<number | null>(initialData?.assignedToId || null);
  const [projectId, setProjectId] = useState<number | null>(initialData?.projectId || null);
  const [completed, setCompleted] = useState(initialData?.completed || false);
  const [labelIds, setLabelIds] = useState<number[]>(initialData?.labelIds || []);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // ユーザー一覧を取得
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const userData = await response.json();
          setUsers(userData);
        }
      } catch (error) {
        console.error('ユーザー一覧の取得エラー:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && todoId) {
        // 編集モード
        const response = await fetch(`/api/todos/${todoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            title, 
            description, 
            assignedToId: assignedToId || null,
            projectId: projectId || null,
            completed: completed,
            labelIds: labelIds
          }),
        });

        if (!response.ok) {
          throw new Error('Todoの更新に失敗しました');
        }

        if (onTodoUpdated) {
          onTodoUpdated();
        }
      } else {
        // 作成モード
        const userStr = localStorage.getItem('user');
        let createdById = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            createdById = user.id;
          } catch (error) {
            console.error('ユーザー情報の解析エラー:', error);
          }
        }

        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            title, 
            description, 
            createdById,
            assignedToId: assignedToId || null,
            projectId: projectId || null,
            labelIds: labelIds
          }),
        });

        if (!response.ok) {
          throw new Error('Todoの作成に失敗しました');
        }

        setTitle('');
        setDescription('');
        setAssignedToId(null);
        setProjectId(null);
        setCompleted(false);
        setLabelIds([]);
        onTodoCreated();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(isEditMode ? 'Todoの更新に失敗しました' : 'Todoの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!todoId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Todoの削除に失敗しました');
      }

      if (onTodoDeleted) {
        onTodoDeleted(todoId);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Todoの削除に失敗しました');
    } finally {
      setIsDeleting(false);
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
      <ProjectSelector
        selectedProjectId={projectId}
        onProjectChange={setProjectId}
      />
      <LabelSelector
        selectedLabelIds={labelIds}
        onLabelsChange={setLabelIds}
      />
      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
{isLoading ? (isEditMode ? '更新中...' : '作成中...') : (isEditMode ? 'Todoを更新' : 'Todoを作成')}
        </button>
        {todoId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>
    </form>
  );
} 