import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';
import { Task, TaskStatus, Subtask } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  isNew?: boolean;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  isNew = false,
}) => {
  const {
    teamMembers,
    sprints,
    activeSprint,
    updateTask,
    addTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    assignMember,
    unassignMember,
  } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as 'low' | 'medium' | 'high',
    sprintId: activeSprint?.id || '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        sprintId: task.sprintId,
        startDate: format(new Date(task.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(task.endDate), 'yyyy-MM-dd'),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        sprintId: activeSprint?.id || '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [task, activeSprint]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (isNew) {
      addTask({
        ...formData,
        assignees: [],
        subtasks: [],
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    } else if (task) {
      updateTask(task.id, {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onClose();
    }
  };

  const handleAddSubtask = () => {
    if (task && newSubtask.trim()) {
      addSubtask(task.id, { title: newSubtask.trim(), completed: false });
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (subtask: Subtask) => {
    if (task) {
      updateSubtask(task.id, subtask.id, { completed: !subtask.completed });
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (task) {
      deleteSubtask(task.id, subtaskId);
    }
  };

  const assignedMembers = task
    ? teamMembers.filter((m) => task.assignees.includes(m.id))
    : [];
  const unassignedMembers = task
    ? teamMembers.filter((m) => !task.assignees.includes(m.id))
    : teamMembers;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isNew ? 'Create Task' : 'Edit Task'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          {/* Status, Priority, Sprint */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as TaskStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    priority: value as 'low' | 'medium' | 'high',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Sprint
              </label>
              <Select
                value={formData.sprintId}
                onValueChange={(value) =>
                  setFormData({ ...formData, sprintId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Assignees (only for existing tasks) */}
          {task && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Assignees
              </label>
              <div className="space-y-2">
                {/* Assigned Members */}
                {assignedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assignedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md"
                      >
                        <div
                          className="avatar avatar-sm"
                          style={{ backgroundColor: member.color }}
                        >
                          <span className="text-primary-foreground">
                            {member.avatar}
                          </span>
                        </div>
                        <span className="text-sm text-foreground">
                          {member.name}
                        </span>
                        <button
                          onClick={() => unassignMember(task.id, member.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Member Dropdown */}
                {unassignedMembers.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(value) => assignMember(task.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        <span>Add member</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="avatar avatar-sm"
                              style={{ backgroundColor: member.color }}
                            >
                              <span className="text-primary-foreground text-[10px]">
                                {member.avatar}
                              </span>
                            </div>
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Subtasks (only for existing tasks) */}
          {task && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Subtasks
              </label>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(subtask)}
                    />
                    <span
                      className={cn(
                        'flex-1 text-sm',
                        subtask.completed &&
                          'line-through text-muted-foreground'
                      )}
                    >
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add subtask..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddSubtask}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          {!isNew && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          <div className={cn('flex gap-2', isNew && 'ml-auto')}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="atlassian" onClick={handleSave}>
              {isNew ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
