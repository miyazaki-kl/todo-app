'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Project } from '@/app/types/todo';
import ProjectBadge from '@/app/components/ProjectBadge';
import TodoForm from '@/app/components/TodoForm';

export default function CreateProjectTodo() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('プロジェクトの取得に失敗しました');
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error:', error);
      alert('プロジェクトの取得に失敗しました');
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

  const handleTodoCreated = () => {
    router.push(`/projects/${projectId}/todos`);
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

    fetchProject();
  }, [router, projectId]);

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>ログインページにリダイレクトしています...</p>
    </div>;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>読み込み中...</p>
    </div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* ブレッドクラム */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => router.push('/')}
          className="hover:text-gray-900"
        >
          プロジェクト
        </button>
        <span>→</span>
        {project && <ProjectBadge project={project} />}
        <span>→</span>
        <button 
          onClick={() => router.push(`/projects/${projectId}/todos`)}
          className="hover:text-gray-900"
        >
          Todo一覧
        </button>
        <span>→</span>
        <span className="text-gray-900">新規作成</span>
      </nav>

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            {project && <ProjectBadge project={project} />}
          </div>
          <h1 className="text-3xl font-bold">
            {project ? `${project.name} - Todo作成` : 'Todo作成'}
          </h1>
          {project?.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>
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
            onClick={() => router.push('/profile')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            プロフィール設定
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* Todo作成フォーム */}
      <div className="max-w-2xl">
        <TodoForm 
          projectId={parseInt(projectId)}
          onTodoCreated={handleTodoCreated}
          onCancel={() => router.push(`/projects/${projectId}/todos`)}
        />
      </div>
    </main>
  );
}