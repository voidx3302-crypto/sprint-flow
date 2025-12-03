import React, { useState } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { TaskStatus } from '@/types';

interface HeaderProps {
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddTask }) => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    memberFilter,
    setMemberFilter,
    teamMembers,
    activeSprint,
  } = useApp();

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = statusFilter !== 'all' || memberFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setMemberFilter('all');
    setSearchQuery('');
  };

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {activeSprint?.name || 'All Tasks'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <Button
          variant={showFilters || hasActiveFilters ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </Button>

        {/* Filters Dropdown */}
        {showFilters && (
          <div className="flex items-center gap-2 animate-fade-in">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={memberFilter}
              onValueChange={(value) => setMemberFilter(value)}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Add Task */}
        <Button variant="atlassian" size="sm" onClick={onAddTask} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>
    </header>
  );
};
