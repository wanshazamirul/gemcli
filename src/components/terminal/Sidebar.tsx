'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '@/types';
import {
  getConversations,
  createConversation,
  deleteConversation,
  getCurrentConversationId,
} from '@/lib/storage';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  currentId: string | null;
}

/**
 * Sidebar - Slide-in conversation list
 *
 * Features:
 * - Slide-in animation from left
 * - Conversation list with create/delete/load
 * - Backdrop overlay
 * - "No conversations yet" empty state
 * - "+ New Conversation" button
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  currentId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Load conversations on mount and when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = () => {
    const loaded = getConversations();
    // Sort by updated date (newest first)
    const sorted = loaded.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    setConversations(sorted);
  };

  const handleCreateConversation = () => {
    const newConversation = createConversation();
    onSelectConversation(newConversation.id);
    loadConversations();
    onClose();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);

      // If we deleted the current conversation, create a new one
      if (id === currentId) {
        const remaining = getConversations();
        if (remaining.length > 0) {
          onSelectConversation(remaining[0].id);
        } else {
          const newConv = createConversation();
          onSelectConversation(newConv.id);
        }
      }

      loadConversations();
    }
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="
              fixed left-0 top-0 h-full w-80
              bg-zinc-950 border-r border-green-500/30
              z-50 overflow-hidden
            "
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-green-500/30">
                <h2 className="font-mono text-green-400 text-lg font-bold">
                  Conversations
                </h2>
                <button
                  onClick={onClose}
                  className="font-mono text-green-500 hover:text-green-300 text-sm"
                >
                  [ESC]
                </button>
              </div>

              {/* New conversation button */}
              <div className="p-4 border-b border-green-500/20">
                <motion.button
                  onClick={handleCreateConversation}
                  className="
                    w-full flex items-center justify-center gap-2
                    bg-green-500/10 hover:bg-green-500/20
                    border border-green-500/30 hover:border-green-500/50
                    text-green-400 hover:text-green-300
                    font-mono text-sm py-2 px-4
                    transition-colors
                  "
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={16} />
                  <span>+ New Conversation</span>
                </motion.button>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <MessageSquare className="mx-auto mb-2 text-green-600" size={32} />
                    <p className="font-mono text-green-500 text-sm">
                      No conversations yet
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`
                        relative p-3 rounded cursor-pointer
                        border transition-all
                        ${currentId === conversation.id
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-zinc-900/50 border-green-500/20 hover:border-green-500/40 hover:bg-zinc-900/80'
                        }
                      `}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Title */}
                      <div className="font-mono text-green-400 text-sm truncate pr-6">
                        {conversation.title}
                      </div>

                      {/* Message count */}
                      <div className="font-mono text-green-600 text-xs mt-1">
                        {conversation.messages.length} messages
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                        className="
                          absolute top-2 right-2
                          text-green-600 hover:text-red-400
                          transition-colors
                          p-1
                        "
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-green-500/30">
                <div className="font-mono text-green-600 text-xs text-center">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
