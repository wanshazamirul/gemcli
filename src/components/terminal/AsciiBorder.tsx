import React from 'react';

interface AsciiBorderProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * AsciiBorder - Decorative ASCII border component for AI responses
 *
 * Renders a retro terminal-style border with optional title.
 * Uses green-500 color for authentic terminal aesthetic.
 */
export const AsciiBorder: React.FC<AsciiBorderProps> = ({ children, title }) => {
  return (
    <div className="relative my-4">
      {/* Border Container */}
      <div className="border-2 border-green-500 rounded-sm p-4 bg-black/50">
        {/* Optional Title */}
        {title && (
          <div className="absolute -top-3 left-4 bg-black px-2 text-green-500 text-sm font-mono whitespace-nowrap">
            {title}
          </div>
        )}

        {/* Content */}
        <div className="font-mono text-sm whitespace-pre-wrap text-green-400">
          {children}
        </div>
      </div>
    </div>
  );
};
