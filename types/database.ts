// LYRIQ Database Types
// Auto-generated types based on Supabase schema

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
          is_archived: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string;
          title: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          color?: string;
          created_at?: string;
          updated_at?: string;
          is_archived?: boolean;
        };
      };
      songs: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          tempo: number | null;
          key: string | null;
          mood: string | null;
          genre: string | null;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
          is_archived: boolean;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id?: string;
          title?: string;
          tempo?: number | null;
          key?: string | null;
          mood?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          is_archived?: boolean;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          title?: string;
          tempo?: number | null;
          key?: string | null;
          mood?: string | null;
          genre?: string | null;
          created_at?: string;
          updated_at?: string;
          last_accessed_at?: string;
          is_archived?: boolean;
        };
      };
      song_sections: {
        Row: {
          id: string;
          song_id: string;
          type: SectionType;
          title: string | null;
          lyrics: string;
          section_order: number;
          is_collapsed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          song_id: string;
          type: SectionType;
          title?: string | null;
          lyrics?: string;
          section_order?: number;
          is_collapsed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          song_id?: string;
          type?: SectionType;
          title?: string | null;
          lyrics?: string;
          section_order?: number;
          is_collapsed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      voice_recordings: {
        Row: {
          id: string;
          song_id: string;
          section_id: string | null;
          user_id: string;
          title: string;
          file_path: string;
          duration_seconds: number | null;
          waveform_data: WaveformData | null;
          transcription: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          song_id: string;
          section_id?: string | null;
          user_id?: string;
          title?: string;
          file_path: string;
          duration_seconds?: number | null;
          waveform_data?: WaveformData | null;
          transcription?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          song_id?: string;
          section_id?: string | null;
          user_id?: string;
          title?: string;
          file_path?: string;
          duration_seconds?: number | null;
          waveform_data?: WaveformData | null;
          transcription?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_sessions: {
        Row: {
          id: string;
          song_id: string;
          user_id: string;
          session_type: AISessionType;
          prompt: string;
          response: string;
          context: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          song_id: string;
          user_id?: string;
          session_type: AISessionType;
          prompt: string;
          response: string;
          context?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          song_id?: string;
          user_id?: string;
          session_type?: AISessionType;
          prompt?: string;
          response?: string;
          context?: Record<string, any> | null;
          created_at?: string;
        };
      };
      creative_sessions: {
        Row: {
          id: string;
          user_id: string;
          song_id: string;
          started_at: string;
          ended_at: string | null;
          session_mood: string | null;
          words_written: number;
          recordings_made: number;
          ai_requests: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string;
          song_id: string;
          started_at?: string;
          ended_at?: string | null;
          session_mood?: string | null;
          words_written?: number;
          recordings_made?: number;
          ai_requests?: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          song_id?: string;
          started_at?: string;
          ended_at?: string | null;
          session_mood?: string | null;
          words_written?: number;
          recordings_made?: number;
          ai_requests?: number;
          notes?: string | null;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          default_project_color: string;
          auto_save_interval: number;
          voice_recording_quality: RecordingQuality;
          ai_assistance_level: AssistanceLevel;
          dark_mode_enabled: boolean;
          haptic_feedback_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          default_project_color?: string;
          auto_save_interval?: number;
          voice_recording_quality?: RecordingQuality;
          ai_assistance_level?: AssistanceLevel;
          dark_mode_enabled?: boolean;
          haptic_feedback_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          default_project_color?: string;
          auto_save_interval?: number;
          voice_recording_quality?: RecordingQuality;
          ai_assistance_level?: AssistanceLevel;
          dark_mode_enabled?: boolean;
          haptic_feedback_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Enums and utility types
export type SectionType = 
  | 'verse' 
  | 'chorus' 
  | 'bridge' 
  | 'outro' 
  | 'pre-chorus' 
  | 'intro' 
  | 'custom';

export type AISessionType = 
  | 'lyric_help' 
  | 'rhyme_suggestion' 
  | 'mood_prompt' 
  | 'structure_advice';

export type RecordingQuality = 'low' | 'medium' | 'high';
export type AssistanceLevel = 'minimal' | 'medium' | 'active';

export interface WaveformData {
  peaks: number[];
  duration: number;
  sampleRate: number;
}

// Utility types for common operations
export type Project = Database['public']['Tables']['projects']['Row'];
export type Song = Database['public']['Tables']['songs']['Row'];
export type SongSection = Database['public']['Tables']['song_sections']['Row'];
export type VoiceRecording = Database['public']['Tables']['voice_recordings']['Row'];
export type AISession = Database['public']['Tables']['ai_sessions']['Row'];
export type CreativeSession = Database['public']['Tables']['creative_sessions']['Row'];
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

// Insert types
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type SongInsert = Database['public']['Tables']['songs']['Insert'];
export type SongSectionInsert = Database['public']['Tables']['song_sections']['Insert'];
export type VoiceRecordingInsert = Database['public']['Tables']['voice_recordings']['Insert'];
export type AISessionInsert = Database['public']['Tables']['ai_sessions']['Insert'];
export type CreativeSessionInsert = Database['public']['Tables']['creative_sessions']['Insert'];
export type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];

// Update types
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type SongUpdate = Database['public']['Tables']['songs']['Update'];
export type SongSectionUpdate = Database['public']['Tables']['song_sections']['Update'];
export type VoiceRecordingUpdate = Database['public']['Tables']['voice_recordings']['Update'];
export type AISessionUpdate = Database['public']['Tables']['ai_sessions']['Update'];
export type CreativeSessionUpdate = Database['public']['Tables']['creative_sessions']['Update'];
export type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

// Combined types for UI
export interface SongWithSections extends Song {
  sections: SongSection[];
  recordings?: VoiceRecording[];
}

export interface ProjectWithSongs extends Project {
  songs: Song[];
}

export interface SongWithProject extends Song {
  project: Project;
}

// LYRIQ-specific types
export interface LyricEditorState {
  songId: string;
  sections: SongSection[];
  activeSection: string | null;
  isDirty: boolean;
  lastSaved: Date;
}

export interface MumblRecording {
  id: string;
  title: string;
  duration: number;
  waveform: WaveformData;
  isPlaying: boolean;
  isRecording: boolean;
}

export interface MuseContext {
  songId: string;
  currentLyrics: string;
  mood?: string;
  genre?: string;
  recentSections: SongSection[];
}