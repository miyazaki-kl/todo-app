'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/app/types/todo';
import ProjectForm from '@/app/components/ProjectForm';
import ProjectBadge from '@/app/components/ProjectBadge';
import { apiClient } from '@/app/lib/api-client';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string | null, isAdmin?: boolean} | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const data = await apiClient.get<Project[]>('/api/projects');
      setProjects(data);
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
    localStorage.removeItem('authToken');
    apiClient.clearAuthToken();
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

    fetchProjects();
  }, [router]);

  const handleProjectCreated = () => {
    fetchProjects();
    setShowCreateForm(false);
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    setEditingProject(null);
  };

  const handleProjectDeleted = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setEditingProject(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>ログインページにリダイレクトしています...</p>
    </div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト選択</h1>
          <p className="text-gray-600 mt-1">作業するプロジェクトを選択してください</p>
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
            onClick={() => router.push('/mypage')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            マイページ
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            プロフィール設定
          </button>
          {currentUser?.isAdmin && (
            <button
              onClick={() => router.push('/admin/users')}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              ユーザー管理
            </button>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          新しいプロジェクトを作成
        </button>
      </div>

      {/* プロジェクト作成フォーム */}
      {showCreateForm && (
        <div className="mb-8">
          <ProjectForm
            onProjectCreated={handleProjectCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* プロジェクト編集フォーム */}
      {editingProject && (
        <div className="mb-8">
          <ProjectForm
            projectId={editingProject.id}
            initialData={{
              name: editingProject.name,
              description: editingProject.description || '',
              color: editingProject.color,
            }}
            isEditMode={true}
            onProjectUpdated={handleProjectUpdated}
            onProjectDeleted={handleProjectDeleted}
            onCancel={() => setEditingProject(null)}
          />
        </div>
      )}

      {/* プロジェクト一覧 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">利用可能なプロジェクト</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">まだプロジェクトがありません。</p>
            <p className="text-gray-400 text-sm mt-1">上のボタンから新しいプロジェクトを作成してください。</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}/todos`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ProjectBadge project={project} />
                      <span className="text-sm text-gray-500">
                        ID: {project.id}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-600 mb-3">{project.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        作成日: {formatDate(project.createdAt)}
                      </span>
                      {project.createdBy && (
                        <span>
                          作成者: {project.createdBy.name || project.createdBy.email}
                        </span>
                      )}
                      <span>
                        Todo数: {(project as any)._count?.todos || 0}件
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      設定
                    </button>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}