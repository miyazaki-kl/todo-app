'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Todo, Project } from '@/app/types/todo';
import LabelBadge from '@/app/components/LabelBadge';
import ProjectBadge from '@/app/components/ProjectBadge';
import { apiClient } from '@/app/lib/api-client';

export default function ProjectTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const fetchProject = async () => {
    try {
      const data = await apiClient.get<Project>(`/api/projects/${projectId}`);
      setProject(data);
    } catch (error) {
      console.error('Error:', error);
      alert('プロジェクトの取得に失敗しました');
    }
  };

  const fetchTodos = async () => {
    try {
      let url = `/api/todos?projectId=${projectId}`;
      if (currentUser?.id) {
        url += `&currentUserId=${currentUser.id}`;
      }
      
      const data = await apiClient.get<Todo[]>(url);
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

    fetchProject();
  }, [router, projectId]);

  // currentUserが設定された後にTodoを取得
  useEffect(() => {
    if (isLoggedIn && currentUser && project) {
      fetchTodos();
    }
  }, [currentUser, isLoggedIn, project]);

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>ログインページにリダイレクトしています...</p>
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
        <span className="text-gray-900">Todo一覧</span>
      </nav>

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-4 mb-2">
            {project && <ProjectBadge project={project} />}
          </div>
          <h1 className="text-3xl font-bold">
            {project ? `${project.name} - Todo一覧` : 'Todo一覧'}
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
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Todo一覧</h2>
        <button
          onClick={() => router.push(`/projects/${projectId}/todos/create`)}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          新規作成
        </button>
      </div>
      
      <div>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : todos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">このプロジェクトにはまだTodoがありません</p>
            <button
              onClick={() => router.push(`/projects/${projectId}/todos/create`)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              最初のTodoを作成する
            </button>
          </div>
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
                  <div className="cursor-pointer" onClick={() => router.push(`/projects/${projectId}/todos/${todo.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
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
                          <p className="text-gray-600 mt-1 mb-2">{todo.description}</p>
                        )}
                        {todo.labels && todo.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {todo.labels.map((labelRelation) => (
                              <LabelBadge key={labelRelation.label.id} label={labelRelation.label} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 text-right ml-4 flex-shrink-0">
                        {todo.assignedTo && (
                          <div className={`mb-1 ${isAssignedToCurrentUser ? 'font-medium text-blue-700' : ''}`}>
                            担当: {todo.assignedTo.name || todo.assignedTo.email}
                          </div>
                        )}
                        <div>作成: {todo.createdBy?.name || todo.createdBy?.email || '不明'}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <div className="flex gap-4">
                        <span>作成: {new Date(todo.createdAt).toLocaleDateString()}</span>
                        <span>更新: {new Date(todo.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        {new Date(todo.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
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