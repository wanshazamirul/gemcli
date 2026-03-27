# Retro Terminal Chat

A nostalgic terminal-style chat interface powered by Google's Gemini AI. Experience authentic CRT monitor aesthetics with scanlines, screen curvature, and glow effects while chatting with an AI assistant in a retro computing environment.

![Terminal Chat](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## Features

- **Authentic CRT Terminal Experience**
  - Scanline effects mimicking old monitors
  - Screen curvature distortion
  - Text glow and bloom effects
  - Flicker animations for realism

- **AI-Powered Chat**
  - Integration with Google Gemini API
  - Typewriter effect for AI responses
  - Conversation history persistence
  - Context-aware responses

- **Terminal Interface**
  - ASCII art borders and decorations
  - Command-style input system
  - Auto-scrolling message list
  - Sidebar with conversation management

- **Modern Tech Stack**
  - Next.js 16 with App Router
  - React 19
  - TypeScript
  - Tailwind CSS v4
  - Framer Motion animations

## Prerequisites

Before running this project, ensure you have:

- **Node.js 22+** - [Download here](https://nodejs.org/)
- **Google Gemini API Key** - [Get your API key](https://makersuite.google.com/app/apikey)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd retro-terminal-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your API key**

   Edit `.env.local` and add your Gemini API key:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_APP_NAME="Retro Terminal Chat"
   ```

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the terminal interface.

## Available CLI Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com/new)
3. Add `NEXT_PUBLIC_GEMINI_API_KEY` as environment variable in Vercel dashboard
4. Deploy!

### Other Platforms

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Configure your platform to:
   - Serve static files from `.next` directory
   - Set `NEXT_PUBLIC_GEMINI_API_KEY` environment variable
   - Run on Node.js 22+

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **UI Library**: React 19.2.4
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion 12.38.0
- **Icons**: Lucide React 1.7.0
- **AI**: Google Gemini API

## Project Structure

```
retro-terminal-chat/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with fonts
│   │   └── page.tsx         # Main terminal interface
│   ├── components/
│   │   ├── terminal/
│   │   │   ├── Terminal.tsx     # Main container with CRT effects
│   │   │   ├── Sidebar.tsx      # Conversation list
│   │   │   ├── CommandInput.tsx # Input with command history
│   │   │   ├── MessageList.tsx  # Chat display
│   │   │   └── AsciiBorder.tsx  # ASCII art decorations
│   │   └── messages/
│   │       ├── AIMessage.tsx       # AI message bubble
│   │       ├── UserMessage.tsx     # User message bubble
│   │       └── TypewriterText.tsx  # Typewriter effect
│   └── lib/
│       └── gemini.ts           # Gemini API integration
├── public/                    # Static assets
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for the chat capabilities
- Next.js team for the amazing framework
- The retro computing community for the inspiration

---

**Built with ❤️ by Shuhada**
