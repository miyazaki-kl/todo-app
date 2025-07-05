'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Todo } from '../../types/todo';
import TodoForm from '../../components/TodoForm';

export default function TodoDetail({ params }: { params: { id: string } }) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${params.id}`);
        if (!response.ok) {
          throw new Error('Todoの取得に失敗しました');
        }
        const data = await response.json();
        setTodo(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Todoの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodo();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('このTodoを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/todos/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Todoの削除に失敗しました');
      }

      router.push('/');
    } catch (error) {
      console.error('Error:', error);
      alert('Todoの削除に失敗しました');
    }
  };

  const handleTodoUpdated = () => {
    // Todo更新後は詳細画面を再読み込み
    const fetchTodo = async () => {
      try {
        const response = await fetch(`/api/todos/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setTodo(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchTodo();
    setIsEditMode(false);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!todo) {
    return (
      <main className="container mx-auto px-4 py-8">
        <p>Todoが見つかりませんでした</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← 一覧に戻る
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {isEditMode ? (
            <div>
              <h1 className="text-3xl font-bold mb-6">Todoを編集</h1>
              <TodoForm
                initialData={{
                  title: todo.title,
                  description: todo.description || '',
                  assignedToId: todo.assignedToId,
                }}
                isEditMode={true}
                todoId={params.id}
                onTodoCreated={() => {}}
                onTodoUpdated={handleTodoUpdated}
              />
              <div className="mt-4">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-4">{todo.title}</h1>
              
              {todo.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">説明</h2>
                  <p className="text-gray-700">{todo.description}</p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">ステータス</h2>
                <p className="text-gray-700">
                  {todo.completed ? '完了' : '未完了'}
                </p>
              </div>

              {todo.createdBy && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">作成者</h2>
                  <p className="text-gray-700">
                    {todo.createdBy.name || todo.createdBy.email}
                  </p>
                </div>
              )}

              {todo.assignedTo && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">担当者</h2>
                  <p className="text-gray-700">
                    {todo.assignedTo.name || todo.assignedTo.email}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">作成日時</h2>
                <p className="text-gray-700">
                  {new Date(todo.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">更新日時</h2>
                <p className="text-gray-700">
                  {new Date(todo.updatedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  削除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 