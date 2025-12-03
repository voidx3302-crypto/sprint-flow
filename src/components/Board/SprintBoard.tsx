import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useApp } from '@/contexts/AppContext';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types';

interface SprintBoardProps {
  onTaskClick: (task: Task) => void;
}

const columns: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export const SprintBoard: React.FC<SprintBoardProps> = ({ onTaskClick }) => {
  const { filteredTasks, moveTask, activeSprint } = useApp();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sprintTasks = activeSprint
    ? filteredTasks.filter((t) => t.sprintId === activeSprint.id)
    : filteredTasks;

  const getTasksByStatus = (status: TaskStatus) =>
    sprintTasks.filter((task) => task.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = sprintTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (['todo', 'in-progress', 'done'].includes(overId)) {
      moveTask(taskId, overId as TaskStatus);
    } else {
      // Dropped on another task - get that task's status
      const targetTask = sprintTasks.find((t) => t.id === overId);
      if (targetTask) {
        moveTask(taskId, targetTask.status);
      }
    }
  };

  // Calculate sprint progress
  const totalTasks = sprintTasks.length;
  const completedTasks = sprintTasks.filter((t) => t.status === 'done').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Sprint Progress */}
      {activeSprint && totalTasks > 0 && (
        <div className="px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Sprint Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed ({progressPercentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-status-done transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {columns.map((column) => (
              <Column
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={getTasksByStatus(column.id)}
                onTaskClick={onTaskClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="rotate-2 opacity-90">
                <TaskCard task={activeTask} onClick={() => {}} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
