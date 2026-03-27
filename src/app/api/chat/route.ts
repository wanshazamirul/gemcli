/**
 * Next.js API Route for Chat Endpoint
 *
 * Handles POST requests to /api/chat
 * Validates input and calls Gemini API for AI responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini-api';

interface ChatRequestBody {
  prompt: string;
  conversationHistory?: Array<{ role: 'user' | 'model'; content: string }>;
}

interface ChatResponseBody {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

/**
 * POST /api/chat
 *
 * Request body:
 * {
 *   "prompt": "string",
 *   "conversationHistory": [{ "role": "user" | "model", "content": "string" }]
 * }
 *
 * Response:
 * {
 *   "text": "string",
 *   "usage": { "promptTokens": number, "completionTokens": number, "totalTokens": number }
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<ChatResponseBody>> {
  try {
    // Parse request body
    const body: ChatRequestBody = await request.json();

    // Validate prompt
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json(
        { text: '', error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (body.prompt.trim().length === 0) {
      return NextResponse.json(
        { text: '', error: 'Prompt cannot be empty' },
        { status: 400 }
      );
    }

    // Validate conversation history if provided
    if (body.conversationHistory && !Array.isArray(body.conversationHistory)) {
      return NextResponse.json(
        { text: '', error: 'Conversation history must be an array' },
        { status: 400 }
      );
    }

    // Call Gemini API with prompt and conversation history
    const { text, usage } = await chatWithGemini(body.prompt, body.conversationHistory || []);

    // Return successful response
    return NextResponse.json({
      text,
      usage,
    });
  } catch (error) {
    // Handle errors
    console.error('Error in /api/chat:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        text: '',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat
 *
 * Returns method not allowed for GET requests
 */
export async function GET(): Promise<NextResponse<{ error: string }>> {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.' },
    { status: 405 }
  );
}
