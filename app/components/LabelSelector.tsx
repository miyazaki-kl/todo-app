import React, { useState, useEffect } from 'react';
import { Label } from '../types/todo';
import LabelBadge from './LabelBadge';

interface LabelSelectorProps {
  selectedLabelIds: number[];
  onLabelsChange: (labelIds: number[]) => void;
}

export default function LabelSelector({ selectedLabelIds, onLabelsChange }: LabelSelectorProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await fetch('/api/labels');
        if (response.ok) {
          const labels = await response.json();
          setAvailableLabels(labels);
        }
      } catch (error) {
        console.error('ラベル一覧の取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, []);

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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ラベル
      </label>
      <div className="space-y-2">
        {availableLabels.map((label) => (
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
      {selectedLabelIds.length > 0 && (
        <div className="mt-3">
          <div className="text-sm text-gray-700 mb-2">選択中のラベル:</div>
          <div className="flex flex-wrap gap-1">
            {selectedLabelIds.map((labelId) => {
              const label = availableLabels.find(l => l.id === labelId);
              return label ? <LabelBadge key={labelId} label={label} /> : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}