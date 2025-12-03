import React, { useState, useRef } from 'react';
import { format, differenceInDays, addDays, startOfDay, isSameDay } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  onTaskClick: (task: Task) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onTaskClick }) => {
  const { filteredTasks, activeSprint, teamMembers, updateTask } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ taskId: string; edge: 'start' | 'end' } | null>(null);

  if (!activeSprint) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No active sprint selected
      </div>
    );
  }

  const sprintTasks = filteredTasks.filter((t) => t.sprintId === activeSprint.id);
  const sprintStart = startOfDay(new Date(activeSprint.startDate));
  const sprintEnd = startOfDay(new Date(activeSprint.endDate));
  const totalDays = differenceInDays(sprintEnd, sprintStart) + 1;

  // Generate day columns
  const days = Array.from({ length: totalDays }, (_, i) => addDays(sprintStart, i));

  const dayWidth = 120; // pixels per day

  const getTaskPosition = (task: Task) => {
    const taskStart = startOfDay(new Date(task.startDate));
    const taskEnd = startOfDay(new Date(task.endDate));
    
    const startOffset = Math.max(0, differenceInDays(taskStart, sprintStart));
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    const left = startOffset * dayWidth;
    const width = duration * dayWidth - 8;
    
    return { left, width };
  };

  const getStatusClass = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'timeline-bar-todo';
      case 'in-progress':
        return 'timeline-bar-progress';
      case 'done':
        return 'timeline-bar-done';
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent, task: Task) => {
    if (!containerRef.current || !draggingTask) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayIndex = Math.floor(x / dayWidth);
    const newStart = addDays(sprintStart, Math.max(0, Math.min(dayIndex, totalDays - 1)));
    const duration = differenceInDays(new Date(task.endDate), new Date(task.startDate));
    const newEnd = addDays(newStart, duration);
    
    updateTask(task.id, {
      startDate: newStart,
      endDate: newEnd,
    });
    
    setDraggingTask(null);
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string, edge: 'start' | 'end') => {
    e.stopPropagation();
    e.preventDefault();
    setResizing({ taskId, edge });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !resizing) return;
      
      const task = sprintTasks.find(t => t.id === taskId);
      if (!task) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const dayIndex = Math.floor(x / dayWidth);
      const targetDate = addDays(sprintStart, Math.max(0, Math.min(dayIndex, totalDays - 1)));
      
      if (edge === 'start') {
        if (targetDate < new Date(task.endDate)) {
          updateTask(taskId, { startDate: targetDate });
        }
      } else {
        if (targetDate > new Date(task.startDate)) {
          updateTask(taskId, { endDate: targetDate });
        }
      }
    };
    
    const handleMouseUp = () => {
      setResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex border-b border-border bg-timeline-header">
        <div className="w-64 shrink-0 p-3 font-medium text-sm text-muted-foreground border-r border-border">
          Task
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex" style={{ width: totalDays * dayWidth }}>
            {days.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center justify-center py-2 border-r border-timeline-grid',
                  isSameDay(day, new Date()) && 'bg-primary/5'
                )}
                style={{ width: dayWidth }}
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    isSameDay(day, new Date())
                      ? 'text-primary'
                      : 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Task Names Column */}
          <div className="w-64 shrink-0 border-r border-border bg-card">
            {sprintTasks.map((task) => {
              const assignees = teamMembers.filter((m) =>
                task.assignees.includes(m.id)
              );
              return (
                <div
                  key={task.id}
                  className="h-14 px-3 flex items-center gap-2 border-b border-border hover:bg-muted/50 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {task.title}
                    </p>
                    {assignees.length > 0 && (
                      <div className="flex -space-x-1 mt-1">
                        {assignees.slice(0, 2).map((member) => (
                          <div
                            key={member.id}
                            className="avatar avatar-sm border border-card"
                            style={{ backgroundColor: member.color }}
                          >
                            <span className="text-primary-foreground text-[8px]">
                              {member.avatar}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Grid */}
          <div className="flex-1 overflow-x-auto" ref={containerRef}>
            <div className="relative" style={{ width: totalDays * dayWidth }}>
              {/* Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      'border-r border-timeline-grid',
                      isSameDay(day, new Date()) && 'bg-primary/5'
                    )}
                    style={{ width: dayWidth, height: sprintTasks.length * 56 }}
                  />
                ))}
              </div>

              {/* Task Bars */}
              {sprintTasks.map((task, index) => {
                const { left, width } = getTaskPosition(task);
                return (
                  <div
                    key={task.id}
                    className="h-14 border-b border-border relative"
                  >
                    <div
                      className={cn(
                        'timeline-bar flex items-center px-2 text-xs font-medium text-primary-foreground',
                        getStatusClass(task.status),
                        draggingTask === task.id && 'opacity-50'
                      )}
                      style={{
                        left: left + 4,
                        width: Math.max(width, 40),
                        top: 12,
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={(e) => handleDragEnd(e, task)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                    >
                      {/* Resize Handle Left */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 rounded-l-md"
                        onMouseDown={(e) => handleResizeStart(e, task.id, 'start')}
                      />
                      
                      <span className="truncate flex-1 text-center">
                        {task.title}
                      </span>
                      
                      {/* Resize Handle Right */}
                      <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 rounded-r-md"
                        onMouseDown={(e) => handleResizeStart(e, task.id, 'end')}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
