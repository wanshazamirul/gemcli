// Retro terminal color palette
export const colors = {
  background: '#0a0a0a',
  primary: '#00ff00',        // Green phosphor
  secondary: '#00cc00',      // Dimmed green
  user: '#00ff00',           // With glow
  ai: '#33ff33',             // Brighter green
  syntax: {
    yellow: '#ffff00',
    magenta: '#ff00ff',
    cyan: '#00ffff',
  },
  amber: {
    primary: '#ffb000',
    secondary: '#cc8f00',
  }
} as const;

export const fonts = {
  mono: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
} as const;

export const effects = {
  glow: '0 0 10px #00ff00, 0 0 20px #00ff00',
  glowStrong: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00',
} as const;
