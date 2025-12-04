export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignees: string[];
  subtasks: Subtask[];
  sprintId: string;
  priority: 'low' | 'medium' | 'high';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export type ViewMode = 'board' | 'timeline' | 'backlog' | 'team' | 'reports' | 'roadmap' | 'issues';

export interface Epic {
  id: string;
  title: string;
  description: string;
  color: string;
  startDate: Date;
  endDate: Date;
  taskIds: string[];
}
