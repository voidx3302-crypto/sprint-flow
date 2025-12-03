import React from 'react';
import { Mail, Briefcase, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TeamViewProps {
  onTaskClick: (task: Task) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onTaskClick }) => {
  const { teamMembers, tasks, activeSprint } = useApp();

  const getTasksForMember = (memberId: string) =>
    tasks.filter(
      (t) =>
        t.assignees.includes(memberId) &&
        (!activeSprint || t.sprintId === activeSprint.id)
    );

  const getTaskStats = (memberId: string) => {
    const memberTasks = getTasksForMember(memberId);
    return {
      total: memberTasks.length,
      todo: memberTasks.filter((t) => t.status === 'todo').length,
      inProgress: memberTasks.filter((t) => t.status === 'in-progress').length,
      done: memberTasks.filter((t) => t.status === 'done').length,
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {teamMembers.length} members • {activeSprint?.name || 'All Sprints'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => {
            const stats = getTaskStats(member.id);
            const memberTasks = getTasksForMember(member.id);

            return (
              <div
                key={member.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                {/* Member Header */}
                <div className="p-4 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar avatar-lg"
                      style={{ backgroundColor: member.color }}
                    >
                      <span className="text-primary-foreground font-medium">
                        {member.avatar}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Circle className="w-3.5 h-3.5 text-status-todo" />
                        <span className="text-muted-foreground">{stats.todo}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-status-progress" />
                        <span className="text-muted-foreground">{stats.inProgress}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-done" />
                        <span className="text-muted-foreground">{stats.done}</span>
                      </div>
                    </div>
                    <span className="font-medium text-foreground">
                      {stats.total} tasks
                    </span>
                  </div>
                  {stats.total > 0 && (
                    <div className="flex gap-0.5 mt-2 h-1.5 rounded-full overflow-hidden bg-muted">
                      <div
                        className="bg-status-done transition-all"
                        style={{ width: `${(stats.done / stats.total) * 100}%` }}
                      />
                      <div
                        className="bg-status-progress transition-all"
                        style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                      />
                      <div
                        className="bg-status-todo transition-all"
                        style={{ width: `${(stats.todo / stats.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Recent Tasks */}
                <div className="p-2">
                  {memberTasks.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No assigned tasks
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
                      {memberTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => onTaskClick(task)}
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full shrink-0',
                              task.status === 'done' && 'bg-status-done',
                              task.status === 'in-progress' && 'bg-status-progress',
                              task.status === 'todo' && 'bg-status-todo'
                            )}
                          />
                          <span className="text-sm text-foreground truncate">
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {memberTasks.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{memberTasks.length - 5} more
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
