const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export class OpenRouterService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
  }

  async sendMessage(messages: Array<{role: string; content: string}>, model: string): Promise<string> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ChatBot App'
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }
}

export const openRouterService = new OpenRouterService();