'use client';

import React from 'react';

interface UserMessageProps {
  content: string;
  timestamp: string;
}

/**
 * UserMessage - Displays user prompts in terminal style
 *
 * Shows user input with green color scheme for retro terminal aesthetic.
 * Format: "> prompt" with timestamp below.
 */
export const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  return (
    <div className="mb-4">
      {/* Prompt indicator */}
      <div className="font-mono text-green-500 text-sm mb-1">
        &gt; {content}
      </div>

      {/* Timestamp */}
      <div className="font-mono text-green-400 text-xs opacity-70">
        {timestamp}
      </div>
    </div>
  );
};
