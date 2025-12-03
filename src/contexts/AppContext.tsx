import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Task, TeamMember, Sprint, TaskStatus, Subtask } from '@/types';
import { addDays, startOfWeek } from 'date-fns';

interface AppContextType {
  tasks: Task[];
  teamMembers: TeamMember[];
  sprints: Sprint[];
  activeSprint: Sprint | null;
  searchQuery: string;
  statusFilter: TaskStatus | 'all';
  memberFilter: string | 'all';
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setMemberFilter: (memberId: string | 'all') => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  assignMember: (taskId: string, memberId: string) => void;
  unassignMember: (taskId: string, memberId: string) => void;
  addSprint: (sprint: Omit<Sprint, 'id'>) => void;
  setActiveSprint: (sprintId: string) => void;
  filteredTasks: Task[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

const memberColors = [
  'hsl(216, 98%, 40%)',
  'hsl(262, 52%, 47%)',
  'hsl(174, 100%, 29%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(24, 95%, 53%)',
];

// Initial data
const initialMembers: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatar: 'AJ', color: memberColors[0] },
  { id: '2', name: 'Sarah Miller', email: 'sarah@example.com', avatar: 'SM', color: memberColors[1] },
  { id: '3', name: 'Mike Chen', email: 'mike@example.com', avatar: 'MC', color: memberColors[2] },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', avatar: 'ED', color: memberColors[3] },
];

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

const initialSprints: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1',
    startDate: weekStart,
    endDate: addDays(weekStart, 6),
    isActive: true,
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2',
    startDate: addDays(weekStart, 7),
    endDate: addDays(weekStart, 13),
    isActive: false,
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design System Setup',
    description: 'Create and document the design system including colors, typography, and components.',
    status: 'done',
    assignees: ['1', '2'],
    subtasks: [
      { id: 'st-1', title: 'Define color palette', completed: true },
      { id: 'st-2', title: 'Setup typography', completed: true },
    ],
    sprintId: 'sprint-1',
    priority: 'high',
    startDate: weekStart,
    endDate: addDays(weekStart, 1),
    createdAt: new Date(),
  },
  {
    id: 'task-2',
    title: 'User Authentication',
    description: 'Implement user login, registration, and password recovery.',
    status: 'in-progress',
    assignees: ['3'],
    subtasks: [
      { id: 'st-3', title: 'Login form', completed: true },
      { id: 'st-4', title: 'Registration flow', completed: false },
      { id: 'st-5', title: 'Password reset', completed: false },
    ],
    sprintId: 'sprint-1',
    priority: 'high',
    startDate: addDays(weekStart, 1),
    endDate: addDays(weekStart, 3),
    createdAt: new Date(),
  },
  {
    id: 'task-3',
    title: 'Dashboard Layout',
    description: 'Build the main dashboard with sidebar navigation and header.',
    status: 'in-progress',
    assignees: ['1', '4'],
    subtasks: [
      { id: 'st-6', title: 'Sidebar component', completed: true },
      { id: 'st-7', title: 'Header component', completed: false },
    ],
    sprintId: 'sprint-1',
    priority: 'medium',
    startDate: addDays(weekStart, 2),
    endDate: addDays(weekStart, 4),
    createdAt: new Date(),
  },
  {
    id: 'task-4',
    title: 'API Integration',
    description: 'Connect frontend with backend APIs.',
    status: 'todo',
    assignees: ['2', '3'],
    subtasks: [],
    sprintId: 'sprint-1',
    priority: 'medium',
    startDate: addDays(weekStart, 4),
    endDate: addDays(weekStart, 6),
    createdAt: new Date(),
  },
  {
    id: 'task-5',
    title: 'Performance Optimization',
    description: 'Optimize bundle size and loading performance.',
    status: 'todo',
    assignees: [],
    subtasks: [],
    sprintId: 'sprint-2',
    priority: 'low',
    startDate: addDays(weekStart, 7),
    endDate: addDays(weekStart, 9),
    createdAt: new Date(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialMembers);
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [memberFilter, setMemberFilter] = useState<string | 'all'>('all');

  const activeSprint = useMemo(() => sprints.find(s => s.isActive) || null, [sprints]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignees.some(assigneeId => {
          const member = teamMembers.find(m => m.id === assigneeId);
          return member?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesMember = memberFilter === 'all' || task.assignees.includes(memberFilter);
      
      return matchesSearch && matchesStatus && matchesMember;
    });
  }, [tasks, searchQuery, statusFilter, memberFilter, teamMembers]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  }, []);

  const addSubtask = useCallback((taskId: string, subtask: Omit<Subtask, 'id'>) => {
    const newSubtask: Subtask = { ...subtask, id: generateId() };
    setTasks(prev => prev.map(task =>
      task.id === taskId 
        ? { ...task, subtasks: [...task.subtasks, newSubtask] }
        : task
    ));
  }, []);

  const updateSubtask = useCallback((taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(st =>
              st.id === subtaskId ? { ...st, ...updates } : st
            ),
          }
        : task
    ));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, subtasks: task.subtasks.filter(st => st.id !== subtaskId) }
        : task
    ));
  }, []);

  const addTeamMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: generateId(),
      color: memberColors[teamMembers.length % memberColors.length],
    };
    setTeamMembers(prev => [...prev, newMember]);
  }, [teamMembers.length]);

  const updateTeamMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(member =>
      member.id === id ? { ...member, ...updates } : member
    ));
  }, []);

  const removeTeamMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    // Remove member from all tasks
    setTasks(prev => prev.map(task => ({
      ...task,
      assignees: task.assignees.filter(assigneeId => assigneeId !== id),
    })));
  }, []);

  const assignMember = useCallback((taskId: string, memberId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId && !task.assignees.includes(memberId)
        ? { ...task, assignees: [...task.assignees, memberId] }
        : task
    ));
  }, []);

  const unassignMember = useCallback((taskId: string, memberId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, assignees: task.assignees.filter(id => id !== memberId) }
        : task
    ));
  }, []);

  const addSprint = useCallback((sprint: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = { ...sprint, id: generateId() };
    setSprints(prev => [...prev, newSprint]);
  }, []);

  const setActiveSprint = useCallback((sprintId: string) => {
    setSprints(prev => prev.map(sprint => ({
      ...sprint,
      isActive: sprint.id === sprintId,
    })));
  }, []);

  const value = useMemo(() => ({
    tasks,
    teamMembers,
    sprints,
    activeSprint,
    searchQuery,
    statusFilter,
    memberFilter,
    setSearchQuery,
    setStatusFilter,
    setMemberFilter,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    assignMember,
    unassignMember,
    addSprint,
    setActiveSprint,
    filteredTasks,
  }), [
    tasks,
    teamMembers,
    sprints,
    activeSprint,
    searchQuery,
    statusFilter,
    memberFilter,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    assignMember,
    unassignMember,
    addSprint,
    setActiveSprint,
    filteredTasks,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
