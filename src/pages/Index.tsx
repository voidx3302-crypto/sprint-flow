import React, { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { SprintBoard } from '@/components/Board/SprintBoard';
import { TimelineView } from '@/components/Timeline/TimelineView';
import { TaskModal } from '@/components/Modals/TaskModal';
import { SettingsModal } from '@/components/Modals/SettingsModal';
import { Task, ViewMode } from '@/types';

const AppContent: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNewTask, setIsNewTask] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setIsNewTask(false);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onAddTask={handleAddTask} />

        <main className="flex-1 overflow-hidden">
          {currentView === 'board' ? (
            <SprintBoard onTaskClick={handleTaskClick} />
          ) : (
            <TimelineView onTaskClick={handleTaskClick} />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        isNew={isNewTask}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
