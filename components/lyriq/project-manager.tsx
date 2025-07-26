import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import * as Haptics from 'expo-haptics';
import { Plus, Folder, Music, Calendar, MoreVertical, Archive, Edit3, Trash2 } from 'lucide-react-native';
import { Project, Song, ProjectWithSongs } from '../../types/database';
import { cn } from '../../lib/utils';

interface ProjectManagerProps {
  projects: ProjectWithSongs[];
  onProjectSelect: (project: Project) => void;
  onSongSelect: (song: Song, project: Project) => void;
  onProjectCreate: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => void;
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void;
  onProjectDelete: (projectId: string) => void;
  onSongCreate: (projectId: string) => void;
  className?: string;
}

const PROJECT_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];

export function ProjectManager({
  projects,
  onProjectSelect,
  onSongSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onSongCreate,
  className
}: ProjectManagerProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

  const createProject = useCallback(() => {
    if (!newProjectTitle.trim()) return;

    const newProject = {
      user_id: 'current-user-id', // Would get from auth context
      title: newProjectTitle.trim(),
      description: newProjectDescription.trim() || null,
      color: selectedColor,
      is_archived: false,
    };

    onProjectCreate(newProject);
    
    // Reset form
    setNewProjectTitle('');
    setNewProjectDescription('');
    setSelectedColor(PROJECT_COLORS[0]);
    setIsCreatingProject(false);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newProjectTitle, newProjectDescription, selectedColor, onProjectCreate]);

  const deleteProject = useCallback((projectId: string, projectTitle: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectTitle}" and all its songs? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onProjectDelete(projectId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  }, [onProjectDelete]);

  const archiveProject = useCallback((projectId: string, isArchived: boolean) => {
    onProjectUpdate(projectId, { is_archived: !isArchived });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onProjectUpdate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSongCount = (project: ProjectWithSongs) => {
    return project.songs?.filter(song => !song.is_archived).length || 0;
  };

  const getRecentSongs = (project: ProjectWithSongs) => {
    return project.songs
      ?.filter(song => !song.is_archived)
      .sort((a, b) => new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime())
      .slice(0, 3) || [];
  };

  return (
    <View className={cn('flex-1 bg-background', className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-lg font-semibold">📂 Projects</Text>
        <Button
          onPress={() => setIsCreatingProject(true)}
          size="sm"
          className="flex-row items-center gap-1"
        >
          <Plus size={16} />
          <Text>New Project</Text>
        </Button>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Create Project Form */}
        {isCreatingProject && (
          <View className="m-4 p-4 border border-border rounded-lg bg-card">
            <Text className="text-lg font-medium mb-4">Create New Project</Text>
            
            <TextInput
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
              placeholder="Project title..."
              className="text-base p-3 border border-input rounded-lg mb-3"
              autoFocus
            />
            
            <TextInput
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              placeholder="Description (optional)..."
              multiline
              numberOfLines={2}
              className="text-base p-3 border border-input rounded-lg mb-4"
              textAlignVertical="top"
            />

            {/* Color Picker */}
            <Text className="text-sm font-medium mb-2">Project Color</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {PROJECT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2',
                    selectedColor === color ? 'border-foreground' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>

            <View className="flex-row gap-2">
              <Button
                variant="outline"
                onPress={() => setIsCreatingProject(false)}
                className="flex-1"
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                onPress={createProject}
                disabled={!newProjectTitle.trim()}
                className="flex-1"
              >
                <Text>Create</Text>
              </Button>
            </View>
          </View>
        )}

        {/* Projects List */}
        <View className="p-4 space-y-4">
          {projects.length === 0 ? (
            <View className="py-12 items-center">
              <Folder size={48} className="text-mutedForeground mb-4" />
              <Text className="text-lg font-medium mb-2">No Projects Yet</Text>
              <Text className="text-center text-mutedForeground mb-4 max-w-xs">
                Create your first project to start organizing your songs and ideas.
              </Text>
              <Button onPress={() => setIsCreatingProject(true)}>
                <Text>Create First Project</Text>
              </Button>
            </View>
          ) : (
            projects.map((project) => (
              <View
                key={project.id}
                className="border border-border rounded-lg bg-card overflow-hidden"
              >
                {/* Project Header */}
                <Pressable
                  onPress={() => onProjectSelect(project)}
                  className="p-4 active:bg-muted"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <View className="flex-1">
                        <Text className="text-lg font-medium">{project.title}</Text>
                        {project.description && (
                          <Text className="text-sm text-mutedForeground mt-1">
                            {project.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    <Pressable className="p-1">
                      <MoreVertical size={16} className="text-mutedForeground" />
                    </Pressable>
                  </View>

                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <Music size={14} className="text-mutedForeground" />
                        <Text className="text-sm text-mutedForeground">
                          {getSongCount(project)} songs
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Calendar size={14} className="text-mutedForeground" />
                        <Text className="text-sm text-mutedForeground">
                          {formatDate(project.updated_at)}
                        </Text>
                      </View>
                    </View>

                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => onSongCreate(project.id)}
                    >
                      <Plus size={14} />
                      <Text className="text-xs ml-1">Song</Text>
                    </Button>
                  </View>
                </Pressable>

                {/* Recent Songs */}
                {getRecentSongs(project).length > 0 && (
                  <View className="border-t border-border bg-muted/30">
                    <Text className="text-xs font-medium text-mutedForeground p-3 pb-2">
                      Recent Songs
                    </Text>
                    {getRecentSongs(project).map((song) => (
                      <Pressable
                        key={song.id}
                        onPress={() => onSongSelect(song, project)}
                        className="flex-row items-center justify-between px-3 py-2 active:bg-muted"
                      >
                        <View className="flex-1">
                          <Text className="font-medium">{song.title}</Text>
                          <View className="flex-row items-center gap-2 mt-1">
                            {song.mood && (
                              <Text className="text-xs text-mutedForeground">
                                {song.mood}
                              </Text>
                            )}
                            {song.genre && (
                              <Text className="text-xs text-mutedForeground">
                                • {song.genre}
                              </Text>
                            )}
                            <Text className="text-xs text-mutedForeground">
                              • {formatDate(song.last_accessed_at)}
                            </Text>
                          </View>
                        </View>
                        <Music size={16} className="text-mutedForeground" />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}