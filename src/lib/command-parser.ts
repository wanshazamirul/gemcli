import {
  getConversations,
  saveConversation,
  deleteConversation,
  getConversation,
  setCurrentConversationId,
  getCurrentConversationId,
  getTheme,
  setTheme,
  createConversation,
} from './storage';
import { Conversation, Theme } from '@/types';

/**
 * Command result interface
 */
export interface CommandResult {
  type: 'command';
  output?: string;
  error?: string;
  data?: unknown;
}

/**
 * Command interface
 */
export interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute: (args: string[]) => CommandResult;
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Search conversations by ID or title
 */
function searchConversation(query: string): Conversation | undefined {
  const conversations = getConversations();

  // Try exact ID match first
  const byId = conversations.find(c => c.id === query);
  if (byId) return byId;

  // Try title match (case-insensitive, partial)
  const byTitle = conversations.find(c =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );
  if (byTitle) return byTitle;

  return undefined;
}

/**
 * Clear/CLS command - Clear conversation screen
 */
const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Clear the conversation screen',
  execute: () => ({
    type: 'command',
    output: 'Screen cleared.',
  }),
};

/**
 * New command - Create new conversation
 */
const newCommand: Command = {
  name: 'new',
  aliases: [],
  description: 'Create a new conversation',
  execute: (args) => {
    const title = args.length > 0 ? args.join(' ') : undefined;
    const conversation = createConversation(title);
    saveConversation(conversation);
    setCurrentConversationId(conversation.id);

    return {
      type: 'command',
      output: `Created new conversation: ${conversation.id}`,
      data: { id: conversation.id },
    };
  },
};

/**
 * List/LS command - List all conversations
 */
const listCommand: Command = {
  name: 'list',
  aliases: ['ls'],
  description: 'List all conversations',
  execute: () => {
    const conversations = getConversations();
    const currentId = getCurrentConversationId();

    if (conversations.length === 0) {
      return {
        type: 'command',
        output: 'No conversations found.',
      };
    }

    const lines = conversations.map(conv => {
      const indicator = conv.id === currentId ? '*' : ' ';
      return `${indicator} ${conv.id.substring(0, 8)}... - ${conv.title} (${formatDate(conv.createdAt)})`;
    });

    return {
      type: 'command',
      output: ['Conversations:', ...lines, ''].join('\n'),
    };
  },
};

/**
 * Load command - Load conversation by ID or title
 */
const loadCommand: Command = {
  name: 'load',
  aliases: [],
  description: 'Load a conversation by ID or title',
  execute: (args) => {
    if (args.length === 0) {
      return {
        type: 'command',
        error: 'Usage: /load <id or title>',
      };
    }

    const query = args.join(' ');
    const conversation = searchConversation(query);

    if (!conversation) {
      return {
        type: 'command',
        error: `Conversation not found: ${query}`,
      };
    }

    setCurrentConversationId(conversation.id);

    return {
      type: 'command',
      output: `Loaded conversation: ${conversation.title} (${conversation.id})`,
      data: { conversation },
    };
  },
};

/**
 * Delete/Del/RM command - Delete conversation
 */
const deleteCommand: Command = {
  name: 'delete',
  aliases: ['del', 'rm'],
  description: 'Delete a conversation by ID or title',
  execute: (args) => {
    if (args.length === 0) {
      return {
        type: 'command',
        error: 'Usage: /delete <id or title>',
      };
    }

    const query = args.join(' ');
    const conversation = searchConversation(query);

    if (!conversation) {
      return {
        type: 'command',
        error: `Conversation not found: ${query}`,
      };
    }

    deleteConversation(conversation.id);

    // Clear current ID if we deleted the current conversation
    const currentId = getCurrentConversationId();
    if (currentId === conversation.id) {
      setCurrentConversationId(null);
    }

    return {
      type: 'command',
      output: `Deleted conversation: ${conversation.title}`,
      data: { deletedId: conversation.id },
    };
  },
};

/**
 * Help/? command - Show all commands
 */
const helpCommand: Command = {
  name: 'help',
  aliases: ['?'],
  description: 'Show all available commands',
  execute: () => {
    const commands = getCommands();
    const lines = commands.map(cmd => {
      const aliases = cmd.aliases.length > 0
        ? ` (${cmd.aliases.map(a => `/${a}`).join(', ')})`
        : '';
      return `  /${cmd.name}${aliases} - ${cmd.description}`;
    });

    return {
      type: 'command',
      output: ['Available commands:', ...lines, ''].join('\n'),
    };
  },
};

/**
 * Export command - Export current conversation as text file
 */
const exportCommand: Command = {
  name: 'export',
  aliases: [],
  description: 'Export current conversation as a text file',
  execute: () => {
    const currentId = getCurrentConversationId();

    if (!currentId) {
      return {
        type: 'command',
        error: 'No conversation loaded. Use /new or /load first.',
      };
    }

    const conversation = getConversation(currentId);

    if (!conversation) {
      return {
        type: 'command',
        error: 'Current conversation not found.',
      };
    }

    // Format conversation as text
    const lines = [
      `Title: ${conversation.title}`,
      `Created: ${formatDate(conversation.createdAt)}`,
      `Updated: ${formatDate(conversation.updatedAt)}`,
      '',
      'Messages:',
      ...conversation.messages.map(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        return `[${role}]\n${msg.content}\n`;
      }),
    ];

    const content = lines.join('\n');

    // Create and trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      type: 'command',
      output: `Exported conversation: ${conversation.title}`,
    };
  },
};

/**
 * Theme command - Toggle color theme
 */
const themeCommand: Command = {
  name: 'theme',
  aliases: [],
  description: 'Toggle color theme (green/amber)',
  execute: () => {
    const currentTheme = getTheme();
    const newTheme: Theme = currentTheme === 'green' ? 'amber' : 'green';
    setTheme(newTheme);

    return {
      type: 'command',
      output: `Theme changed to ${newTheme}`,
      data: { theme: newTheme },
    };
  },
};

/**
 * All available commands
 */
const commands: Command[] = [
  clearCommand,
  newCommand,
  listCommand,
  loadCommand,
  deleteCommand,
  helpCommand,
  exportCommand,
  themeCommand,
];

/**
 * Get all commands
 */
export function getCommands(): Command[] {
  return commands;
}

/**
 * Parse command from input string
 * Returns null if input is not a command
 */
export function parseCommand(input: string): CommandResult | null {
  const trimmed = input.trim();

  // Check if it's a command (starts with /)
  if (!trimmed.startsWith('/')) {
    return null;
  }

  // Remove the / and split into parts
  const parts = trimmed.substring(1).trim().split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Find matching command
  const command = commands.find(
    cmd => cmd.name === commandName || cmd.aliases.includes(commandName)
  );

  if (!command) {
    return {
      type: 'command',
      error: `Unknown command: /${commandName}. Type /help for available commands.`,
    };
  }

  // Execute command
  return command.execute(args);
}
