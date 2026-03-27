'use client';

import React from 'react';
import { AsciiBorder } from '../terminal/AsciiBorder';
import { TypewriterText } from './TypewriterText';

interface AIMessageProps {
  content: string;
  timestamp: string;
}

/**
 * AIMessage - Displays AI responses with typewriter effect
 *
 * Wraps AI content in AsciiBorder for visual distinction.
 * Uses TypewriterText for character-by-character streaming animation.
 * Green color scheme throughout for terminal authenticity.
 */
export const AIMessage: React.FC<AIMessageProps> = ({ content, timestamp }) => {
  return (
    <div className="mb-6">
      {/* AI Label */}
      <div className="font-mono text-green-500 text-sm mb-2">
        AI Assistant:
      </div>

      {/* Response in ASCII Border */}
      <AsciiBorder>
        <TypewriterText text={content} speed={20} />
      </AsciiBorder>

      {/* Timestamp */}
      <div className="font-mono text-green-400 text-xs opacity-70 mt-2">
        {timestamp}
      </div>
    </div>
  );
};
