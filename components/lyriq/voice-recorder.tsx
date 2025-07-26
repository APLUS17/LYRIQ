import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Pressable, Alert, Animated } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
// import * as Haptics from 'expo-haptics';
// import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Mic, Square, Play, Pause, Trash2, Save } from 'lucide-react-native';
import { VoiceRecording, WaveformData } from '../../types/database';
import { cn } from '../../lib/utils';

interface VoiceRecorderProps {
  songId: string;
  sectionId?: string;
  onRecordingSaved: (recording: VoiceRecording) => void;
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'recorded' | 'playing';

export function VoiceRecorder({ 
  songId, 
  sectionId, 
  onRecordingSaved,
  className 
}: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  // const [currentRecording, setCurrentRecording] = useState<Audio.Recording | null>(null);
  // const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTime = useRef<number>(0);

  // Setup audio permissions and mode
  useEffect(() => {
    setupAudio();
    return () => {
      cleanup();
    };
  }, []);

  const setupAudio = async () => {
    // Audio setup disabled for now
    console.log('Audio setup disabled - add expo-av for full functionality');
  };

  const cleanup = useCallback(async () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    // Audio cleanup disabled
    /*
    if (currentRecording) {
      await currentRecording.stopAndUnloadAsync();
    }
    
    if (currentSound) {
      await currentSound.unloadAsync();
    }
    */
  }, [currentRecording, currentSound]);

  const startRecording = useCallback(async () => {
    // Audio recording disabled for now
    Alert.alert('Audio Disabled', 'Audio recording is temporarily disabled. Install expo-av to enable.');
    return;
    
    /*
    try {
      setIsLoading(true);
      
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      setCurrentRecording(recording);
      setState('recording');
      recordingStartTime.current = Date.now();
      setDuration(0);
      
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start duration counter
      durationInterval.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 1000);

      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
    */
  }, [pulseAnim]);

  const stopRecording = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!currentRecording) return;
      
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      if (uri) {
        setRecordingUri(uri);
        setState('recorded');
        
        // Generate simple waveform data (in a real app, you'd analyze the audio)
        const mockWaveform: WaveformData = {
          peaks: Array.from({ length: 50 }, () => Math.random() * 100),
          duration,
          sampleRate: 44100,
        };
        
        // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setCurrentRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording.');
    } finally {
      setIsLoading(false);
    }
  }, [currentRecording, duration, pulseAnim]);

  const playRecording = useCallback(async () => {
    // Audio playback disabled for now
    Alert.alert('Audio Disabled', 'Audio playback is temporarily disabled. Install expo-av to enable.');
    return;
    
    /*
    try {
      if (!recordingUri) return;
      
      if (state === 'playing') {
        await currentSound?.pauseAsync();
        setState('recorded');
        return;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setCurrentSound(sound);
      setState('playing');
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setState('recorded');
        }
      });
      
      await sound.playAsync();
      // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to play recording:', error);
    }
    */
  }, [recordingUri, state]);

  const discardRecording = useCallback(async () => {
    Alert.alert(
      'Discard Recording',
      'Are you sure you want to discard this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            if (currentSound) {
              await currentSound.unloadAsync();
              setCurrentSound(null);
            }
            
            if (recordingUri) {
              try {
                await FileSystem.deleteAsync(recordingUri);
              } catch (error) {
                console.error('Failed to delete recording file:', error);
              }
            }
            
            setRecordingUri(null);
            setState('idle');
            setDuration(0);
            // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      ]
    );
  }, [currentSound, recordingUri]);

  const saveRecording = useCallback(async () => {
    if (!recordingUri) return;
    
    try {
      setIsLoading(true);
      
      // In a real app, you would upload to Supabase storage here
      const fileName = `recording-${Date.now()}.m4a`;
      const storagePath = `recordings/${songId}/${fileName}`;
      
      // Mock recording data for now
      const recording: VoiceRecording = {
        id: `recording-${Date.now()}`,
        song_id: songId,
        section_id: sectionId || null,
        user_id: 'current-user-id', // Would get from auth context
        title: `Voice Memo ${new Date().toLocaleDateString()}`,
        file_path: storagePath,
        duration_seconds: duration,
        waveform_data: {
          peaks: Array.from({ length: 50 }, () => Math.random() * 100),
          duration,
          sampleRate: 44100,
        },
        transcription: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      onRecordingSaved(recording);
      
      // Reset state
      if (currentSound) {
        await currentSound.unloadAsync();
        setCurrentSound(null);
      }
      
      setRecordingUri(null);
      setState('idle');
      setDuration(0);
      
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save recording:', error);
      Alert.alert('Save Error', 'Failed to save recording. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [recordingUri, songId, sectionId, duration, onRecordingSaved, currentSound]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className={cn('p-4 border border-border rounded-lg bg-card', className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold">🎤 MUMBL</Text>
        {duration > 0 && (
          <Text className="text-sm font-mono text-mutedForeground">
            {formatDuration(duration)}
          </Text>
        )}
      </View>

      {/* Recording Controls */}
      <View className="items-center">
        {state === 'idle' && (
          <Pressable
            onPress={startRecording}
            disabled={isLoading}
            className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4 active:scale-95"
          >
            <Mic size={32} className="text-primaryForeground" />
          </Pressable>
        )}

        {state === 'recording' && (
          <Animated.View
            style={{ transform: [{ scale: pulseAnim }] }}
            className="relative mb-4"
          >
            <Pressable
              onPress={stopRecording}
              disabled={isLoading}
              className="w-20 h-20 bg-recordingActive rounded-full items-center justify-center active:scale-95"
            >
              <Square size={24} className="text-white" fill="white" />
            </Pressable>
            
            {/* Pulse ring */}
            <View className="absolute inset-0 w-20 h-20 bg-recordingPulse rounded-full opacity-30" />
          </Animated.View>
        )}

        {(state === 'recorded' || state === 'playing') && (
          <View className="items-center mb-4">
            {/* Simple waveform visualization */}
            <View className="flex-row items-end h-16 w-48 mb-4 px-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <View
                  key={i}
                  className="flex-1 bg-waveform mx-px rounded-t"
                  style={{
                    height: Math.random() * 60 + 4, // Mock waveform
                    opacity: state === 'playing' ? 0.8 : 0.4,
                  }}
                />
              ))}
            </View>
            
            {/* Playback controls */}
            <View className="flex-row items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onPress={discardRecording}
                disabled={isLoading}
              >
                <Trash2 size={16} className="text-destructive" />
              </Button>
              
              <Pressable
                onPress={playRecording}
                disabled={isLoading}
                className="w-12 h-12 bg-primary rounded-full items-center justify-center active:scale-95"
              >
                {state === 'playing' ? (
                  <Pause size={20} className="text-primaryForeground" />
                ) : (
                  <Play size={20} className="text-primaryForeground ml-1" />
                )}
              </Pressable>
              
              <Button
                variant="outline"
                size="sm"
                onPress={saveRecording}
                disabled={isLoading}
              >
                <Save size={16} className="text-accent" />
              </Button>
            </View>
          </View>
        )}

        {/* Instructions */}
        <Text className="text-center text-sm text-mutedForeground max-w-xs">
          {state === 'idle' && 'Tap to start recording your voice memo'}
          {state === 'recording' && 'Recording... Tap to stop'}
          {state === 'recorded' && 'Tap play to review, save to keep, or discard'}
          {state === 'playing' && 'Playing recording...'}
        </Text>
      </View>
    </View>
  );
}