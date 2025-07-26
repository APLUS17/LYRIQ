import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import * as Haptics from 'expo-haptics';
import { Send, Sparkles, Lightbulb, Music, MessageCircle, X } from 'lucide-react-native';
import { AISession, AISessionType, Song, SongSection } from '../../types/database';
import { cn } from '../../lib/utils';

interface AIAssistantProps {
  isVisible: boolean;
  onClose: () => void;
  song: Song;
  currentSections: SongSection[];
  onSessionCreated: (session: AISession) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionType?: AISessionType;
}

const PROMPT_SUGGESTIONS = [
  {
    type: 'lyric_help' as AISessionType,
    icon: MessageCircle,
    title: 'Lyric Help',
    description: 'Get help with writing lyrics',
    prompts: [
      'Help me write a verse about...',
      'I need a rhyme for...',
      'Make this line more emotional',
      'Suggest alternative words for...'
    ]
  },
  {
    type: 'rhyme_suggestion' as AISessionType,
    icon: Music,
    title: 'Rhyme & Flow',
    description: 'Find rhymes and improve flow',
    prompts: [
      'What rhymes with...',
      'Improve the flow of these lines',
      'Make this more rhythmic',
      'Suggest internal rhymes'
    ]
  },
  {
    type: 'mood_prompt' as AISessionType,
    icon: Lightbulb,
    title: 'Creative Prompts',
    description: 'Get inspired with new ideas',
    prompts: [
      'Give me a creative writing prompt',
      'Help me explore this emotion',
      'What if this song was about...',
      'Inspire me with metaphors'
    ]
  },
  {
    type: 'structure_advice' as AISessionType,
    icon: Sparkles,
    title: 'Song Structure',
    description: 'Organize your song better',
    prompts: [
      'How should I structure this song?',
      'What section should come next?',
      'Help me with song arrangement',
      'Suggest a bridge idea'
    ]
  }
];

