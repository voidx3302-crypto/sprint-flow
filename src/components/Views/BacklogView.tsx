import React from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Task, Sprint } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BacklogViewProps {
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ onTaskClick, onAddTask }) => {
  const { filteredTasks, sprints, teamMembers, setActiveSprint } = useApp();
  const [expandedSprints, setExpandedSprints] = React.useState<string[]>(
    sprints.map((s) => s.id)
  );

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints((prev) =>
      prev.includes(sprintId)
        ? prev.filter((id) => id !== sprintId)
        : [...prev, sprintId]
    );
  };

  const getTasksBySprint = (sprintId: string) =>
    filteredTasks.filter((t) => t.sprintId === sprintId);

  const getStatusBadge = (status: Task['status']) => {
    const styles = {
      todo: 'status-badge status-todo',
      'in-progress': 'status-badge status-progress',
      done: 'status-badge status-done',
    };
    const labels = {
      todo: 'To Do',
      'in-progress': 'In Progress',
      done: 'Done',
    };
    return <span className={styles[status]}>{labels[status]}</span>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Backlog</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredTasks.length} tasks across {sprints.length} sprints
            </p>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-atlassian-blue text-primary-foreground rounded-lg hover:bg-atlassian-blue-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {sprints.map((sprint) => {
          const tasks = getTasksBySprint(sprint.id);
          const isExpanded = expandedSprints.includes(sprint.id);
          const completedCount = tasks.filter((t) => t.status === 'done').length;

          return (
            <div
              key={sprint.id}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              {/* Sprint Header */}
              <div
                className="flex items-center gap-3 px-4 py-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => toggleSprint(sprint.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{sprint.name}</h3>
                    {sprint.isActive && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                    {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {completedCount}/{tasks.length} done
                  </span>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-status-done transition-all"
                      style={{
                        width: tasks.length > 0
                          ? `${(completedCount / tasks.length) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks List */}
              {isExpanded && (
                <div className="divide-y divide-border">
                  {tasks.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No tasks in this sprint
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const assignees = teamMembers.filter((m) =>
                        task.assignees.includes(m.id)
                      );
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => onTaskClick(task)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {task.title}
                            </p>
                          </div>
                          {getStatusBadge(task.status)}
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                              task.priority === 'high' && 'bg-destructive/20 text-destructive',
                              task.priority === 'medium' && 'bg-status-progress/20 text-status-progress',
                              task.priority === 'low' && 'bg-status-done/20 text-status-done'
                            )}
                          >
                            {task.priority}
                          </span>
                          {assignees.length > 0 && (
                            <div className="flex -space-x-1">
                              {assignees.slice(0, 3).map((member) => (
                                <div
                                  key={member.id}
                                  className="avatar avatar-sm border-2 border-card"
                                  style={{ backgroundColor: member.color }}
                                  title={member.name}
                                >
                                  <span className="text-primary-foreground">
                                    {member.avatar}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
