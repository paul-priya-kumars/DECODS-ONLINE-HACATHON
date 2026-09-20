import type { Plan, PlanDependencies } from '../types/plan';
import { AIProvider } from './provider';
import { SYSTEM_PROMPT, createUserPrompt } from './prompts';
import { normalizeCurrency, normalizeTime, normalizeNumber } from './normalization';
import { z } from 'zod';

/**
 * Schema for validating the AI's JSON output
 */
const planOutputSchema = z.object({
  title: z.union([z.string(), z.null()]).optional(),
  type: z.union([z.string(), z.null()]).optional(),
  participants: z.union([z.number(), z.null()]).optional(),
  budget: z.union([z.number(), z.null()]).optional(),
  timeline_days: z.union([z.number(), z.null()]).optional(),
  organizers: z.union([z.number(), z.null()]).optional(),
  location: z.union([z.string(), z.null()]).optional(),
  resources: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([])
});

/**
 * AI-powered plan parser
 */
export class PlanParser {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  /**
   * Parse a natural language plan into a structured plan
   * @param input The natural language input
   * @returns The parsed and validated plan
   */
  async parse(input: string): Promise<{ plan: Plan; dependencies: PlanDependencies }> {
    // Validate input
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }

    const trimmedInput = input.trim();
    if (trimmedInput === '') {
      throw new Error('Input cannot be empty');
    }

    // Create the prompt for the AI
    const systemPrompt = SYSTEM_PROMPT;
    const userPrompt = createUserPrompt(trimmedInput);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    // Get completion from AI provider
    let aiResponse: string;
    try {
      aiResponse = await this.provider.generateCompletion(fullPrompt);
    } catch (error) {
      throw new Error(`AI provider failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Parse the AI's JSON response
    let parsedJson: unknown;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in AI response');
      }
      parsedJson = JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Validate the parsed JSON against our schema
    const validationResult = planOutputSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      throw new Error(`AI response validation failed: ${validationResult.error.message}`);
    }

    const validatedData = validationResult.data;

    // Apply normalization to numeric fields that might have come in as strings
    const plan: Plan = {
      title: validatedData.title ?? null,
      type: validatedData.type ?? null,
      participants: await this.normalizeNumericField(validatedData.participants),
      budget: await this.normalizeNumericField(validatedData.budget),
      timeline_days: await this.normalizeNumericField(validatedData.timeline_days),
      organizers: await this.normalizeNumericField(validatedData.organizers),
      location: validatedData.location ?? null,
      resources: validatedData.resources ?? [],
      constraints: validatedData.constraints ?? []
    };

    // For Phase 2, we'll return empty dependencies
    // In a future phase, this could be enhanced to extract dependencies
    const dependencies: PlanDependencies = {};

    return { plan, dependencies };
  }

  /**
   * Normalize a field that might be a string, number, or null
   * @param value The value to normalize
   * @returns The normalized value as number | null
   */
  private async normalizeNumericField(value: unknown): Promise<number | null> {
    if (value === null) {
      return null;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Try to normalize as currency first (since currency strings often contain special chars)
      const currencyNormalized = normalizeCurrency(value);
      if (currencyNormalized !== null) {
        return currencyNormalized;
      }

      // Try to normalize as time
      const timeNormalized = normalizeTime(value);
      if (timeNormalized !== null) {
        return timeNormalized;
      }

      // Try to normalize as a plain number
      const numberNormalized = normalizeNumber(value);
      if (numberNormalized !== null) {
        return numberNormalized;
      }

      // If none of the above worked, return null (unknown value)
      return null;
    }

    // For any other type, return null
    return null;
  }
}