// Scenario Generator
// Phase 4: Deterministic Scenario Generation

import type { Plan } from '@/lib/types/plan';
import type { DependencyEdge } from './simulation-types';
import type { SimulationAssumptions, SimulationResult } from './simulation-types';
import { SimulationEngine } from './simulation-engine';

/**
 * Scenario type
 */
export type ScenarioType = 'normal' | 'stress' | 'failure';

/**
 * Scenario profile definition
 */
export interface ScenarioProfile {
  type: ScenarioType;
  name: string;
  description: string;
  multipliers: {
    participants_multiplier: number;
    food_cost_multiplier: number;
    transport_cost_multiplier: number;
    venue_cost_multiplier: number;
    timeline_multiplier: number;
  };
}

/**
 * Default scenario profiles
 */
const DEFAULT_SCENARIO_PROFILES: Record<ScenarioType, ScenarioProfile> = {
  normal: {
    type: 'normal',
    name: 'Normal Scenario',
    description: 'Baseline assumptions with no modifications.',
    multipliers: {
      participants_multiplier: 1.0,
      food_cost_multiplier: 1.0,
      transport_cost_multiplier: 1.0,
      venue_cost_multiplier: 1.0,
      timeline_multiplier: 1.0
    }
  },
  stress: {
    type: 'stress',
    name: 'Stress Scenario',
    description: 'Moderate adverse assumptions: increased participants and operating costs with reduced available timeline.',
    multipliers: {
      participants_multiplier: 1.10,
      food_cost_multiplier: 1.10,
      transport_cost_multiplier: 1.10,
      venue_cost_multiplier: 1.10,
      timeline_multiplier: 0.90
    }
  },
  failure: {
    type: 'failure',
    name: 'Failure Scenario',
    description: 'Severe adverse assumptions: significantly increased operating costs and participants with a substantially reduced timeline.',
    multipliers: {
      participants_multiplier: 1.20,
      food_cost_multiplier: 1.25,
      transport_cost_multiplier: 1.25,
      venue_cost_multiplier: 1.50,
      timeline_multiplier: 0.75
    }
  }
};

/**
 * Applies a multiplier to a value, rounding to integer if the value is a number.
 * Returns null if the input is null or undefined.
 * Ensures the result is not negative.
 */
function applyMultiplier(value: number | null | undefined, multiplier: number): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const multiplied = value * multiplier;
  const rounded = Math.round(multiplied);
  return rounded < 0 ? 0 : rounded;
}

/**
 * Creates a new plan object with scenario-modified base variables.
 * Only modifies participants and timeline_days if they exist in the original plan.
 * Other fields are copied as-is.
 */
function applyScenarioToPlan(originalPlan: Plan, profile: ScenarioProfile): Plan {
  const modifiedParticipants = applyMultiplier(originalPlan.participants, profile.multipliers.participants_multiplier);
  const modifiedTimelineDays = applyMultiplier(originalPlan.timeline_days, profile.multipliers.timeline_multiplier);

  return {
    ...originalPlan,
    participants: modifiedParticipants,
    timeline_days: modifiedTimelineDays
    // Note: budget is NOT modified by scenario multipliers (it's a constraint)
  };
}

/**
 * Creates assumption modifications for a scenario.
 * Applies multipliers to the cost assumptions.
 */
function applyScenarioToAssumptions(baseAssumptions: SimulationAssumptions, profile: ScenarioProfile): SimulationAssumptions {
  return {
    ...baseAssumptions,
    food_cost_per_person: baseAssumptions.food_cost_per_person !== undefined
      ? baseAssumptions.food_cost_per_person * profile.multipliers.food_cost_multiplier
      : undefined,
    transport_cost_per_person: baseAssumptions.transport_cost_per_person !== undefined
      ? baseAssumptions.transport_cost_per_person * profile.multipliers.transport_cost_multiplier
      : undefined,
    default_venue_cost: baseAssumptions.default_venue_cost !== undefined
      ? baseAssumptions.default_venue_cost * profile.multipliers.venue_cost_multiplier
      : undefined
  };
}

/**
 * Generates normal, stress, and failure scenarios for a given plan and dependencies.
 * @param plan The original structured plan
 * @param dependencies The dependencies between variables
 * @param simulationEngine Optional pre-initialized simulation engine (for efficiency)
 * @returns An object containing the baseline, normal, stress, and failure scenario results
 */
export async function generateScenarios(
  plan: Plan,
  dependencies: DependencyEdge[] = [],
  simulationEngine?: SimulationEngine
): Promise<{
  baseline: SimulationResult;
  normal: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
  stress: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
  failure: { type: ScenarioType; name: string; description: string; simulation: SimulationResult };
}> {
  const engine = simulationEngine ?? new SimulationEngine();

  // Get the baseline simulation (using default assumptions from environment)
  const baseline = engine.simulate(plan, dependencies);

  // Get the default assumptions (same as used in baseline)
  const defaultAssumptions = engine.getDefaultAssumptions();

  // Generate each scenario
  const normal = await generateScenario(engine, plan, dependencies, defaultAssumptions, DEFAULT_SCENARIO_PROFILES.normal);
  const stress = await generateScenario(engine, plan, dependencies, defaultAssumptions, DEFAULT_SCENARIO_PROFILES.stress);
  const failure = await generateScenario(engine, plan, dependencies, defaultAssumptions, DEFAULT_SCENARIO_PROFILES.failure);

  return {
    baseline,
    normal,
    stress,
    failure
  };
}

/**
 * Helper function to generate a single scenario result.
 */
async function generateScenario(
  engine: SimulationEngine,
  plan: Plan,
  dependencies: DependencyEdge[],
  baseAssumptions: SimulationAssumptions,
  profile: ScenarioProfile
): Promise<{ type: ScenarioType; name: string; description: string; simulation: SimulationResult }> {
  // Apply scenario multipliers to the plan (only participants and timeline_days)
  const scenarioPlan = applyScenarioToPlan(plan, profile);

  // Apply scenario multipliers to the assumptions
  const scenarioAssumptions = applyScenarioToAssumptions(baseAssumptions, profile);

  // Run the simulation with the modified plan and assumptions
  const simulationResult = engine.simulateWithAssumptions(scenarioPlan, dependencies, scenarioAssumptions);

  return {
    type: profile.type,
    name: profile.name,
    description: profile.description,
    simulation: simulationResult
  };
}