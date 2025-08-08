'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Todo } from '@/app/types/todo';
import LabelBadge from '@/app/components/LabelBadge';
import ProjectBadge from '@/app/components/ProjectBadge';

export default function MyPage() {
  const [assignedTodos, setAssignedTodos] = useState<Todo[]>([]);
  const [createdTodos, setCreatedTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null} | null>(null);
  const router = useRouter();

  const fetchMyTodos = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      // 担当しているTODOを取得
      const assignedResponse = await fetch(`/api/todos?assignedToId=${currentUser.id}`);
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json();
        setAssignedTodos(assignedData);
      }
      
      // 作成したTODOを取得
      const createdResponse = await fetch(`/api/todos?createdById=${currentUser.id}`);
      if (createdResponse.ok) {
        const createdData = await createdResponse.json();
        setCreatedTodos(createdData);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 認証状態チェック
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (error) {
        console.error('ユーザー情報の解析エラー:', error);
        router.push('/login');
        return;
      }
    } else {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchMyTodos();
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTodoClick = (todo: Todo) => {
    if (todo.project?.id) {
      router.push(`/projects/${todo.project.id}/todos/${todo.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTodoList = (todos: Todo[], title: string, emptyMessage: string) => (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{todos.length}件</p>
      </div>

      {todos.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleTodoClick(todo)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.title}
                    </h3>
                    {todo.completed && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        完了
                      </span>
                    )}
                  </div>
                  
                  {todo.description && (
                    <p className="text-gray-600 mb-3">{todo.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-3">
                    {todo.project && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">プロジェクト:</span>
                        <ProjectBadge project={todo.project} />
                      </div>
                    )}
                  </div>
                  
                  {todo.labels && todo.labels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {todo.labels.map((labelRelation) => (
                        <LabelBadge key={labelRelation.label.id} label={labelRelation.label} />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>作成日: {formatDate(todo.createdAt)}</span>
                    {todo.createdBy && (
                      <span>作成者: {todo.createdBy.name || todo.createdBy.email}</span>
                    )}
                    {todo.assignedTo && (
                      <span>担当: {todo.assignedTo.name || todo.assignedTo.email}</span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex items-center">
                  <div className="text-gray-400">→</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ログインしていない場合
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>ログインページにリダイレクトしています...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">マイページ</h1>
          <p className="text-gray-600 mt-1">
            {currentUser.name || currentUser.email}さんのTODO一覧
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            プロジェクト一覧に戻る
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      ) : (
        <div>
          {/* 担当しているTODO（優先表示） */}
          {renderTodoList(
            assignedTodos, 
            "担当しているTODO", 
            "現在担当しているTODOはありません。"
          )}
          
          {/* 作成したTODO */}
          {renderTodoList(
            createdTodos.filter(todo => !assignedTodos.some(assigned => assigned.id === todo.id)),
            "作成したTODO", 
            "作成したTODOはありません。"
          )}
        </div>
      )}
    </main>
  );
}