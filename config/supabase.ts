import { AppState } from "react-native";

import "react-native-get-random-values";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { ENV, isEnvConfigured, getEnvStatus } from "./env";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Enhanced error handling for Supabase authentication
const signInWithRetry = async (supabaseClient: any, credentials: any, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await supabaseClient.auth.signInWithPassword(credentials);
      return result;
    } catch (error) {
      console.log(`Sign-in attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`Authentication failed after ${maxRetries} attempts`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
};

// Check network connectivity before making requests
const checkNetworkStatus = async () => {
  try {
    // Simple network check
    const response = await fetch(supabaseUrl + "/rest/v1/", { 
      method: "HEAD"
    });
    return response.ok;
  } catch (error) {
    console.error("Network check failed:", error);
    return false;
  }
};

// Validate Supabase configuration
if (!isEnvConfigured()) {
  console.warn("⚠️  Supabase environment variables not properly configured!");
  console.warn("Please create a .env file with your Supabase credentials:");
  console.warn("EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here");
  console.warn("EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here");
  console.warn("Current status:", getEnvStatus());
}

class LargeSecureStore {
	private async _encrypt(key: string, value: string) {
		const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
		await SecureStore.setItemAsync(
			key,
			aesjs.utils.hex.fromBytes(encryptionKey),
		);
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}
	private async _decrypt(key: string, value: string) {
		const encryptionKeyHex = await SecureStore.getItemAsync(key);
		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}
		const cipher = new aesjs.ModeOfOperation.ctr(
			aesjs.utils.hex.toBytes(encryptionKeyHex),
			new aesjs.Counter(1),
		);
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}
	async getItem(key: string) {
		const encrypted = await AsyncStorage.getItem(key);
		if (!encrypted) {
			return encrypted;
		}
		return await this._decrypt(key, encrypted);
	}
	async removeItem(key: string) {
		await AsyncStorage.removeItem(key);
		await SecureStore.deleteItemAsync(key);
	}
	async setItem(key: string, value: string) {
		const encrypted = await this._encrypt(key, value);
		await AsyncStorage.setItem(key, encrypted);
	}
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: new LargeSecureStore(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
	global: {
		fetch: (url, options = {}) => {
			return fetch(url, options).catch(error => {
				console.error("Fetch error:", error);
				throw error;
			});
		}
	}
});

// Enhanced authentication methods with retry logic
export const enhancedAuth = {
	signInWithRetry: (credentials: any) => signInWithRetry(supabase, credentials),
	checkNetworkStatus,
};

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
