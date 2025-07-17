'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '../types/todo';

interface ProjectSelectorProps {
  selectedProjectId: number | null;
  onProjectChange: (projectId: number | null) => void;
}

export default function ProjectSelector({ selectedProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('プロジェクトの取得に失敗しました');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onProjectChange(value ? parseInt(value) : null);
  };

  if (isLoading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          プロジェクト
        </label>
        <div className="mt-1 text-sm text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">
          プロジェクト
        </label>
        <div className="mt-1 text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="project" className="block text-sm font-medium text-gray-700">
        プロジェクト
      </label>
      <select
        id="project"
        value={selectedProjectId || ''}
        onChange={handleProjectChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">プロジェクトなし</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}