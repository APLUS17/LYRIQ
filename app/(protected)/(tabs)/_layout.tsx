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
					borderTopWidth: 1,
					paddingBottom: 12,
					paddingTop: 12,
					height: 88,
					elevation: 8,
					shadowColor: '#000',
					shadowOffset: {
						width: 0,
						height: -2,
					},
					shadowOpacity: 0.1,
					shadowRadius: 8,
				},
				tabBarActiveTintColor: isDark ? colors.dark.primary : colors.light.primary,
				tabBarInactiveTintColor: isDark ? colors.dark.mutedForeground : colors.light.mutedForeground,
				tabBarShowLabel: true,
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '600',
					marginTop: 4,
				},
				tabBarIconStyle: {
					marginBottom: 2,
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
