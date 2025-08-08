'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Todo, Project } from '@/app/types/todo';
import LabelBadge from '@/app/components/LabelBadge';
import ProjectBadge from '@/app/components/ProjectBadge';
import { apiClient } from '@/app/lib/api-client';

export default function ProjectTodoDetail() {
  const [todo, setTodo] = useState<Todo | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const todoId = params.todoId as string;

  const fetchProject = async () => {
    try {
      const data = await apiClient.get<Project>(`/api/projects/${projectId}`);
      
      setProject(data);
    } catch (error) {
      console.error('Error:', error);
      alert('プロジェクトの取得に失敗しました');
    }
  };

  const fetchTodo = async () => {
    try {
      const data = await apiClient.get<Todo>(`/api/todos/${todoId}`);
      
      // プロジェクトIDが一致しない場合はエラー
      if (data.projectId !== parseInt(projectId)) {
        throw new Error('指定されたプロジェクトにこのTodoは存在しません');
      }
      
      setTodo(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Todoの取得に失敗しました');
      router.push(`/projects/${projectId}/todos`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = async () => {
    if (!todo) return;

    try {
      const updatedTodo = await apiClient.put<Todo>(`/api/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed,
      });

      
      setTodo(updatedTodo);
    } catch (error) {
      console.error('Error:', error);
      alert('Todo更新に失敗しました');
    }
  };

  const deleteTodo = async () => {
    if (!todo) return;

    if (!confirm('このTodoを削除しますか？')) {
      return;
    }

    try {
      await apiClient.delete(`/api/todos/${todo.id}`);

      

      alert('Todoを削除しました');
      router.push(`/projects/${projectId}/todos`);
    } catch (error) {
      console.error('Error:', error);
      alert('Todo削除に失敗しました');
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
    fetchTodo();
  }, [router, projectId, todoId]);

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

  if (!todo) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Todoが見つかりません</p>
    </div>;
  }

  const isAssignedToCurrentUser = currentUser && todo.assignedTo?.id === currentUser.id;

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
        <span className="text-gray-900">{todo.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            {project && <ProjectBadge project={project} />}
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
          </div>
          <h1 className="text-3xl font-bold mb-2">{todo.title}</h1>
          {todo.labels && todo.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {todo.labels.map((labelRelation) => (
                <LabelBadge key={labelRelation.label.id} label={labelRelation.label} />
              ))}
            </div>
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

      {/* Todo詳細 */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        {todo.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">説明</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{todo.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">ステータス</h3>
            <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              todo.completed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {todo.completed ? '✅ 完了' : '🔄 進行中'}
            </p>
          </div>

          {todo.assignedTo && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">担当者</h3>
              <p className={`text-sm ${isAssignedToCurrentUser ? 'font-medium text-blue-700' : 'text-gray-600'}`}>
                {todo.assignedTo.name || todo.assignedTo.email}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">作成者</h3>
            <p className="text-sm text-gray-600">
              {todo.createdBy?.name || todo.createdBy?.email || '不明'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">作成日時</h3>
            <p className="text-sm text-gray-600">
              {new Date(todo.createdAt).toLocaleString('ja-JP')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">更新日時</h3>
            <p className="text-sm text-gray-600">
              {new Date(todo.updatedAt).toLocaleString('ja-JP')}
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleComplete}
          className={`inline-flex justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            todo.completed
              ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-500'
              : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500'
          }`}
        >
          {todo.completed ? '未完了にする' : '完了にする'}
        </button>

        <button
          onClick={() => router.push(`/projects/${projectId}/todos/${todo.id}/edit`)}
          className="inline-flex justify-center rounded-md border border-indigo-300 bg-indigo-50 py-2 px-4 text-sm font-medium text-indigo-700 shadow-sm hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          編集
        </button>

        <button
          onClick={deleteTodo}
          className="inline-flex justify-center rounded-md border border-red-300 bg-red-50 py-2 px-4 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          削除
        </button>
      </div>
    </main>
  );
}