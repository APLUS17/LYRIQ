import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";

import { LyricEditor } from "@/components/lyriq/lyric-editor";
import { AIAssistant } from "@/components/lyriq/ai-assistant";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Song, SongSection, AISession } from "@/types/database";

// Mock data - replace with actual data from navigation params and Supabase
const mockSong: Song = {
	id: "song-1",
	project_id: "1",
	user_id: "user-1",
	title: "Sunset Dreams",
	tempo: 120,
	key: "C",
	mood: "Uplifting",
	genre: "Pop",
	created_at: "2024-01-16T09:00:00Z",
	updated_at: "2024-01-18T14:20:00Z",
	last_accessed_at: "2024-01-20T15:30:00Z",
	is_archived: false,
};

const mockSections: SongSection[] = [
	{
		id: "section-1",
		song_id: "song-1",
		type: "verse",
		title: null,
		lyrics: "Walking down the beach at sunset\nColors painting all the sky\nFeeling like this moment's perfect\nNever want to say goodbye",
		section_order: 0,
		is_collapsed: false,
		created_at: "2024-01-16T09:30:00Z",
		updated_at: "2024-01-18T14:20:00Z",
	},
	{
		id: "section-2",
		song_id: "song-1",
		type: "chorus",
		title: null,
		lyrics: "These are the days we'll remember\nWhen the world was young and free\nThese are the dreams we'll hold forever\nYou and me, just you and me",
		section_order: 1,
		is_collapsed: false,
		created_at: "2024-01-16T10:00:00Z",
		updated_at: "2024-01-18T14:15:00Z",
	},
	{
		id: "section-3",
		song_id: "song-1",
		type: "verse",
		title: null,
		lyrics: "",
		section_order: 2,
		is_collapsed: true,
		created_at: "2024-01-18T14:20:00Z",
		updated_at: "2024-01-18T14:20:00Z",
	},
];

export default function WriterScreen() {
	const [song] = useState<Song>(mockSong);
	const [sections, setSections] = useState<SongSection[]>(mockSections);
	const [showAI, setShowAI] = useState(false);

	const handleSectionsChange = (newSections: SongSection[]) => {
		setSections(newSections);
		// TODO: Auto-save to Supabase
	};

	const handleSave = () => {
		console.log("Saving song and sections...");
		// TODO: Save to Supabase
	};

	const handleAISessionCreated = (session: AISession) => {
		console.log("AI session created:", session);
		// TODO: Save to Supabase
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 relative">
				{/* Song Header */}
				<View className="bg-card border-b border-border shadow-sm">
					<View className="px-6 py-4">
						<View className="flex-row items-center justify-between mb-3">
							<Text className="text-2xl font-bold text-foreground">{song.title}</Text>
							
							{/* MUSE Button */}
							<Pressable
								onPress={() => setShowAI(true)}
								className="w-14 h-14 bg-aiAssistant rounded-full items-center justify-center active:scale-95 shadow-lg"
							>
								<Sparkles size={24} className="text-white" />
							</Pressable>
						</View>
						
						{/* Song Metadata */}
						<View className="flex-row items-center flex-wrap gap-2">
							{song.mood && (
								<View className="bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
									<Text className="text-xs font-medium text-primary">{song.mood}</Text>
								</View>
							)}
							{song.genre && (
								<View className="bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
									<Text className="text-xs font-medium text-accent">{song.genre}</Text>
								</View>
							)}
							{song.key && (
								<View className="bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
									<Text className="text-xs font-medium text-secondary">Key: {song.key}</Text>
								</View>
							)}
							{song.tempo && (
								<View className="bg-muted px-3 py-1.5 rounded-full border border-border">
									<Text className="text-xs font-medium text-muted-foreground">{song.tempo} BPM</Text>
								</View>
							)}
						</View>
					</View>
				</View>

				{/* Lyric Editor */}
				<LyricEditor
					songId={song.id}
					sections={sections}
					onSectionsChange={handleSectionsChange}
					onSave={handleSave}
					className="flex-1"
				/>

				{/* AI Assistant Overlay */}
				<AIAssistant
					isVisible={showAI}
					onClose={() => setShowAI(false)}
					song={song}
					currentSections={sections}
					onSessionCreated={handleAISessionCreated}
				/>
			</View>
		</SafeAreaView>
	);
}