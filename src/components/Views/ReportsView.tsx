import React from 'react';
import { TrendingUp, CheckCircle2, Clock, AlertCircle, Users, Layers } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export const ReportsView: React.FC = () => {
  const { tasks, teamMembers, sprints, activeSprint } = useApp();

  const sprintTasks = activeSprint
    ? tasks.filter((t) => t.sprintId === activeSprint.id)
    : tasks;

  const stats = {
    total: sprintTasks.length,
    todo: sprintTasks.filter((t) => t.status === 'todo').length,
    inProgress: sprintTasks.filter((t) => t.status === 'in-progress').length,
    done: sprintTasks.filter((t) => t.status === 'done').length,
    highPriority: sprintTasks.filter((t) => t.priority === 'high').length,
    unassigned: sprintTasks.filter((t) => t.assignees.length === 0).length,
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.done / stats.total) * 100)
    : 0;

  // Calculate workload per member
  const workloadData = teamMembers.map((member) => {
    const memberTasks = sprintTasks.filter((t) => t.assignees.includes(member.id));
    return {
      member,
      total: memberTasks.length,
      done: memberTasks.filter((t) => t.status === 'done').length,
    };
  });

  const maxWorkload = Math.max(...workloadData.map((w) => w.total), 1);

  // Status distribution for chart
  const statusData = [
    { label: 'To Do', value: stats.todo, color: 'bg-status-todo' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-status-progress' },
    { label: 'Done', value: stats.done, color: 'bg-status-done' },
  ];

  // Priority breakdown
  const priorityData = [
    { label: 'High', value: sprintTasks.filter((t) => t.priority === 'high').length, color: 'bg-destructive' },
    { label: 'Medium', value: sprintTasks.filter((t) => t.priority === 'medium').length, color: 'bg-status-progress' },
    { label: 'Low', value: sprintTasks.filter((t) => t.priority === 'low').length, color: 'bg-status-done' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {activeSprint?.name || 'All Sprints'} Overview
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-done/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-status-done" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.unassigned}</p>
                <p className="text-xs text-muted-foreground">Unassigned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
            <div className="space-y-3">
              {statusData.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all flex items-center justify-end pr-2', item.color)}
                      style={{
                        width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%',
                        minWidth: item.value > 0 ? '2rem' : '0',
                      }}
                    >
                      {item.value > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Bar */}
            {stats.total > 0 && (
              <div className="flex h-3 mt-4 rounded-full overflow-hidden">
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

          {/* Priority Breakdown */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4">Priority Breakdown</h3>
            <div className="space-y-3">
              {priorityData.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all flex items-center justify-end pr-2', item.color)}
                      style={{
                        width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%',
                        minWidth: item.value > 0 ? '2rem' : '0',
                      }}
                    >
                      {item.value > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Team Workload</h3>
          <div className="space-y-4">
            {workloadData.map(({ member, total, done }) => (
              <div key={member.id} className="flex items-center gap-4">
                <div
                  className="avatar avatar-sm shrink-0"
                  style={{ backgroundColor: member.color }}
                >
                  <span className="text-primary-foreground">{member.avatar}</span>
                </div>
                <span className="w-28 text-sm text-foreground truncate">{member.name}</span>
                <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-muted-foreground/20 transition-all"
                    style={{ width: `${(total / maxWorkload) * 100}%` }}
                  />
                  <div
                    className="h-full bg-status-done transition-all absolute top-0 left-0"
                    style={{ width: `${(done / maxWorkload) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-16 text-right">
                  {done}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sprint Overview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Sprint Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprints.map((sprint) => {
              const spTasks = tasks.filter((t) => t.sprintId === sprint.id);
              const spDone = spTasks.filter((t) => t.status === 'done').length;
              const spTotal = spTasks.length;
              const spProgress = spTotal > 0 ? Math.round((spDone / spTotal) * 100) : 0;

              return (
                <div
                  key={sprint.id}
                  className={cn(
                    'p-4 rounded-lg border transition-colors',
                    sprint.isActive
                      ? 'bg-primary/5 border-primary'
                      : 'bg-muted/30 border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{sprint.name}</h4>
                    {sprint.isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-status-done transition-all"
                        style={{ width: `${spProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{spProgress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {spDone} of {spTotal} tasks completed
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
