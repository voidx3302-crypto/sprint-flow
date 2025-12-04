import React, { useState } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { SprintBoard } from '@/components/Board/SprintBoard';
import { TimelineView } from '@/components/Timeline/TimelineView';
import { BacklogView } from '@/components/Views/BacklogView';
import { TeamView } from '@/components/Views/TeamView';
import { ReportsView } from '@/components/Views/ReportsView';
import { RoadmapView } from '@/components/Views/RoadmapView';
import { IssuesView } from '@/components/Views/IssuesView';
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

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <SprintBoard onTaskClick={handleTaskClick} />;
      case 'timeline':
        return <TimelineView onTaskClick={handleTaskClick} />;
      case 'roadmap':
        return <RoadmapView />;
      case 'issues':
        return <IssuesView onTaskClick={handleTaskClick} onAddTask={handleAddTask} />;
      case 'backlog':
        return <BacklogView onTaskClick={handleTaskClick} onAddTask={handleAddTask} />;
      case 'team':
        return <TeamView onTaskClick={handleTaskClick} />;
      case 'reports':
        return <ReportsView />;
      default:
        return <SprintBoard onTaskClick={handleTaskClick} />;
    }
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
          {renderView()}
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
