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
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [cursorOffset, setCursorOffset] = useState(0);

  // Available commands for autocomplete
  const commands = ['/help', '/new', '/clear', '/export', '/import', '/theme'];

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Track cursor position
  useEffect(() => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0);
    }
  }, [input]);

  // Calculate cursor offset based on text width
  useEffect(() => {
    if (measureRef.current) {
      const textBeforeCursor = input.slice(0, cursorPosition);
      measureRef.current.textContent = textBeforeCursor;
      setCursorOffset(measureRef.current.offsetWidth);
    }
  }, [input, cursorPosition]);

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
        {/* Hidden input that captures all events */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setCursorPosition(e.target.selectionStart || 0);
          }}
          onSelect={(e) => {
            setCursorPosition(e.target.selectionStart || 0);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`
            w-full bg-transparent border-none outline-none
            text-green-400 text-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            caret-transparent
            absolute
            opacity-0
            z-10
          `}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Visible text display */}
        <span className="text-green-400 text-lg whitespace-pre">
          {input}
        </span>

        {/* Hidden span for measuring cursor position */}
        <span
          ref={measureRef}
          className="absolute invisible whitespace-pre text-lg"
          style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          {input.slice(0, cursorPosition)}
        </span>

        {/* Custom blinking cursor */}
        <motion.span
          className="absolute top-0 pointer-events-none text-green-400 text-lg"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            left: `${cursorOffset}px`
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
