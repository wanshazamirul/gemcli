'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CommandInputProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
}

/**
 * CommandInput - Terminal-style input field with command history
 *
 * Features:
 * - Green prompt "> " indicator
 * - Command history navigation (up/down arrows)
 * - Tab autocomplete for commands
 * - Blinking block cursor (█)
 * - Auto-focus on mount
 */
export const CommandInput: React.FC<CommandInputProps> = ({
  onCommand,
  disabled = false
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Available commands for autocomplete
  const commands = ['/help', '/new', '/clear', '/export', '/import', '/theme'];

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onCommand(input.trim());
      setHistory(prev => [...prev, input.trim()]);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1
          ? historyIndex + 1
          : historyIndex;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
    // Tab autocomplete
    else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = commands.filter(cmd =>
        cmd.startsWith(input.toLowerCase())
      );
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Prompt indicator */}
      <span className="font-mono text-green-500 text-lg mr-2 whitespace-nowrap">
        {'> '}
      </span>

      {/* Input field with blinking cursor */}
      <div className="flex-1 relative font-mono text-green-400">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full bg-transparent border-none outline-none
            text-green-400 text-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            caret-transparent
          `}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Custom blinking cursor */}
        <motion.span
          className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            left: `${input.length}ch`,
            marginLeft: '2px'
          }}
        >
          █
        </motion.span>
      </div>

      {/* Submit hint */}
      <span className="font-mono text-green-600 text-xs ml-2 whitespace-nowrap opacity-50">
        [Enter]
      </span>
    </motion.form>
  );
};
