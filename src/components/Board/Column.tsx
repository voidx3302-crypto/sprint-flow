import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, Task } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const statusStyles: Record<TaskStatus, { bg: string; border: string; dot: string }> = {
  'todo': {
    bg: 'bg-status-todo-bg',
    border: 'border-status-todo/30',
    dot: 'bg-status-todo',
  },
  'in-progress': {
    bg: 'bg-status-progress-bg',
    border: 'border-status-progress/30',
    dot: 'bg-status-progress',
  },
  'done': {
    bg: 'bg-status-done-bg',
    border: 'border-status-done/30',
    dot: 'bg-status-done',
  },
};

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const styles = statusStyles[id];

  return (
    <div className="flex flex-col w-80 shrink-0">
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-lg border-b',
          styles.bg,
          styles.border
        )}
      >
        <span className={cn('w-2.5 h-2.5 rounded-full', styles.dot)} />
        <h2 className="font-semibold text-sm text-foreground">{title}</h2>
        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-2 space-y-2 rounded-b-lg border border-t-0 bg-muted/30 min-h-[300px] transition-colors',
          isOver && 'bg-primary/5 border-primary/30'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
