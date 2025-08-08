'use client';

import { useProjects } from '@/app/hooks/useProject';

interface ProjectSelectorProps {
  selectedProjectId: number | null;
  onProjectChange: (projectId: number | null) => void;
}

export default function ProjectSelector({ selectedProjectId, onProjectChange }: ProjectSelectorProps) {
  const { data: projects, isLoading, error } = useProjects();

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
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">プロジェクトを選択</option>
        {projects?.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}