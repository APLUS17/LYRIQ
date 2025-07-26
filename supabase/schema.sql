-- LYRIQ Database Schema
-- Songwriting app with projects, songs, sections, and voice recordings

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table (song collections/albums)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color for project organization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE
);

-- Songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Song',
    tempo INTEGER, -- BPM
    key VARCHAR(10), -- Musical key (C, D, Em, etc.)
    mood VARCHAR(50), -- Happy, Sad, Energetic, Chill, etc.
    genre VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_archived BOOLEAN DEFAULT FALSE
);

-- Song sections table (Verse, Chorus, Bridge, Outro, etc.)
CREATE TABLE song_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'verse', 'chorus', 'bridge', 'outro', 'pre-chorus', 'intro', 'custom'
    title VARCHAR(100), -- Optional custom section name
    lyrics TEXT DEFAULT '',
    section_order INTEGER NOT NULL DEFAULT 0,
    is_collapsed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice recordings table (MUMBL feature)
CREATE TABLE voice_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    section_id UUID REFERENCES song_sections(id) ON DELETE SET NULL, -- Optional section association
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Voice Memo',
    file_path VARCHAR(500) NOT NULL, -- Supabase storage path
    duration_seconds DECIMAL(10,2),
    waveform_data JSONB, -- Waveform visualization data
    transcription TEXT, -- Auto-generated or manual transcription
    notes TEXT, -- User notes about the recording
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI sessions table (MUSE feature)
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'lyric_help', 'rhyme_suggestion', 'mood_prompt', 'structure_advice'
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB, -- Current song context when request was made
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creative sessions table (track productive periods)
CREATE TABLE creative_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    session_mood VARCHAR(50), -- User's mood during session
    words_written INTEGER DEFAULT 0,
    recordings_made INTEGER DEFAULT 0,
    ai_requests INTEGER DEFAULT 0,
    notes TEXT -- Session reflections
);

-- User preferences table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_project_color VARCHAR(7) DEFAULT '#3b82f6',
    auto_save_interval INTEGER DEFAULT 30, -- seconds
    voice_recording_quality VARCHAR(10) DEFAULT 'high', -- 'low', 'medium', 'high'
    ai_assistance_level VARCHAR(10) DEFAULT 'medium', -- 'minimal', 'medium', 'active'
    dark_mode_enabled BOOLEAN DEFAULT FALSE,
    haptic_feedback_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_songs_project_id ON songs(project_id);
CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_last_accessed ON songs(last_accessed_at DESC);
CREATE INDEX idx_song_sections_song_id ON song_sections(song_id);
CREATE INDEX idx_song_sections_order ON song_sections(song_id, section_order);
CREATE INDEX idx_voice_recordings_song_id ON voice_recordings(song_id);
CREATE INDEX idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX idx_ai_sessions_song_id ON ai_sessions(song_id);
CREATE INDEX idx_creative_sessions_user_id ON creative_sessions(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Songs policies
CREATE POLICY "Users can view their own songs" ON songs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own songs" ON songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own songs" ON songs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own songs" ON songs FOR DELETE USING (auth.uid() = user_id);

-- Song sections policies (inherit from songs)
CREATE POLICY "Users can view sections of their songs" ON song_sections FOR SELECT 
USING (EXISTS (SELECT 1 FROM songs WHERE songs.id = song_sections.song_id AND songs.user_id = auth.uid()));
CREATE POLICY "Users can insert sections to their songs" ON song_sections FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM songs WHERE songs.id = song_sections.song_id AND songs.user_id = auth.uid()));
CREATE POLICY "Users can update sections of their songs" ON song_sections FOR UPDATE 
USING (EXISTS (SELECT 1 FROM songs WHERE songs.id = song_sections.song_id AND songs.user_id = auth.uid()));
CREATE POLICY "Users can delete sections of their songs" ON song_sections FOR DELETE 
USING (EXISTS (SELECT 1 FROM songs WHERE songs.id = song_sections.song_id AND songs.user_id = auth.uid()));

-- Voice recordings policies
CREATE POLICY "Users can view their own recordings" ON voice_recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own recordings" ON voice_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recordings" ON voice_recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recordings" ON voice_recordings FOR DELETE USING (auth.uid() = user_id);

-- AI sessions policies
CREATE POLICY "Users can view their own AI sessions" ON ai_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI sessions" ON ai_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creative sessions policies
CREATE POLICY "Users can view their own creative sessions" ON creative_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own creative sessions" ON creative_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own creative sessions" ON creative_sessions FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamps
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_song_sections_updated_at BEFORE UPDATE ON song_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_voice_recordings_updated_at BEFORE UPDATE ON voice_recordings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update song's last_accessed_at when sections are modified
CREATE OR REPLACE FUNCTION update_song_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE songs SET last_accessed_at = NOW() WHERE id = NEW.song_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_song_access_on_section_change 
AFTER INSERT OR UPDATE ON song_sections 
FOR EACH ROW EXECUTE FUNCTION update_song_last_accessed();