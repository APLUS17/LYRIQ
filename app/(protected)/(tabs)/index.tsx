import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProjectManager } from "@/components/lyriq/project-manager";
import { Project, Song, ProjectWithSongs } from "@/types/database";

// Mock data - replace with actual Supabase queries
const mockProjects: ProjectWithSongs[] = [
	{
		id: "1",
		user_id: "user-1",
		title: "Summer Vibes",
		description: "Songs about summer, love, and good times",
		color: "#3b82f6",
		created_at: "2024-01-15T10:00:00Z",
		updated_at: "2024-01-20T15:30:00Z",
		is_archived: false,
		songs: [
			{
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
			},
			{
				id: "song-2",
				project_id: "1",
				user_id: "user-1",
				title: "Beach Walk",
				tempo: 95,
				key: "G",
				mood: "Relaxed",
				genre: "Acoustic",
				created_at: "2024-01-17T11:00:00Z",
				updated_at: "2024-01-19T16:45:00Z",
				last_accessed_at: "2024-01-19T16:45:00Z",
				is_archived: false,
			},
		],
	},
	{
		id: "2",
		user_id: "user-1",
		title: "Late Night Thoughts",
		description: "Introspective songs for quiet moments",
		color: "#8b5cf6",
		created_at: "2024-01-10T20:00:00Z",
		updated_at: "2024-01-12T22:15:00Z",
		is_archived: false,
		songs: [
			{
				id: "song-3",
				project_id: "2",
				user_id: "user-1",
				title: "3 AM Confessions",
				tempo: 75,
				key: "Em",
				mood: "Melancholic",
				genre: "Alternative",
				created_at: "2024-01-11T23:00:00Z",
				updated_at: "2024-01-12T22:15:00Z",
				last_accessed_at: "2024-01-12T22:15:00Z",
				is_archived: false,
			},
		],
	},
];

export default function ProjectsScreen() {
	const [projects, setProjects] = useState<ProjectWithSongs[]>(mockProjects);

	const handleProjectSelect = (project: Project) => {
		console.log("Selected project:", project.title);
		// Navigate to project detail or show songs
	};

	const handleSongSelect = (song: Song, project: Project) => {
		console.log("Selected song:", song.title, "from project:", project.title);
		// Navigate to song editor
		router.push("/(protected)/(tabs)/writer");
	};

	const handleProjectCreate = (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
		const project: ProjectWithSongs = {
			...newProject,
			id: `project-${Date.now()}`,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			songs: [],
		};
		setProjects(prev => [project, ...prev]);
	};

	const handleProjectUpdate = (projectId: string, updates: Partial<Project>) => {
		setProjects(prev => prev.map(p => 
			p.id === projectId 
				? { ...p, ...updates, updated_at: new Date().toISOString() }
				: p
		));
	};

	const handleProjectDelete = (projectId: string) => {
		setProjects(prev => prev.filter(p => p.id !== projectId));
	};

	const handleSongCreate = (projectId: string) => {
		console.log("Create new song in project:", projectId);
		// Navigate to song creator or create inline
		router.push("/(protected)/(tabs)/writer");
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ProjectManager
				projects={projects}
				onProjectSelect={handleProjectSelect}
				onSongSelect={handleSongSelect}
				onProjectCreate={handleProjectCreate}
				onProjectUpdate={handleProjectUpdate}
				onProjectDelete={handleProjectDelete}
				onSongCreate={handleSongCreate}
			/>
		</SafeAreaView>
	);
}