export function AIAssistant({ 
  isVisible, 
  onClose, 
  song, 
  currentSections, 
  onSessionCreated,
  className 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISessionType | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async (message: string, sessionType: AISessionType = 'lyric_help') => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
      sessionType,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context for AI
      const context = {
        songTitle: song.title,
        songMood: song.mood,
        songGenre: song.genre,
        songKey: song.key,
        songTempo: song.tempo,
        currentSections: currentSections.map(s => ({
          type: s.type,
          lyrics: s.lyrics,
        })),
        recentMessages: messages.slice(-3).map(m => ({
          type: m.type,
          content: m.content,
        })),
      };

      // In a real app, this would call the Claude API
      const mockResponse = generateMockResponse(message, sessionType, context);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: mockResponse,
        timestamp: new Date(),
        sessionType,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Create AI session record
      const session: AISession = {
        id: `session-${Date.now()}`,
        song_id: song.id,
        user_id: 'current-user-id', // Would get from auth context
        session_type: sessionType,
        prompt: message,
        response: mockResponse,
        context,
        created_at: new Date().toISOString(),
      };

      onSessionCreated(session);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [isLoading, messages, song, currentSections, onSessionCreated]);

  const handleSuggestionPress = useCallback((prompt: string, type: AISessionType) => {
    setSelectedSuggestion(type);
    sendMessage(prompt, type);
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSelectedSuggestion(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  if (!isVisible) return null;

  return (
    <View className={cn('absolute inset-0 bg-background z-50', className)}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border bg-card">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-aiAssistant rounded-full items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </View>
            <Text className="text-lg font-semibold">MUSE</Text>
          </View>
          
          <View className="flex-row items-center gap-2">
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onPress={clearChat}>
                <Text className="text-sm">Clear</Text>
              </Button>
            )}
            <Button variant="ghost" size="sm" onPress={onClose}>
              <X size={20} />
            </Button>
          </View>
        </View>

        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            /* Welcome State */
            <View className="flex-1 justify-center items-center py-8">
              <View className="w-16 h-16 bg-aiAssistant rounded-full items-center justify-center mb-4">
                <Sparkles size={24} className="text-white" />
              </View>
              <Text className="text-xl font-semibold mb-2">Hey, I'm MUSE!</Text>
              <Text className="text-center text-mutedForeground mb-6 max-w-xs">
                I'm here to help you write amazing lyrics. What would you like to work on?
              </Text>

              {/* Song Context */}
              <View className="w-full bg-card p-4 rounded-lg mb-6">
                <Text className="font-medium mb-2">Current Song: {song.title}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {song.mood && (
                    <View className="bg-muted px-2 py-1 rounded">
                      <Text className="text-xs">Mood: {song.mood}</Text>
                    </View>
                  )}
                  {song.genre && (
                    <View className="bg-muted px-2 py-1 rounded">
                      <Text className="text-xs">Genre: {song.genre}</Text>
                    </View>
                  )}
                  {song.key && (
                    <View className="bg-muted px-2 py-1 rounded">
                      <Text className="text-xs">Key: {song.key}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Suggestion Categories */}
              <View className="w-full space-y-3">
                {PROMPT_SUGGESTIONS.map((category) => (
                  <View key={category.type} className="bg-card p-4 rounded-lg">
                    <View className="flex-row items-center gap-2 mb-2">
                      <category.icon size={16} className="text-aiAssistant" />
                      <Text className="font-medium">{category.title}</Text>
                    </View>
                    <Text className="text-sm text-mutedForeground mb-3">
                      {category.description}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {category.prompts.map((prompt, index) => (
                        <Pressable
                          key={index}
                          onPress={() => handleSuggestionPress(prompt, category.type)}
                          className="bg-muted px-3 py-2 rounded-full active:bg-mutedForeground"
                        >
                          <Text className="text-xs">{prompt}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* Chat Messages */
            <View className="space-y-4">
              {messages.map((message) => (
                <View
                  key={message.id}
                  className={cn(
                    'flex-row',
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <View
                    className={cn(
                      'max-w-[80%] p-3 rounded-lg',
                      message.type === 'user'
                        ? 'bg-primary ml-12'
                        : 'bg-card mr-12'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm leading-5',
                        message.type === 'user' ? 'text-primaryForeground' : 'text-foreground'
                      )}
                    >
                      {message.content}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs mt-1 opacity-70',
                        message.type === 'user' ? 'text-primaryForeground' : 'text-mutedForeground'
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isLoading && (
                <View className="flex-row justify-start">
                  <View className="bg-card p-3 rounded-lg mr-12">
                    <Text className="text-sm text-mutedForeground">MUSE is thinking...</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View className="p-4 border-t border-border bg-card">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask MUSE anything..."
              multiline
              className="flex-1 min-h-[40px] max-h-[100px] p-3 border border-input rounded-lg text-base"
              style={{ textAlignVertical: 'top' }}
            />
            <Button
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="w-10 h-10 rounded-full"
            >
              <Send size={16} />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Mock response generator (replace with actual Claude API call)
function generateMockResponse(
  prompt: string, 
  sessionType: AISessionType, 
  context: any
): string {
  const responses = {
    lyric_help: [
      "I can help you with that! Based on your song's mood and the existing lyrics, here's a suggestion...",
      "Let me offer some lyrical ideas that would fit well with your current theme...",
      "Here's how you could develop that idea further in your lyrics..."
    ],
    rhyme_suggestion: [
      "Here are some rhymes that would work well with your flow...",
      "I notice your rhythm pattern - these words would maintain that feel...",
      "For better flow, consider these rhythmic alternatives..."
    ],
    mood_prompt: [
      "Here's a creative angle you might explore...",
      "What if you approached this emotion from this perspective...",
      "I'm sensing the mood you're going for - try this direction..."
    ],
    structure_advice: [
      "For your song structure, I'd suggest...",
      "Based on your current sections, the natural progression would be...",
      "To create better dynamics, consider this arrangement..."
    ]
  };

  const typeResponses = responses[sessionType];
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}