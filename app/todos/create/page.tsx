'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TodoForm from '../../components/TodoForm';

export default function CreateTodoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();

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

  const handleTodoCreated = () => {
    // TODO作成後はメインページに戻る
    router.push('/');
  };

  const handleCancel = () => {
    // キャンセル時もメインページに戻る
    router.push('/');
  };

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>ログインページにリダイレクトしています...</p>
    </div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">新しいTodoを作成</h1>
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
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <TodoForm onTodoCreated={handleTodoCreated} />
          
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={handleCancel}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}