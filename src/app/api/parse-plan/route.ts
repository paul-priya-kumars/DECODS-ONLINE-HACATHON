import { NextResponse } from 'next/server';
import { parsePlanSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { PlanParser } from '@/lib/ai/parser';
import { createAIProvider } from '@/lib/ai/provider';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = parsePlanSchema.safeParse(body);
    if (!validationResult.success) {
      const error = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request data. Please provide a non-empty input string.'
      );
      return NextResponse.json(error, { status: 400 });
    }

    const { input } = validationResult.data;

    // Initialize AI provider and parser
    const provider = createAIProvider();
    const parser = new PlanParser(provider);

    // Parse the natural language input
    const { plan, dependencies } = await parser.parse(input);

    // Return successful response
    const response = createSuccessResponse(
      {
        plan,
        dependencies
      },
      {
        phase: 2,
        mock: provider.constructor.name === 'MockProvider'
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in parse-plan endpoint:', error);

    // Handle specific error types
    let errorCode = 'AI_PARSE_ERROR';
    let errorMessage = 'The AI could not produce a valid structured plan.';
    let statusCode = 500;
    let errorMeta: Record<string, unknown> = {
      phase: 2,
      mock: false
    };

    if (error instanceof Error) {
      const errorMessageLower = error.message.toLowerCase();
      if (errorMessageLower.includes('api key') || errorMessageLower.includes('configuration')) {
        errorCode = 'AI_CONFIGURATION_ERROR';
        errorMessage = 'AI parser is not configured. Set LLM_API_KEY.';
        statusCode = 503;
        errorMeta = { phase: 2, mock: false };
      } else if (errorMessageLower.includes('provider')) {
        errorCode = 'AI_PROVIDER_ERROR';
        errorMessage = 'AI provider error occurred.';
        statusCode = 502;
        errorMeta = { phase: 2, mock: false };
      }
    }

    const errorResponse = createErrorResponse(errorCode, errorMessage, errorMeta);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}