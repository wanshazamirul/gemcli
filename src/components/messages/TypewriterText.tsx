'use client';

import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

/**
 * TypewriterText - Character-by-character text display with blinking cursor
 *
 * Animates text appearance one character at a time for authentic terminal feel.
 * Features a blinking block cursor (█) at the end during animation.
 */
export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 20,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let index = 0;
    let timeout: NodeJS.Timeout;

    const typeNextChar = () => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        timeout = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    typeNextChar();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [text, speed, onComplete]);

  return (
    <span className="font-mono">
      {displayedText}
      {!isComplete && (
        <span className="animate-pulse">█</span>
      )}
    </span>
  );
};
