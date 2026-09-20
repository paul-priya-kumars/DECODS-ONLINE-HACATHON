import { NextResponse } from 'next/server';
import { resimulateSchema } from '@/lib/validation/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { ResimulationResult, EnrichedSimulationResult, ResimulationChanges, RiskLevel } from '@/lib/types/simulation';
import { Plan } from '@/lib/types/plan';
import { SimulationEngine } from '@/lib/simulation/simulation-engine';
import type { SimulationAssumptions } from '@/lib/simulation/simulation-types';
import { generateScenarios } from '@/lib/simulation/scenario-generator';
import { evaluateRisk } from '@/lib/risk/risk-engine';
import { generateConsequences } from '@/lib/risk/consequence-engine';
import { generateDecision } from '@/lib/risk/decision-engine';
import type { RiskEvaluation } from '@/lib/risk/risk-types';
import type { Consequence } from '@/lib/risk/risk-types';
import type { Decision } from '@/lib/risk/risk-types';
import type { SimulationResult } from '@/lib/simulation/simulation-types';

// Helper functions
function calculateChange(before: number | null, after: number | null): number | null {
  if (before === null || after === null) {
    return null;
  }
  return after - before;
}

function calculateChangePercent(before: number | null, after: number | null): number | null {
  if (before === null || after === null || before === 0) {
    return null;
  }
  return ((after - before) / before) * 100;
}

function getRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score <= 29) return 'LOW';
  if (score <= 59) return 'MEDIUM';
  return 'HIGH';
}

function getAddedConsequences(before: Consequence[], after: Consequence[]): Consequence[] {
  const beforeCodes = new Set(before.map(c => c.code));
  return after.filter(c => !beforeCodes.has(c.code));
}

function getRemovedConsequences(before: Consequence[], after: Consequence[]): Consequence[] {
  const afterCodes = new Set(after.map(c => c.code));
  return before.filter(c => !afterCodes.has(c.code));
}

type ChangeDetail = {
  before: number | null;
  after: number | null;
  change: number | null;
  change_percent: number | null;
};

function buildChangesDetail(original: Plan, changed: Plan, changes: ResimulationChanges): Record<string, ChangeDetail> {
  const detail: Record<string, ChangeDetail> = {};

  // Plan field changes - only numeric fields
  const numericPlanFields = ['participants', 'budget', 'timeline_days', 'organizers'] as const;
  for (const field of numericPlanFields) {
    const before = original[field];
    const after = changed[field];

    detail[field] = {
      before: before !== null && before !== undefined ? before : null,
      after: after !== null && after !== undefined ? after : null,
      change: calculateChange(before as number | null, after as number | null),
      change_percent: calculateChangePercent(before as number | null, after as number | null)
    };
  }

  // Cost assumption changes - only numeric fields
  const numericAssumptionFields = ['food_cost_per_person', 'transport_cost_per_person', 'default_venue_cost'] as const;
  for (const field of numericAssumptionFields) {
    const before = changes[field] !== undefined ? changes[field] : null;
    const after = changes[field] !== undefined ? changes[field] : null;

    detail[field] = {
      before: before !== null && before !== undefined ? before : null,
      after: after !== null && after !== undefined ? after : null,
      change: calculateChange(before as number | null, after as number | null),
      change_percent: calculateChangePercent(before as number | null, after as number | null)
    };
  }

  return detail;
}

type ScenarioData = {
  baseline: SimulationResult;
  normal: { simulation: SimulationResult };
  stress: { simulation: SimulationResult };
  failure: { simulation: SimulationResult };
};

type MetricsComparison = Record<string, ChangeDetail>;
type ScenarioComparison = Record<
  'normal' | 'stress' | 'failure',
  {
    risk: {
      before: { score: number; level: RiskLevel };
      after: { score: number; level: RiskLevel };
    };
    total_estimated_cost: ChangeDetail;
  }
>;
type ConsequencesComparison = Record<
  'normal' | 'stress' | 'failure',
  {
    before: Consequence[];
    after: Consequence[];
    added: Consequence[];
    removed: Consequence[];
  }
