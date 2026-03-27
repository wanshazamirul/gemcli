'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from '@/components/terminal/Terminal';
import { MessageList } from '@/components/terminal/MessageList';
import { CommandInput } from '@/components/terminal/CommandInput';
import { Sidebar } from '@/components/terminal/Sidebar';
import { Menu } from 'lucide-react';
import { Message, Conversation } from '@/types';
import {
  createConversation,
  getConversation,
  saveConversation,
  getCurrentConversationId,
  setCurrentConversationId,
  generateId,
} from '@/lib/storage';
import { parseCommand } from '@/lib/command-parser';
import { streamChatWithGemini } from '@/lib/gemini-api';

/**
 * Main Page - Retro Terminal Chat Application
 *
 * Features:
 * - Terminal UI with CRT effects
 * - Message list with auto-scroll
 * - Command input with history
 * - Sidebar with conversation management
 * - AI chat integration with Gemini 2.5 Flash
 * - Command system (/help, /new, /clear, etc.)
 * - Local storage persistence
 */
export default function Home() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationIdState] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize conversation on mount
  useEffect(() => {
    const savedId = getCurrentConversationId();

    if (savedId) {
      // Load existing conversation
      const conversation = getConversation(savedId);
      if (conversation) {
        setCurrentConversationIdState(savedId);
        setMessages(conversation.messages);
      } else {
        // Saved conversation not found, create new
        createNewConversation();
      }
    } else {
      // No saved conversation, create new
      createNewConversation();
    }
  }, []);

  // Save conversation when messages change
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const conversation = getConversation(currentConversationId);
      if (conversation) {
        const updated: Conversation = {
          ...conversation,
          messages,
          updatedAt: new Date().toISOString(),
        };
        saveConversation(updated);
      }
    }
  }, [messages, currentConversationId]);

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(() => {
    const newConversation = createConversation();
    saveConversation(newConversation);
    setCurrentConversationId(newConversation.id);
    setCurrentConversationIdState(newConversation.id);
    setMessages([]);
  }, []);

  /**
   * Select an existing conversation
   */
  const selectConversation = useCallback((id: string) => {
    const conversation = getConversation(id);
    if (conversation) {
      setCurrentConversationId(id);
      setCurrentConversationIdState(id);
      setMessages(conversation.messages);
    }
  }, []);

  /**
   * Handle command input
   */
  const handleCommand = useCallback(async (input: string) => {
    // Check if input is a command
    const commandResult = parseCommand(input);

    if (commandResult) {
      // Handle command result
      if (commandResult.type === 'command') {
        if (commandResult.error) {
          // Add error message
          const errorMessage: Message = {
            id: generateId(),
            role: 'model',
            content: `Error: ${commandResult.error}`,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, errorMessage]);
        } else if (commandResult.output) {
          // Add command output as system message
          const outputMessage: Message = {
            id: generateId(),
            role: 'model',
            content: commandResult.output,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, outputMessage]);
        }

        // Handle command data (new conversation, load conversation, etc.)
        if (commandResult.data) {
          const data = commandResult.data as { id?: string; conversation?: Conversation; theme?: string };

          if (data.id) {
            // New conversation created
            selectConversation(data.id);
          } else if (data.conversation) {
            // Conversation loaded
            selectConversation(data.conversation.id);
          } else if (data.theme) {
            // Theme changed - page will reload due to localStorage change
            window.location.reload();
          }
        }

        // Handle delete command
        if (commandResult.output?.includes('Deleted conversation')) {
          // Create new conversation if no more exist
          const remaining = localStorage.getItem('retro-terminal-conversations');
          if (!remaining || JSON.parse(remaining).length === 0) {
            createNewConversation();
          }
        }

        return;
      }
    }

    // Not a command, treat as chat message
    if (!currentConversationId) {
      createNewConversation();
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Get AI response
    setIsLoading(true);

    try {
      let fullResponse = '';

      await streamChatWithGemini(
        input,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];

            if (lastMessage && lastMessage.role === 'model' && lastMessage.id === 'streaming') {
              // Update existing streaming message
              lastMessage.content = fullResponse;
            } else {
              // Add new streaming message
              const aiMessage: Message = {
                id: 'streaming',
                role: 'model',
                content: fullResponse,
                timestamp: new Date().toISOString(),
              };
              return [...newMessages, aiMessage];
            }

            return newMessages;
          });
        },
        messages.filter(m => m.id !== 'streaming').map(m => ({
          role: m.role,
          content: m.content,
        }))
      );

      // Replace streaming message with final message
      setMessages(prev => {
        const newMessages = [...prev];
        const streamingIndex = newMessages.findIndex(m => m.id === 'streaming');

        if (streamingIndex >= 0) {
          newMessages[streamingIndex] = {
            id: generateId(),
            role: 'model',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          };
        }

        return newMessages;
      });
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, createNewConversation, selectConversation]);

  return (
    <Terminal>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/30">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-green-500 hover:text-green-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu size={24} />
            </motion.button>
            <h1 className="font-mono text-green-400 text-lg font-bold">
              TERMINAL CHAT v1.0
            </h1>
          </div>
          <div className="font-mono text-green-600 text-xs">
            {currentConversationId ? `ID: ${currentConversationId.substring(0, 8)}...` : 'New Conversation'}
          </div>
        </div>

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input */}
        <div className="border-t border-green-500/30 p-4">
          <CommandInput onCommand={handleCommand} disabled={isLoading} />
        </div>

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectConversation={selectConversation}
          currentId={currentConversationId}
        />
      </div>
    </Terminal>
  );
}
