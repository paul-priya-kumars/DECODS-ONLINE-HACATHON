import { NextResponse } from 'next/server';
import { simulateSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { SimulationEngine } from '@/lib/simulation/simulation-engine';
import { SimulationResult } from '@/lib/simulation/simulation-types';
import { generateScenarios } from '@/lib/simulation/scenario-generator';
import { evaluateRisk } from '@/lib/risk/risk-engine';
import { generateConsequences } from '@/lib/risk/consequence-engine';
import { generateDecision } from '@/lib/risk/decision-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = simulateSchema.safeParse(body);
    if (!validationResult.success) {
      const error = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request data. Please check your plan object.'
      );
      return NextResponse.json(error, { status: 400 });
    }

    const { plan, dependencies = [] } = validationResult.data;

    // Initialize simulation engine
    const simulationEngine = new SimulationEngine();

    // Generate scenarios (baseline, normal, stress, failure)
    const scenarios = await generateScenarios(plan, dependencies, simulationEngine);

    // Extract the baseline simulation result for comparison
    const baselineSimResult = scenarios.baseline;

    // Function to enrich a scenario result with risk, consequences, and decision
    const enrichScenario = (scenarioSimResult: SimulationResult, scenarioKey: string) => {
      // Evaluate risk
      const riskEval = evaluateRisk(baselineSimResult, scenarioSimResult);
      // Generate consequences
      const consequences = generateConsequences(riskEval, baselineSimResult, scenarioSimResult);
      // Generate decision
      const decision = generateDecision(riskEval);

      // Depending on the scenarioKey, we need to update the appropriate object in the scenarios
      if (scenarioKey === 'baseline') {
        // scenarios.baseline is the simulation result object directly
        Object.assign(scenarios.baseline, { risk: riskEval, consequences, decision });
      } else {
        // For normal, stress, failure, the scenario is an object with a simulation property
        // We'll update that object
        (scenarios as any)[scenarioKey] = {
          ...(scenarios as any)[scenarioKey],
          risk: riskEval,
          consequences,
          decision
        };
      }
    };

    // Enrich each scenario
    enrichScenario(baselineSimResult, 'baseline');
    enrichScenario(scenarios.normal.simulation, 'normal');
    enrichScenario(scenarios.stress.simulation, 'stress');
    enrichScenario(scenarios.failure.simulation, 'failure');

    // Return successful response with scenario bundle
    const response = createSuccessResponse(
      {
        ...scenarios
      },
      {
        phase: 5,
        mock: false
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in simulate endpoint:', error);

    // Handle specific error types
    let errorCode = 'SIMULATION_ERROR';
    let errorMessage = 'An error occurred during simulation.';
    let statusCode = 500;

    if (error instanceof Error) {
      const errorMessageLower = error.message.toLowerCase();
      if (errorMessageLower.includes('validation failed')) {
        errorCode = 'VALIDATION_ERROR';
        errorMessage = error.message;
        statusCode = 400;
      } else if (errorMessageLower.includes('cannot be negative') ||
                 errorMessageLower.includes('must be positive')) {
        errorCode = 'INVALID_SIMULATION_INPUT';
        errorMessage = error.message;
        statusCode = 400;
      }
    }

    const errorResponse = createErrorResponse(errorCode, errorMessage);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
