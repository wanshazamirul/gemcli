'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '@/types';
import { getTheme } from '@/lib/storage';

interface TerminalProps {
  children: React.ReactNode;
}

/**
 * Terminal - Main container with CRT effects
 *
 * Features:
 * - CRT scanlines overlay
 * - Vignette effect
 * - Screen flicker animation
 * - Boot sequence animation (1.5s)
 * - Theme support (green/amber with different glow colors)
 * - Loads theme from localStorage
 */
export const Terminal: React.FC<TerminalProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('green');
  const [isBooting, setIsBooting] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const savedTheme = getTheme();
    setTheme(savedTheme);

    // Finish boot sequence after 1.5s
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 1500);

    return () => clearTimeout(bootTimer);
  }, []);

  // Theme colors
  const themeColors = {
    green: {
      primary: 'text-green-400',
      glow: 'shadow-green-500/50',
      scanline: 'from-green-500/10',
    },
    amber: {
      primary: 'text-amber-400',
      glow: 'shadow-amber-500/50',
      scanline: 'from-amber-500/10',
    },
  };

  const colors = themeColors[theme];

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Boot sequence overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black"
          >
            <div className={`font-mono ${colors.primary} text-center`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-lg mb-2">TERMINAL CHAT v1.0</div>
                <motion.div
                  className="text-sm opacity-70"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Booting...
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT Scanlines effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className={`
            absolute inset-0 bg-gradient-to-b
            ${colors.scanline} to-transparent
            opacity-20
          `}
          style={{
            backgroundSize: '100% 4px',
            backgroundRepeat: 'repeat-y',
          }}
        />
      </div>

      {/* CRT Vignette effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle, transparent 50%, rgba(0,0,0,0.8) 100%)',
          }}
        />
      </div>

      {/* Screen flicker animation */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        animate={{
          opacity: [0.95, 1, 0.98, 1, 0.95],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <div className="absolute inset-0 bg-white opacity-[0.03]" />
      </motion.div>

      {/* Main content with glow effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className={`
          relative z-0 min-h-screen
          ${colors.glow}
        `}
        style={{
          filter: 'contrast(1.1) brightness(1.1)',
        }}
      >
        {children}
      </motion.div>

      {/* CRT screen curvature overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
        }}
      />
    </div>
  );
};
