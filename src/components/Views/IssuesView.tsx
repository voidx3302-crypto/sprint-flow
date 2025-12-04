import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';
import { Task, TaskStatus } from '@/types';
import { format } from 'date-fns';

interface IssuesViewProps {
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusColors: Record<TaskStatus, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-primary/20 text-primary',
  'done': 'bg-green-500/20 text-green-600',
};

const priorityColors: Record<string, string> = {
  'high': 'bg-destructive/20 text-destructive',
  'medium': 'bg-yellow-500/20 text-yellow-600',
  'low': 'bg-muted text-muted-foreground',
};

export const IssuesView: React.FC<IssuesViewProps> = ({ onTaskClick, onAddTask }) => {
  const { tasks, teamMembers, sprints } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  const getAssigneeNames = (assigneeIds: string[]) => {
    return assigneeIds
      .map(id => teamMembers.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ') || 'Unassigned';
  };

  const getSprintName = (sprintId: string) => {
    return sprints.find(s => s.id === sprintId)?.name || 'No Sprint';
  };

  const handleRowDoubleClick = (task: Task) => {
    onTaskClick(task);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Issues</h2>
          <Button onClick={onAddTask} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Issue
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Status: {statusFilter === 'all' ? 'All' : statusLabels[statusFilter]}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('todo')}>
                To Do
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('done')}>
                Done
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Title</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-28">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-24">Priority</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-40">Assignees</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-28">Sprint</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground w-28">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr
                key={task.id}
                className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onDoubleClick={() => handleRowDoubleClick(task)}
                onClick={() => onTaskClick(task)}
              >
                <td className="p-3">
                  <div>
                    <span className="font-medium text-foreground">{task.title}</span>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                        {task.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className={statusColors[task.status]}>
                    {statusLabels[task.status]}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {task.assignees.length > 0 ? (
                      task.assignees.slice(0, 2).map(assigneeId => {
                        const member = teamMembers.find(m => m.id === assigneeId);
                        if (!member) return null;
                        return (
                          <div
                            key={assigneeId}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                            style={{ backgroundColor: member.color }}
                            title={member.name}
                          >
                            {member.avatar}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">Unassigned</span>
                    )}
                    {task.assignees.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{task.assignees.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm text-muted-foreground">
                    {getSprintName(task.sprintId)}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-muted-foreground">
                    {format(task.endDate, 'MMM d')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'No issues match your filters.'
              : 'No issues yet. Click "Create Issue" to add one.'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-muted/30">
        <span className="text-sm text-muted-foreground">
          {filteredTasks.length} issue{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};
