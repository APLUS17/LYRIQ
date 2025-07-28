import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";

import { Session } from "@supabase/supabase-js";

import { supabase, enhancedAuth } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();

	const signUp = async (email: string, password: string) => {
		try {
			// Check network status first
			const isNetworkAvailable = await enhancedAuth.checkNetworkStatus();
			if (!isNetworkAvailable) {
				console.error("Network unavailable for sign up");
				return;
			}

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				console.error("Error signing up:", error);
				return;
			}

			if (data.session) {
				setSession(data.session);
				console.log("User signed up:", data.user);
			} else {
				console.log("No user returned from sign up");
			}
		} catch (error) {
			console.error("Network error during sign up:", error);
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			// Check network status first
			const isNetworkAvailable = await enhancedAuth.checkNetworkStatus();
			if (!isNetworkAvailable) {
				console.error("Network unavailable for sign in");
				return;
			}

			// Use enhanced sign-in with retry logic
			const result = await enhancedAuth.signInWithRetry({ email, password });

			if (result.error) {
				console.error("Error signing in:", result.error);
				return;
			}

			if (result.data.session) {
				setSession(result.data.session);
				console.log("User signed in:", result.data.user);
			} else {
				console.log("No user returned from sign in");
			}
		} catch (error) {
			console.error("Network error during sign in:", error);
		}
	};

	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("Error signing out:", error);
				return;
			} else {
				console.log("User signed out");
			}
		} catch (error) {
			console.error("Network error during sign out:", error);
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				// For testing: create a mock session to bypass auth
				const mockSession = {
					user: { id: 'test-user', email: 'test@example.com' },
					access_token: 'mock-token'
				} as Session;
				
				setSession(mockSession);
				console.log("Using mock session for testing");
			} catch (error) {
				console.error("Error initializing auth:", error);
			}

			setInitialized(true);
		};

		initializeAuth();
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			if (session) {
				router.replace("/");
			} else {
				router.replace("/welcome");
			}
		}
		// eslint-disable-next-line
	}, [initialized, session]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
