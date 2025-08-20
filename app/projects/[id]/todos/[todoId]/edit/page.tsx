'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Todo, Project } from '@/app/types/todo';
import TodoForm from '@/app/components/TodoForm';
import { apiClient } from '@/app/lib/api-client';

export default function EditTodoPage() {
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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    router.push('/login');
  };

  const handleTodoUpdated = () => {
    router.push(`/projects/${projectId}/todos/${todoId}`);
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
  }, [router, projectId, todoId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!todo || !project) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>データが見つかりません</p>
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
        <span className="font-medium">{project.name}</span>
        <span>→</span>
        <button 
          onClick={() => router.push(`/projects/${projectId}/todos`)}
          className="hover:text-gray-900"
        >
          Todo一覧
        </button>
        <span>→</span>
        <button 
          onClick={() => router.push(`/projects/${projectId}/todos/${todoId}`)}
          className="hover:text-gray-900"
        >
          {todo.title}
        </button>
        <span>→</span>
        <span className="text-gray-900">編集</span>
      </nav>

      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Todo編集</h1>
          <p className="text-gray-600 mt-1">「{todo.title}」の編集</p>
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

      {/* Todo編集フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <TodoForm
          projectId={parseInt(projectId)}
          todoId={todoId}
          initialData={{
            title: todo.title,
            description: todo.description || '',
            completed: todo.completed,
            assignedToId: todo.assignedTo?.id || null,
            labelIds: todo.labels?.map(label => label.label.id) || [],
            dueDate: todo.dueDate
          }}
          isEditMode={true}
          onTodoCreated={() => {}} // 編集モードでは使用されない
          onTodoUpdated={handleTodoUpdated}
          onCancel={() => router.push(`/projects/${projectId}/todos/${todoId}`)}
        />
      </div>
    </main>
  );
}