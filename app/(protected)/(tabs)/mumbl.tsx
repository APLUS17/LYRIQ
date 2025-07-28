import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Play, Trash2 } from "lucide-react-native";

import { VoiceRecorder } from "@/components/lyriq/voice-recorder";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VoiceRecording } from "@/types/database";

// Mock data - replace with actual Supabase queries
const mockRecordings: VoiceRecording[] = [
	{
		id: "recording-1",
		song_id: "song-1",
		section_id: null,
		user_id: "user-1",
		title: "Voice Memo 1/20/2024",
		file_path: "recordings/song-1/memo-1.m4a",
		duration_seconds: 23.5,
		waveform_data: {
			peaks: Array.from({ length: 50 }, () => Math.random() * 100),
			duration: 23.5,
			sampleRate: 44100,
		},
		transcription: "Maybe we could start with something about the ocean waves...",
		notes: "First verse idea",
		created_at: "2024-01-20T10:30:00Z",
		updated_at: "2024-01-20T10:30:00Z",
	},
	{
		id: "recording-2",
		song_id: "song-2",
		section_id: "section-1",
		user_id: "user-1",
		title: "Chorus melody idea",
		file_path: "recordings/song-2/melody-1.m4a",
		duration_seconds: 15.2,
		waveform_data: {
			peaks: Array.from({ length: 30 }, () => Math.random() * 100),
			duration: 15.2,
			sampleRate: 44100,
		},
		transcription: null,
		notes: "Humming melody for the hook",
		created_at: "2024-01-19T16:45:00Z",
		updated_at: "2024-01-19T16:45:00Z",
	},
];

export default function MumblScreen() {
	const [recordings, setRecordings] = useState<VoiceRecording[]>(mockRecordings);
	const [selectedSong] = useState("song-1"); // In real app, get from navigation or context

	const handleRecordingSaved = (recording: VoiceRecording) => {
		setRecordings(prev => [recording, ...prev]);
		console.log("Recording saved:", recording);
		// TODO: Upload to Supabase storage and save metadata
	};

	const handleDeleteRecording = (recordingId: string) => {
		setRecordings(prev => prev.filter(r => r.id !== recordingId));
		console.log("Recording deleted:", recordingId);
		// TODO: Delete from Supabase storage and database
	};

	const formatDuration = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View className="bg-card border-b border-border shadow-sm">
					<View className="px-6 py-4">
						<Text className="text-2xl font-bold text-foreground mb-2">🎤 MUMBL</Text>
						<Text className="text-sm text-muted-foreground">
							Capture your voice memos and musical ideas instantly
						</Text>
					</View>
				</View>

				{/* Voice Recorder */}
				<View className="p-4">
					<VoiceRecorder
						songId={selectedSong}
						onRecordingSaved={handleRecordingSaved}
					/>
				</View>

				{/* Recent Recordings */}
				<View className="px-4 pb-4">
					<Text className="text-lg font-medium mb-4">Recent Recordings</Text>
					
					{recordings.length === 0 ? (
						<View className="py-8 items-center">
							<Text className="text-center text-mutedForeground mb-2">
								No recordings yet
							</Text>
							<Text className="text-center text-sm text-mutedForeground">
								Tap the microphone above to record your first voice memo
							</Text>
						</View>
					) : (
						<View className="space-y-3">
							{recordings.map((recording) => (
								<View
									key={recording.id}
									className="border border-border rounded-lg bg-card p-4"
								>
									{/* Recording Header */}
									<View className="flex-row items-start justify-between mb-3">
										<View className="flex-1">
											<Text className="font-medium">{recording.title}</Text>
											<Text className="text-sm text-mutedForeground mt-1">
												{formatDate(recording.created_at)} • {formatDuration(recording.duration_seconds || 0)}
											</Text>
										</View>
										<Button
											variant="ghost"
											size="sm"
											onPress={() => handleDeleteRecording(recording.id)}
										>
											<Trash2 size={16} className="text-destructive" />
										</Button>
									</View>

									{/* Waveform Visualization */}
									{recording.waveform_data && (
										<View className="flex-row items-end h-12 mb-3 px-2">
											{recording.waveform_data.peaks.slice(0, 24).map((peak, i) => (
												<View
													key={i}
													className="flex-1 bg-waveform mx-px rounded-t opacity-60"
													style={{
														height: Math.max(2, (peak / 100) * 40),
													}}
												/>
											))}
										</View>
									)}

									{/* Transcription */}
									{recording.transcription && (
										<View className="mb-3">
											<Text className="text-xs font-medium text-mutedForeground mb-1">
												Transcription:
											</Text>
											<Text className="text-sm italic">
												"{recording.transcription}"
											</Text>
										</View>
									)}

									{/* Notes */}
									{recording.notes && (
										<View className="mb-3">
											<Text className="text-xs font-medium text-mutedForeground mb-1">
												Notes:
											</Text>
											<Text className="text-sm">
												{recording.notes}
											</Text>
										</View>
									)}

									{/* Playback Controls */}
									<View className="flex-row items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											className="flex-row items-center gap-1"
										>
											<Play size={14} />
											<Text className="text-xs">Play</Text>
										</Button>
										
										{recording.section_id && (
											<View className="bg-muted px-2 py-1 rounded">
												<Text className="text-xs">Linked to section</Text>
											</View>
										)}
									</View>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Bottom padding */}
				<View className="h-20" />
			</ScrollView>
		</SafeAreaView>
	);
}