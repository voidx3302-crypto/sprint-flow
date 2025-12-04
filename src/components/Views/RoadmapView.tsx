import React, { useState, useRef } from 'react';
import { Plus, Edit2, Trash2, GripHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, addDays, differenceInDays, startOfWeek } from 'date-fns';
import { Epic } from '@/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const epicColors = [
  'hsl(262, 52%, 47%)',
  'hsl(216, 98%, 40%)',
  'hsl(174, 100%, 29%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(142, 71%, 45%)',
];

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

const initialEpics: Epic[] = [
  {
    id: 'epic-1',
    title: 'User Authentication',
    description: 'Complete user auth system with login, signup, and password recovery',
    color: epicColors[0],
    startDate: weekStart,
    endDate: addDays(weekStart, 14),
    taskIds: ['task-2'],
  },
  {
    id: 'epic-2',
    title: 'Dashboard Development',
    description: 'Build main dashboard with analytics and widgets',
    color: epicColors[1],
    startDate: addDays(weekStart, 7),
    endDate: addDays(weekStart, 28),
    taskIds: ['task-1', 'task-3'],
  },
  {
    id: 'epic-3',
    title: 'API Integration',
    description: 'Connect all frontend components with backend APIs',
    color: epicColors[2],
    startDate: addDays(weekStart, 21),
    endDate: addDays(weekStart, 42),
    taskIds: ['task-4'],
  },
];

export const RoadmapView: React.FC = () => {
  const [epics, setEpics] = useState<Epic[]>(initialEpics);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
  });

  const [dragging, setDragging] = useState<{ epicId: string; type: 'move' | 'resize-left' | 'resize-right'; startX: number; originalStart: Date; originalEnd: Date } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timeline spans 12 weeks
  const timelineStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const totalDays = 84; // 12 weeks
  const dayWidth = 40;

  const weeks = Array.from({ length: 12 }, (_, i) => addDays(timelineStart, i * 7));

  const getBarStyle = (epic: Epic) => {
    const startOffset = Math.max(0, differenceInDays(epic.startDate, timelineStart));
    const duration = Math.max(1, differenceInDays(epic.endDate, epic.startDate) + 1);
    const left = startOffset * dayWidth;
    const width = Math.min(duration * dayWidth, (totalDays - startOffset) * dayWidth);

    return {
      left: `${left}px`,
      width: `${Math.max(width, dayWidth)}px`,
      backgroundColor: epic.color,
    };
  };

  const handleMouseDown = (e: React.MouseEvent, epicId: string, type: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    const epic = epics.find(ep => ep.id === epicId);
    if (!epic) return;

    setDragging({
      epicId,
      type,
      startX: e.clientX,
      originalStart: new Date(epic.startDate),
      originalEnd: new Date(epic.endDate),
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;

    const deltaX = e.clientX - dragging.startX;
    const daysDelta = Math.round(deltaX / dayWidth);

    setEpics(prev => prev.map(epic => {
      if (epic.id !== dragging.epicId) return epic;

      let newStart = new Date(dragging.originalStart);
      let newEnd = new Date(dragging.originalEnd);

      if (dragging.type === 'move') {
        newStart = addDays(dragging.originalStart, daysDelta);
        newEnd = addDays(dragging.originalEnd, daysDelta);
      } else if (dragging.type === 'resize-left') {
        newStart = addDays(dragging.originalStart, daysDelta);
        if (newStart >= newEnd) newStart = addDays(newEnd, -1);
      } else if (dragging.type === 'resize-right') {
        newEnd = addDays(dragging.originalEnd, daysDelta);
        if (newEnd <= newStart) newEnd = addDays(newStart, 1);
      }

      return { ...epic, startDate: newStart, endDate: newEnd };
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const openAddModal = () => {
    setEditingEpic(null);
    setFormData({
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (epic: Epic) => {
    setEditingEpic(epic);
    setFormData({
      title: epic.title,
      description: epic.description,
      startDate: format(epic.startDate, 'yyyy-MM-dd'),
      endDate: format(epic.endDate, 'yyyy-MM-dd'),
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;

    if (editingEpic) {
      setEpics(prev => prev.map(epic =>
        epic.id === editingEpic.id
          ? {
              ...epic,
              title: formData.title,
              description: formData.description,
              startDate: new Date(formData.startDate),
              endDate: new Date(formData.endDate),
            }
          : epic
      ));
    } else {
      const newEpic: Epic = {
        id: generateId(),
        title: formData.title,
        description: formData.description,
        color: epicColors[epics.length % epicColors.length],
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        taskIds: [],
      };
      setEpics(prev => [...prev, newEpic]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (epicId: string) => {
    setEpics(prev => prev.filter(epic => epic.id !== epicId));
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Roadmap</h2>
        <Button onClick={openAddModal} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Epic
        </Button>
      </div>

      {/* Timeline */}
      <div 
        className="flex-1 overflow-auto"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        ref={containerRef}
      >
        <div className="min-w-max">
          {/* Week headers */}
          <div className="flex border-b border-border bg-muted/50 sticky top-0 z-10">
            <div className="w-64 flex-shrink-0 p-3 font-medium text-sm text-muted-foreground border-r border-border">
              Epic
            </div>
            <div className="flex">
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-medium text-muted-foreground py-2 border-r border-border"
                  style={{ width: `${dayWidth * 7}px` }}
                >
                  {format(week, 'MMM d')}
                </div>
              ))}
            </div>
          </div>

          {/* Epic rows */}
          {epics.map(epic => (
            <div key={epic.id} className="flex border-b border-border hover:bg-muted/30">
              {/* Epic info */}
              <div className="w-64 flex-shrink-0 p-3 border-r border-border">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: epic.color }}
                  />
                  <span className="font-medium text-sm text-foreground truncate flex-1">
                    {epic.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => openEditModal(epic)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleDelete(epic.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {epic.description}
                </p>
              </div>

              {/* Timeline bar */}
              <div
                className="relative flex-1"
                style={{ minWidth: `${totalDays * dayWidth}px`, height: '64px' }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {weeks.map((_, i) => (
                    <div
                      key={i}
                      className="border-r border-border/50"
                      style={{ width: `${dayWidth * 7}px` }}
                    />
                  ))}
                </div>

                {/* Epic bar */}
                <div
                  className="absolute top-3 h-10 rounded-md flex items-center px-2 cursor-move select-none"
                  style={getBarStyle(epic)}
                  onMouseDown={(e) => handleMouseDown(e, epic.id, 'move')}
                >
                  {/* Left resize handle */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, epic.id, 'resize-left'); }}
                  >
                    <GripHorizontal className="w-3 h-3 text-white/70" />
                  </div>

                  <span className="text-xs font-medium text-white truncate px-2">
                    {epic.title}
                  </span>

                  {/* Right resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center"
                    onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, epic.id, 'resize-right'); }}
                  >
                    <GripHorizontal className="w-3 h-3 text-white/70" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {epics.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No epics yet. Click "Add Epic" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Epic Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEpic ? 'Edit Epic' : 'Add Epic'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Epic title"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Epic description"
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEpic ? 'Save' : 'Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
