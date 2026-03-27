'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMessage } from '../messages/UserMessage';
import { AIMessage } from '../messages/AIMessage';
import { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

/**
 * MessageList - Scrollable message container with auto-scroll
 *
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Empty state with ASCII art welcome
 * - Smooth animations with Framer Motion
 * - Maps messages to UserMessage/AIMessage components
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      <AnimatePresence mode="popLayout">
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-full font-mono text-green-500"
          >
            {/* ASCII Art Welcome */}
            <pre className="text-xs sm:text-sm leading-tight whitespace-pre">
{`
 ██████╗ ███████╗ ██████╗ ███████╗██████╗ ███████╗
 ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝
 ██████╔╝█████╗  ██║     █████╗  ██║  ██║█████╗
 ██╔══██╗██╔══╝  ██║     ██╔══╝  ██║  ██║██╔══╝
 ██████╔╝███████╗╚██████╗███████╗██████╔╝███████╗
 ╚═════╝ ╚══════╝ ╚═════╝╚══════╝╚═════╝ ╚══════╝
`}
            </pre>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 text-center space-y-2"
            >
              <p className="text-green-400 text-sm">Welcome to Retro Terminal Chat</p>
              <p className="text-green-600 text-xs">Type /help for available commands</p>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-green-500 text-xs mt-4"
              >
                ▼ Ready for input ▼
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.3,
              delay: index === messages.length - 1 ? 0 : 0
            }}
          >
            {message.role === 'user' ? (
              <UserMessage
                content={message.content}
                timestamp={message.timestamp}
              />
            ) : (
              <AIMessage
                content={message.content}
                timestamp={message.timestamp}
              />
            )}
          </motion.div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-green-500 text-sm"
          >
            <span className="inline-flex items-center gap-2">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                █
              </motion.span>
              Thinking...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={scrollRef} />
    </div>
  );
};
