import { Conversation, Theme } from '@/types';

// Storage keys
const CONVERSATIONS_KEY = 'retro-terminal-conversations';
const CURRENT_CONVERSATION_KEY = 'retro-terminal-current';
const SETTINGS_KEY = 'retro-terminal-settings';

// SSR safety check
const isBrowser = typeof window !== 'undefined';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Create a new conversation
 */
export function createConversation(title?: string): Conversation {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title || 'New Conversation',
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

/**
 * Get all conversations from localStorage
 */
export function getConversations(): Conversation[] {
  if (!isBrowser) return [];

  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading conversations:', error);
    return [];
  }
}

/**
 * Save a conversation to localStorage
 */
export function saveConversation(conversation: Conversation): void {
  if (!isBrowser) return;

  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    if (existingIndex >= 0) {
      // Update existing conversation
      conversations[existingIndex] = conversation;
    } else {
      // Add new conversation
      conversations.push(conversation);
    }

    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Delete a conversation from localStorage
 */
export function deleteConversation(id: string): void {
  if (!isBrowser) return;

  try {
    const conversations = getConversations();
    const filtered = conversations.filter(c => c.id !== id);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(id: string): Conversation | undefined {
  if (!isBrowser) return undefined;

  try {
    const conversations = getConversations();
    return conversations.find(c => c.id === id);
  } catch (error) {
    console.error('Error getting conversation:', error);
    return undefined;
  }
}

/**
 * Get the current conversation ID
 */
export function getCurrentConversationId(): string | null {
  if (!isBrowser) return null;

  try {
    return localStorage.getItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Error reading current conversation ID:', error);
    return null;
  }
}

/**
 * Set the current conversation ID
 */
export function setCurrentConversationId(id: string | null): void {
  if (!isBrowser) return;

  try {
    if (id) {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error('Error setting current conversation ID:', error);
  }
}

/**
 * Get the current theme from settings
 */
export function getTheme(): Theme {
  if (!isBrowser) return 'green'; // Default theme

  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (!settings) return 'green';

    const parsed = JSON.parse(settings);
    return parsed.theme || 'green';
  } catch (error) {
    console.error('Error reading theme:', error);
    return 'green';
  }
}

/**
 * Set the theme in settings
 */
export function setTheme(theme: Theme): void {
  if (!isBrowser) return;

  try {
    const settings = localStorage.getItem(SETTINGS_KEY);
    const parsed = settings ? JSON.parse(settings) : {};
    parsed.theme = theme;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Error setting theme:', error);
  }
}
