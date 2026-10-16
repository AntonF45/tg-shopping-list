import React from 'react';
import { ShoppingItem } from '../types/shopping';

interface Props {
  items: ShoppingItem[];
}

export const ProgressFieldset: React.FC<Props> = ({ items }) => {
  const total = items.length;
  const done = items.filter(i => i.isDone).length;

  if (total === 0) return null;

  const allDone = done === total;

  return (
    <div className="progress-box">
      <label className="progress-label">
        <span className={`progress-text ${allDone ? 'progress-text--done' : ''}`}>
          {done} из {total}
        </span>
      </label>
    </div>
  );
};