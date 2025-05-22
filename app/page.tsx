'use client';

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
                <h3 className="text-lg font-medium">{todo.title}</h3>
                {todo.description && (
                  <p className="text-gray-600 mt-2">{todo.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  作成日: {new Date(todo.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
} 