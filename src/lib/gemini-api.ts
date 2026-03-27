/**
 * Gemini API Integration
 *
 * Provides functions to interact with Google Gemini 2.5 Flash API
 * for AI chat responses in the retro terminal chat application.
 */

interface GeminiMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface GeminiRequestBody {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface ChatWithGeminiOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Get API key from environment variables
 * @throws {Error} If GEMINI_API_KEY is not set
 */
function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Convert conversation history to Gemini format
 */
function convertToGeminiFormat(messages: Array<{ role: 'user' | 'model'; content: string }>): GeminiMessage[] {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));
}

/**
 * Send chat request to Gemini API
 *
 * @param prompt - The user's prompt message
 * @param conversationHistory - Array of previous messages with role and content
 * @returns Promise with AI response text and usage metadata
 * @throws {Error} If API request fails or returns no candidates
 */
export async function chatWithGemini(
  prompt: string,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<{ text: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = getApiKey();

  // Build full conversation with new prompt
  const fullConversation = [
    ...conversationHistory,
    { role: 'user' as const, content: prompt },
  ];

  // Prepare request body
  const requestBody: GeminiRequestBody = {
    contents: convertToGeminiFormat(fullConversation),
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    // Validate response
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini API returned no candidates');
    }

    const candidate = data.candidates[0];
    const text = candidate.content.parts[0]?.text || '';

    if (!text) {
      throw new Error('Gemini API returned empty response');
    }

    // Extract usage metadata
    const usage = data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount,
        }
      : undefined;

    return { text, usage };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while calling Gemini API');
  }
}

/**
 * Stream chat response from Gemini API
 *
 * @param prompt - The user's prompt message
 * @param onChunk - Callback function for each chunk of streaming response
 * @param conversationHistory - Array of previous messages with role and content
 * @returns Promise with final usage metadata
 * @throws {Error} If API request fails
 */
export async function streamChatWithGemini(
  prompt: string,
  onChunk: (chunk: string) => void,
  conversationHistory: Array<{ role: 'user' | 'model'; content: string }> = []
): Promise<{ usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
  const apiKey = getApiKey();

  // Build full conversation with new prompt
  const fullConversation = [
    ...conversationHistory,
    { role: 'user' as const, content: prompt },
  ];

  // Prepare request body
  const requestBody: GeminiRequestBody = {
    contents: convertToGeminiFormat(fullConversation),
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  try {
    const response = await fetch(`${API_URL}?key=${apiKey}&alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API streaming error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              onChunk(text);
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }

    // Note: Usage metadata may not be available in streaming mode
    return {};
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while streaming from Gemini API');
  }
}
