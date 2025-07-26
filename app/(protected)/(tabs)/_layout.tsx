import React from "react";
import { Tabs } from "expo-router";
import { Folder, PenTool, Mic, Settings } from "lucide-react-native";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabsLayout() {
	const { colorScheme } = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: isDark ? colors.dark.card : colors.light.card,
					borderTopColor: isDark ? colors.dark.border : colors.light.border,
					paddingBottom: 8,
					paddingTop: 8,
					height: 80,
				},
				tabBarActiveTintColor: isDark ? colors.dark.primary : colors.light.primary,
				tabBarInactiveTintColor: isDark ? colors.dark.mutedForeground : colors.light.mutedForeground,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 10,
					fontWeight: '500',
					marginTop: 2,
				},
			}}
		>
			<Tabs.Screen 
				name="index" 
				options={{ 
					title: "Projects",
					tabBarIcon: ({ color, size }) => <Folder size={size} color={color} />
				}} 
			/>
			<Tabs.Screen 
				name="writer" 
				options={{ 
					title: "Writer",
					tabBarIcon: ({ color, size }) => <PenTool size={size} color={color} />
				}} 
			/>
			<Tabs.Screen 
				name="mumbl" 
				options={{ 
					title: "Mumbl",
					tabBarIcon: ({ color, size }) => <Mic size={size} color={color} />
				}} 
			/>
			<Tabs.Screen 
				name="settings" 
				options={{ 
					title: "Settings",
					tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />
				}} 
			/>
		</Tabs>
	);
}
