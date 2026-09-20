/**
 * Abstract AI provider interface
 */
export interface AIProvider {
  /**
   * Generate a completion from the AI provider
   * @param prompt The prompt to send to the AI
   * @returns The AI response as a string
   */
  generateCompletion(prompt: string): Promise<string>;
}

/**
 * OpenAI provider implementation
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateCompletion(prompt: string): Promise<string> {
    console.log(`OpenAIProvider: apiKey=${this.apiKey}, model=${this.model}`);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that extracts structured information from natural language text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for more deterministic output
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`AI provider error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
  }
}

/**
 * Mock provider for development/testing when no API key is available
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class MockProvider implements AIProvider {
  async generateCompletion(prompt: string): Promise<string> {
    // Return a simple mock response for testing
    return JSON.stringify({
      title: null,
      type: null,
      participants: null,
      budget: null,
      timeline_days: null,
      organizers: null,
      location: null,
      resources: [],
      constraints: []
    });
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Factory function to create the appropriate AI provider
 */
export function createAIProvider(): AIProvider {
  const apiKey = process.env.LLM_API_KEY;
  console.log(`createAIProvider: LLM_API_KEY=${apiKey}`);

  if (!apiKey) {
    // Return mock provider if no API key is set
    console.log('createAIProvider: Returning MockProvider');
    return new MockProvider();
  }

  const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
  console.log(`createAIProvider: Returning OpenAIProvider with model=${model}`);
  return new OpenAIProvider(apiKey, model);
}