>;
type DecisionsComparison = Record<
  'normal' | 'stress' | 'failure',
  {
    before: Decision;
    after: Decision;
  }
>;

function buildComparison(
  originalPlan: Plan,
  changedPlan: Plan,
  originalScenarios: ScenarioData,
  changedScenarios: ScenarioData,
  originalBaseline: EnrichedSimulationResult,
  changedBaseline: EnrichedSimulationResult
): {
  metrics: MetricsComparison;
  scenarios: ScenarioComparison;
  risk: {
    before: { score: number; level: RiskLevel };
    after: { score: number; level: RiskLevel };
  };
  consequences: ConsequencesComparison;
  decisions: DecisionsComparison;
} {
  // Calculate derived metrics for comparison
  const getMetrics = (simulationResult: SimulationResult) => {
    const derived = simulationResult.derived || {};
    const input = simulationResult.input || {};

    return {
      total_estimated_cost: derived.total_estimated_cost ?? null,
      budget_remaining: derived.budget_remaining ?? null,
      budget_utilization: derived.budget_utilization ?? null,
      participants_per_organizer: derived.participants_per_organizer ?? null,
      timeline_days: input.timeline_days ?? null,
      participants: input.participants ?? null,
      budget: input.budget ?? null
    };
  };

  const originalMetrics = getMetrics(originalBaseline);
  const changedMetrics = getMetrics(changedBaseline);

  const metricsComparison: MetricsComparison = {};
  const metricKeys = ['total_estimated_cost', 'budget_remaining', 'budget_utilization', 'participants_per_organizer', 'timeline_days', 'participants', 'budget'] as const;
  for (const key of metricKeys) {
    metricsComparison[key] = {
      before: originalMetrics[key],
      after: changedMetrics[key],
      change: calculateChange(originalMetrics[key], changedMetrics[key]),
      change_percent: calculateChangePercent(originalMetrics[key], changedMetrics[key])
    };
  }

  // Scenario risk comparison
  const scenarioComparison = {} as ScenarioComparison;
  const scenarioTypes = ['normal', 'stress', 'failure'] as const;
  for (const type of scenarioTypes) {
    scenarioComparison[type] = {
      risk: {
        before: {
          score: (originalScenarios[type].simulation as EnrichedSimulationResult).risk.score,
          level: (originalScenarios[type].simulation as EnrichedSimulationResult).risk.level
        },
        after: {
          score: (changedScenarios[type].simulation as EnrichedSimulationResult).risk.score,
          level: (changedScenarios[type].simulation as EnrichedSimulationResult).risk.level
        }
      },
      total_estimated_cost: {
        before: originalScenarios[type].simulation.derived?.total_estimated_cost ?? null,
        after: changedScenarios[type].simulation.derived?.total_estimated_cost ?? null,
        change: calculateChange(
          originalScenarios[type].simulation.derived?.total_estimated_cost,
          changedScenarios[type].simulation.derived?.total_estimated_cost
        ),
        change_percent: calculateChangePercent(
          originalScenarios[type].simulation.derived?.total_estimated_cost,
          changedScenarios[type].simulation.derived?.total_estimated_cost
        )
      }
    };
  }

  // Risk comparison (using baseline scenarios)
  const riskComparison = {
    before: {
      score: originalBaseline.risk.score,
      level: getRiskLevelFromScore(originalBaseline.risk.score)
    },
    after: {
      score: changedBaseline.risk.score,
      level: getRiskLevelFromScore(changedBaseline.risk.score)
    }
  };

  // Consequences comparison
  const consequencesComparison = {} as ConsequencesComparison;
  for (const type of scenarioTypes) {
    consequencesComparison[type] = {
      before: (originalScenarios[type].simulation as EnrichedSimulationResult).consequences,
      after: (changedScenarios[type].simulation as EnrichedSimulationResult).consequences,
      added: getAddedConsequences(
        (originalScenarios[type].simulation as EnrichedSimulationResult).consequences,
        (changedScenarios[type].simulation as EnrichedSimulationResult).consequences
      ),
      removed: getRemovedConsequences(
        (originalScenarios[type].simulation as EnrichedSimulationResult).consequences,
        (changedScenarios[type].simulation as EnrichedSimulationResult).consequences
      )
    };
  }

  // Decisions comparison
  const decisionsComparison = {} as DecisionsComparison;
  for (const type of scenarioTypes) {
    decisionsComparison[type] = {
      before: (originalScenarios[type].simulation as EnrichedSimulationResult).decision,
      after: (changedScenarios[type].simulation as EnrichedSimulationResult).decision
    };
  }

  return {
    metrics: metricsComparison,
    scenarios: scenarioComparison,
    risk: riskComparison,
    consequences: consequencesComparison,
    decisions: decisionsComparison
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    const validationResult = resimulateSchema.safeParse(body);
    if (!validationResult.success) {
      const error = createErrorResponse(
        'VALIDATION_ERROR',
        'Invalid request data. Please provide original_plan, dependencies, and changes objects.'
      );
      return NextResponse.json(error, { status: 400 });
    }

    const { original_plan, dependencies = [], changes } = validationResult.data;

    // Generate a simple resimulation ID (timestamp + random)
    const resimulation_id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    // Apply changes to original plan to get changed plan
    const changed_plan: Plan = {
      ...original_plan,
      participants: changes.participants !== undefined ? changes.participants : original_plan.participants,
      budget: changes.budget !== undefined ? changes.budget : original_plan.budget,
      timeline_days: changes.timeline_days !== undefined ? changes.timeline_days : original_plan.timeline_days,
      organizers: changes.organizers !== undefined ? changes.organizers : original_plan.organizers,
      location: original_plan.location,
      resources: [...original_plan.resources],
      constraints: [...original_plan.constraints]
    };

    // Initialize simulation engine
    const simulationEngine = new SimulationEngine();

    // Get default assumptions from the engine (same as used in baseline simulations)
    const defaultAssumptions = simulationEngine.getDefaultAssumptions();

    // Apply cost assumption changes to create modified assumptions for changed plan
    // Handle null values properly - convert null to undefined for the simulation engine
    const changedAssumptions: SimulationAssumptions = {
      ...defaultAssumptions
    };

    // Only override if explicitly provided (including null to remove the assumption)
    if (changes.food_cost_per_person !== undefined) {
      changedAssumptions.food_cost_per_person = changes.food_cost_per_person === null ? undefined : changes.food_cost_per_person;
    }
    if (changes.transport_cost_per_person !== undefined) {
      changedAssumptions.transport_cost_per_person = changes.transport_cost_per_person === null ? undefined : changes.transport_cost_per_person;
    }
    if (changes.default_venue_cost !== undefined) {
      changedAssumptions.default_venue_cost = changes.default_venue_cost === null ? undefined : changes.default_venue_cost;
    }

    // Run simulation for original plan (baseline)
    const originalBaselineRaw = simulationEngine.simulate(original_plan, dependencies);
    const originalBaseline: EnrichedSimulationResult = {
      ...originalBaselineRaw,
      risk: {} as RiskEvaluation,
      consequences: [] as Consequence[],
      decision: {} as Decision
    };

    // Generate scenarios for original plan
    const originalScenarios = await generateScenarios(original_plan, dependencies, simulationEngine);

    // Run simulation for changed plan (with modified assumptions)
    const changedBaselineRaw = simulationEngine.simulateWithAssumptions(changed_plan, dependencies, changedAssumptions);
    const changedBaseline: EnrichedSimulationResult = {
      ...changedBaselineRaw,
      risk: {} as RiskEvaluation,
      consequences: [] as Consequence[],
      decision: {} as Decision
    };

    // Generate scenarios for changed plan
    const changedScenarios = await generateScenarios(changed_plan, dependencies, simulationEngine);

    // Function to enrich scenarios: {
    //   baseline: SimulationResult;
    //   normal: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
    //   stress: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
    //   failure: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
    // }

    // Function to enrich scenarios with risk, consequences, and decision
    const enrichScenarios = (scenarios: ScenarioData) => {
      // Extract the baseline simulation result for comparison
      const baselineSimResult = scenarios.baseline;

      // Function to enrich a scenario result with risk, consequences, and decision
      const enrichScenario = (scenarioSimResult: SimulationResult, scenarioKey: 'baseline' | 'normal' | 'stress' | 'failure') => {
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
          Object.assign(scenarios[scenarioKey], { risk: riskEval, consequences, decision });
        }
      };

      // Enrich each scenario
      enrichScenario(baselineSimResult, 'baseline');
      enrichScenario(scenarios.normal.simulation, 'normal');
      enrichScenario(scenarios.stress.simulation, 'stress');
      enrichScenario(scenarios.failure.simulation, 'failure');
    };

    // Enrich original and changed scenarios
    enrichScenarios(originalScenarios);
    enrichScenarios(changedScenarios);

    // Build comparison data
    const comparison = buildComparison(
      original_plan,
      changed_plan,
      originalScenarios,
      changedScenarios,
      originalBaseline,
      changedBaseline
    );

    // Build changes detail
    const changesDetail = buildChangesDetail(original_plan, changed_plan, changes);

    // Construct final response
    const response = createSuccessResponse<ResimulationResult>({
      simulation_id: resimulation_id,
      original: {
        plan: original_plan,
        simulation: originalBaseline,
        scenarios: {
          normal: {
            risk: (originalScenarios.normal.simulation as EnrichedSimulationResult).risk,
            score: (originalScenarios.normal.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: originalScenarios.normal.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: originalScenarios.normal.simulation.input?.timeline_days ?? 0,
            impact: 'Normal operational conditions',
            consequences: (originalScenarios.normal.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          },
          stress: {
            risk: (originalScenarios.stress.simulation as EnrichedSimulationResult).risk,
            score: (originalScenarios.stress.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: originalScenarios.stress.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: originalScenarios.stress.simulation.input?.timeline_days ?? 0,
            impact: 'Moderate adverse conditions',
            consequences: (originalScenarios.stress.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          },
          failure: {
            risk: (originalScenarios.failure.simulation as EnrichedSimulationResult).risk,
            score: (originalScenarios.failure.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: originalScenarios.failure.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: originalScenarios.failure.simulation.input?.timeline_days ?? 0,
            impact: 'Severe adverse conditions',
            consequences: (originalScenarios.failure.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          }
        }
      },
      changed: {
        plan: changed_plan,
        simulation: changedBaseline,
        scenarios: {
          normal: {
            risk: (changedScenarios.normal.simulation as EnrichedSimulationResult).risk,
            score: (changedScenarios.normal.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: changedScenarios.normal.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: changedScenarios.normal.simulation.input?.timeline_days ?? 0,
            impact: 'Normal operational conditions',
            consequences: (changedScenarios.normal.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          },
          stress: {
            risk: (changedScenarios.stress.simulation as EnrichedSimulationResult).risk,
            score: (changedScenarios.stress.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: changedScenarios.stress.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: changedScenarios.stress.simulation.input?.timeline_days ?? 0,
            impact: 'Normal operational conditions',
            consequences: (changedScenarios.stress.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          },
          failure: {
            risk: (changedScenarios.failure.simulation as EnrichedSimulationResult).risk,
            score: (changedScenarios.failure.simulation as EnrichedSimulationResult).risk.score,
            estimated_cost: changedScenarios.failure.simulation.derived?.total_estimated_cost ?? 0,
            timeline_days: changedScenarios.failure.simulation.input?.timeline_days ?? 0,
            impact: 'Severe adverse conditions',
            consequences: (changedScenarios.failure.simulation as EnrichedSimulationResult).consequences.map((c: Consequence) => c.code)
          }
        }
      },
      changes: changesDetail,
      comparison
    }, {
      phase: 6,
      mock: false
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in resimulate endpoint:', error);
    const errorResponse = createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred during resimulation'
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}