import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Users, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    teamMembers,
    sprints,
    activeSprint,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
    addSprint,
    setActiveSprint,
  } = useApp();

  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editMemberData, setEditMemberData] = useState({ name: '', email: '' });

  const [newSprint, setNewSprint] = useState({
    name: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMember.name.trim() && newMember.email.trim()) {
      const initials = newMember.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      addTeamMember({
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        avatar: initials,
        color: '',
      });
      setNewMember({ name: '', email: '' });
    }
  };

  const handleEditMember = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setEditingMember(memberId);
      setEditMemberData({ name: member.name, email: member.email });
    }
  };

  const handleSaveEdit = () => {
    if (editingMember && editMemberData.name.trim() && editMemberData.email.trim()) {
      const initials = editMemberData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      updateTeamMember(editingMember, {
        name: editMemberData.name.trim(),
        email: editMemberData.email.trim(),
        avatar: initials,
      });
      setEditingMember(null);
    }
  };

  const handleAddSprint = () => {
    if (newSprint.name.trim()) {
      addSprint({
        name: newSprint.name.trim(),
        startDate: new Date(newSprint.startDate),
        endDate: new Date(newSprint.endDate),
        isActive: false,
      });
      setNewSprint({
        name: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  };

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
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="flex flex-col h-[calc(90vh-80px)]">
          <TabsList className="w-full justify-start px-4 pt-2 bg-transparent border-b border-border rounded-none">
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="sprints" className="gap-2">
              <Layers className="w-4 h-4" />
              Sprints
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Add New Member */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-foreground">Add New Member</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newMember.email}
                  onChange={(e) =>
                    setNewMember({ ...newMember, email: e.target.value })
                  }
                />
                <Button variant="atlassian" onClick={handleAddMember}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
                >
                  <div
                    className="avatar"
                    style={{ backgroundColor: member.color }}
                  >
                    <span className="text-primary-foreground">{member.avatar}</span>
                  </div>

                  {editingMember === member.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editMemberData.name}
                        onChange={(e) =>
                          setEditMemberData({
                            ...editMemberData,
                            name: e.target.value,
                          })
                        }
                        className="h-8"
                      />
                      <Input
                        value={editMemberData.email}
                        onChange={(e) =>
                          setEditMemberData({
                            ...editMemberData,
                            email: e.target.value,
                          })
                        }
                        className="h-8"
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMember(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditMember(member.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTeamMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sprints Tab */}
          <TabsContent value="sprints" className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Add New Sprint */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-foreground">Add New Sprint</h3>
              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Sprint Name"
                  value={newSprint.name}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, name: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={newSprint.startDate}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, startDate: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={newSprint.endDate}
                  onChange={(e) =>
                    setNewSprint({ ...newSprint, endDate: e.target.value })
                  }
                />
                <Button variant="atlassian" onClick={handleAddSprint}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Sprints List */}
            <div className="space-y-2">
              {sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                    sprint.isActive
                      ? 'bg-primary/5 border-primary'
                      : 'bg-muted/30 border-transparent hover:border-border'
                  )}
                  onClick={() => setActiveSprint(sprint.id)}
                >
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full',
                      sprint.isActive ? 'bg-primary' : 'bg-muted-foreground/30'
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {sprint.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                      {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {sprint.isActive && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
