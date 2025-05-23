'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TodoDetail({ params }: { params: { id: string } }) {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

          <div className="flex justify-end">
            <button
              onClick={handleDelete}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 