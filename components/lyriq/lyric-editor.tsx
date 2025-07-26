import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import * as Haptics from 'expo-haptics';
import { ChevronDown, ChevronRight, Plus, Grip } from 'lucide-react-native';
import { SongSection, SectionType } from '../../types/database';
import { cn } from '../../lib/utils';

interface LyricEditorProps {
  songId: string;
  sections: SongSection[];
  onSectionsChange: (sections: SongSection[]) => void;
  onSave: () => void;
  className?: string;
}

const SECTION_TYPES: { type: SectionType; label: string; icon: string }[] = [
  { type: 'intro', label: 'Intro', icon: '🎵' },
  { type: 'verse', label: 'Verse', icon: '📝' },
  { type: 'pre-chorus', label: 'Pre-Chorus', icon: '🔄' },
  { type: 'chorus', label: 'Chorus', icon: '🎤' },
  { type: 'bridge', label: 'Bridge', icon: '🌉' },
  { type: 'outro', label: 'Outro', icon: '🎭' },
  { type: 'custom', label: 'Custom', icon: '✨' },
];

export function LyricEditor({ 
  songId, 
  sections, 
  onSectionsChange, 
  onSave,
  className 
}: LyricEditorProps) {
  const [isDirty, setIsDirty] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const updateSection = useCallback((sectionId: string, updates: Partial<SongSection>) => {
    const newSections = sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    );
    onSectionsChange(newSections);
    setIsDirty(true);
  }, [sections, onSectionsChange]);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSection(sectionId, { 
      is_collapsed: !sections.find(s => s.id === sectionId)?.is_collapsed 
    });
  }, [sections, updateSection]);

  const addSection = useCallback((type: SectionType) => {
    const newSection: SongSection = {
      id: `temp-${Date.now()}`, // Temporary ID until saved
      song_id: songId,
      type,
      title: type === 'custom' ? 'Custom Section' : null,
      lyrics: '',
      section_order: sections.length,
      is_collapsed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    onSectionsChange([...sections, newSection]);
    setActiveSection(newSection.id);
    setIsDirty(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [songId, sections, onSectionsChange]);

  const deleteSection = useCallback((sectionId: string) => {
    Alert.alert(
      'Delete Section',
      'Are you sure you want to delete this section? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newSections = sections.filter(s => s.id !== sectionId);
            onSectionsChange(newSections);
            setIsDirty(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  }, [sections, onSectionsChange]);

  const getSectionInfo = (type: SectionType) => {
    return SECTION_TYPES.find(t => t.type === type) || SECTION_TYPES[6]; // fallback to custom
  };

  const handleSave = useCallback(() => {
    onSave();
    setIsDirty(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [onSave]);

  // Auto-save after 30 seconds of inactivity
  useEffect(() => {
    if (!isDirty) return;
    
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, handleSave]);

  return (
    <View className={cn('flex-1 bg-lyricEditor', className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-border">
        <Text className="text-lg font-semibold">WRITER</Text>
        <View className="flex-row items-center gap-2">
          {isDirty && (
            <View className="w-2 h-2 bg-accent rounded-full" />
          )}
          <Button 
            variant="outline" 
            size="sm"
            onPress={handleSave}
            disabled={!isDirty}
          >
            <Text>Save</Text>
          </Button>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Sections */}
        {sections
          .sort((a, b) => a.section_order - b.section_order)
          .map((section) => {
            const sectionInfo = getSectionInfo(section.type);
            const isCollapsed = section.is_collapsed;
            const isActive = activeSection === section.id;

            return (
              <View 
                key={section.id} 
                className={cn(
                  'mb-4 border border-border rounded-lg overflow-hidden',
                  isActive && 'border-primary'
                )}
              >
                {/* Section Header */}
                <Pressable
                  onPress={() => toggleSectionCollapse(section.id)}
                  onLongPress={() => deleteSection(section.id)}
                  className={cn(
                    'flex-row items-center justify-between p-3 bg-card',
                    isCollapsed && 'border-b-0'
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg">{sectionInfo.icon}</Text>
                    <View>
                      <Text className="font-medium">
                        {section.title || sectionInfo.label}
                      </Text>
                      {isCollapsed && section.lyrics && (
                        <Text className="text-sm text-mutedForeground" numberOfLines={1}>
                          {section.lyrics.split('\n')[0]}...
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-2">
                    <Grip size={16} className="text-mutedForeground" />
                    {isCollapsed ? (
                      <ChevronRight size={20} className="text-mutedForeground" />
                    ) : (
                      <ChevronDown size={20} className="text-mutedForeground" />
                    )}
                  </View>
                </Pressable>

                {/* Section Content */}
                {!isCollapsed && (
                  <View className="p-4 bg-background">
                    {section.type === 'custom' && (
                      <TextInput
                        value={section.title || ''}
                        onChangeText={(text) => updateSection(section.id, { title: text })}
                        placeholder="Section name..."
                        className="text-base font-medium mb-3 p-2 border border-input rounded"
                        onFocus={() => setActiveSection(section.id)}
                      />
                    )}
                    
                    <TextInput
                      value={section.lyrics}
                      onChangeText={(text) => updateSection(section.id, { lyrics: text })}
                      placeholder="Start writing your lyrics..."
                      multiline
                      textAlignVertical="top"
                      className="text-base leading-6 min-h-[120px] p-3 border border-input rounded-lg"
                      onFocus={() => setActiveSection(section.id)}
                      onBlur={() => setActiveSection(null)}
                    />
                  </View>
                )}
              </View>
            );
          })}

        {/* Add Section Button */}
        <View className="mt-4">
          <Text className="text-sm font-medium text-mutedForeground mb-3">
            Add New Section
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {SECTION_TYPES.map((sectionType) => (
              <Button
                key={sectionType.type}
                variant="outline"
                size="sm"
                onPress={() => addSection(sectionType.type)}
                className="flex-row items-center gap-1"
              >
                <Text className="text-xs">{sectionType.icon}</Text>
                <Text className="text-xs">{sectionType.label}</Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Bottom padding */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}