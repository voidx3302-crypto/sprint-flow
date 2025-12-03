import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckSquare, Square } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const priorityColors = {
  low: 'bg-status-done/20 text-status-done',
  medium: 'bg-status-progress/20 text-status-progress',
  high: 'bg-destructive/20 text-destructive',
};

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { teamMembers } = useApp();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedMembers = teamMembers.filter((m) =>
    task.assignees.includes(m.id)
  );

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'task-card group animate-scale-in',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="drag-handle opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Priority Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
            {task.title}
          </h3>

          {/* Subtasks Progress */}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              {completedSubtasks === totalSubtasks ? (
                <CheckSquare className="w-3.5 h-3.5 text-status-done" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {/* Assignees */}
          {assignedMembers.length > 0 && (
            <div className="flex items-center gap-1 mt-3">
              <div className="flex -space-x-1.5">
                {assignedMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="avatar avatar-sm border-2 border-card"
                    style={{ backgroundColor: member.color }}
                    title={member.name}
                  >
                    <span className="text-primary-foreground">{member.avatar}</span>
                  </div>
                ))}
                {assignedMembers.length > 3 && (
                  <div className="avatar avatar-sm bg-muted text-muted-foreground border-2 border-card">
                    +{assignedMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
