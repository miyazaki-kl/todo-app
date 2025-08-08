'use client';

import { useState } from 'react';
import { useCreateProject, useUpdateProject, useDeleteProject } from '@/app/hooks/useProject';
import { Project } from '@/app/types/todo';
import { apiClient } from '@/app/lib/api-client';

interface ProjectFormProps {
  onProjectCreated?: () => void;
  onProjectUpdated?: () => void;
  onProjectDeleted?: (id: number) => void;
  projectId?: number;
  initialData?: {
    name: string;
    description?: string;
    color: string;
  };
  isEditMode?: boolean;
  onCancel?: () => void;
}

const PROJECT_COLORS = [
  { value: 'blue', label: '青', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'green', label: '緑', className: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'purple', label: '紫', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'pink', label: 'ピンク', className: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'indigo', label: '藍', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'orange', label: 'オレンジ', className: 'bg-orange-100 text-orange-800 border-orange-200' },
];

export default function ProjectForm({
  onProjectCreated,
  onProjectUpdated,
  onProjectDeleted,
  projectId,
  initialData,
  isEditMode = false,
  onCancel,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [color, setColor] = useState(initialData?.color || 'blue');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode && projectId) {
        // 編集モード
        await apiClient.put(`/api/projects/${projectId}`, {
          name,
          description: description || null,
          color,
        });

        

        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        // 作成モード
        const userStr = localStorage.getItem('user');
        let createdById = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            createdById = user.id;
          } catch (error) {
            console.error('ユーザー情報の解析エラー:', error);
          }
        }

        await apiClient.post('/api/projects', {
          name,
          description: description || null,
          color,
          createdById,
        });

        

        // フォームをリセット
        setName('');
        setDescription('');
        setColor('blue');

        if (onProjectCreated) {
          onProjectCreated();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(isEditMode ? 'プロジェクトの更新に失敗しました' : 'プロジェクトの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId || !confirm('このプロジェクトを削除しますか？関連するTodoも削除される可能性があります。')) return;

    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/projects/${projectId}`);

      

      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('プロジェクトの削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
  };

  const getColorPreview = (colorValue: string) => {
    const colorConfig = PROJECT_COLORS.find(c => c.value === colorValue);
    return colorConfig ? colorConfig.className : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {isEditMode ? 'プロジェクトを編集' : '新しいプロジェクトを作成'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            プロジェクト名 *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="プロジェクト名を入力"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="プロジェクトの説明を入力（任意）"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カラー
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PROJECT_COLORS.map((colorOption) => (
              <label
                key={colorOption.value}
                className={`
                  flex items-center justify-center p-3 rounded-md border-2 cursor-pointer transition-all
                  ${color === colorOption.value 
                    ? `${colorOption.className} border-current ring-2 ring-offset-2 ring-current` 
                    : `${colorOption.className} border-gray-200 hover:border-gray-300`
                  }
                `}
              >
                <input
                  type="radio"
                  name="color"
                  value={colorOption.value}
                  checked={color === colorOption.value}
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{colorOption.label}</span>
              </label>
            ))}
          </div>
          
          {/* カラープレビュー */}
          <div className="mt-2">
            <span className="text-sm text-gray-600">プレビュー: </span>
            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getColorPreview(color)}`}>
              {name || 'プロジェクト名'}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
          )}
          
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? '削除中...' : '削除'}
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading 
              ? (isEditMode ? '更新中...' : '作成中...') 
              : (isEditMode ? '更新' : '作成')
            }
          </button>
        </div>
      </form>
    </div>
  );
}