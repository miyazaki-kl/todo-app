'use client';

import { useApiData } from '@/app/hooks/useApiData';
import LabelBadge from './LabelBadge';
import { Label } from '@/app/types/todo';

interface LabelSelectorProps {
  selectedLabelIds: number[];
  onLabelsChange: (labelIds: number[]) => void;
}

export default function LabelSelector({ selectedLabelIds, onLabelsChange }: LabelSelectorProps) {
  const { data: availableLabels, isLoading, error } = useApiData<Label[]>('/api/labels');

  const handleLabelToggle = (labelId: number) => {
    if (selectedLabelIds.includes(labelId)) {
      onLabelsChange(selectedLabelIds.filter(id => id !== labelId));
    } else {
      onLabelsChange([...selectedLabelIds, labelId]);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">ラベルを読み込み中...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ラベル
      </label>
      <div className="space-y-2">
        {availableLabels?.map((label) => (
          <label key={label.id} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedLabelIds.includes(label.id)}
              onChange={() => handleLabelToggle(label.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
            />
            <LabelBadge label={label} size="md" />
          </label>
        ))}
      </div>
    </div>
  );
}