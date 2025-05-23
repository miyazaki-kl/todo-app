'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';

interface Todo {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Todoの取得に失敗しました');
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Todoの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Todoの削除に失敗しました');
      }

      // 削除成功後、Todo一覧を更新
      fetchTodos();
    } catch (error) {
      console.error('Error:', error);
      alert('Todoの削除に失敗しました');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Todoアプリ</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">新しいTodoを作成</h2>
        <TodoForm onTodoCreated={fetchTodos} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Todo一覧</h2>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : todos.length === 0 ? (
          <p>Todoがありません</p>
        ) : (
          <ul className="space-y-4">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{todo.title}</h3>
                    {todo.description && (
                      <p className="text-gray-600 mt-2">{todo.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      作成日: {new Date(todo.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
} 