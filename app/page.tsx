'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import TodoForm from './components/TodoForm';
import { useRouter } from 'next/navigation';
import { Todo } from './types/todo';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push('/login');
  };

  useEffect(() => {
    // 認証状態チェック
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    
    // ユーザー情報の取得
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('ユーザー情報の解析エラー:', error);
      }
    }
    
    fetchTodos();
  }, [router]);

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>ログインページにリダイレクトしています...</p>
    </div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Todoアプリ</h1>
        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">ログイン中: </span>
              <span className="text-gray-900">
                {currentUser.name || currentUser.email}
              </span>
              {currentUser.name && (
                <span className="text-gray-500 ml-1">({currentUser.email})</span>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ログアウト
          </button>
        </div>
      </div>
      
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
                  <div className="flex-1 cursor-pointer" onClick={() => router.push(`/todos/${todo.id}`)}>
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