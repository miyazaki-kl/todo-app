'use client';

import React from 'react';
import { useState, useEffect } from 'react';
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
      // 現在のユーザーIDを取得してクエリパラメータとして送信
      let url = '/api/todos';
      if (currentUser?.id) {
        url += `?currentUserId=${currentUser.id}`;
      }
      
      const response = await fetch(url);
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
  }, [router]);

  // currentUserが設定された後にTodoを取得
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchTodos();
    }
  }, [currentUser, isLoggedIn]);

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
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Todo一覧</h2>
        <button
          onClick={() => router.push('/todos/create')}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          新規作成
        </button>
      </div>
      
      <div>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : todos.length === 0 ? (
          <p>Todoがありません</p>
        ) : (
          <ul className="space-y-4">
            {todos.map((todo) => {
              const isAssignedToCurrentUser = currentUser && todo.assignedTo?.id === currentUser.id;
              return (
                <li
                  key={todo.id}
                  className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                    isAssignedToCurrentUser 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white'
                  }`}
                >
                  <div className="cursor-pointer" onClick={() => router.push(`/todos/${todo.id}`)}>
                    <div className="flex items-center gap-2 mb-1">
                      {isAssignedToCurrentUser && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          👤 担当中
                        </span>
                      )}
                      {todo.completed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ 完了
                        </span>
                      )}
                      <h3 className="text-lg font-medium">{todo.title}</h3>
                    </div>
                    {todo.description && (
                      <p className="text-gray-600 mt-2">{todo.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      <p>作成日: {new Date(todo.createdAt).toLocaleString()}</p>
                      <p>更新日: {new Date(todo.updatedAt).toLocaleString()}</p>
                      {todo.createdBy && (
                        <p>作成者: {todo.createdBy.name || todo.createdBy.email}</p>
                      )}
                      {todo.assignedTo && (
                        <p className={isAssignedToCurrentUser ? 'font-medium text-blue-700' : ''}>
                          担当者: {todo.assignedTo.name || todo.assignedTo.email}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
} 