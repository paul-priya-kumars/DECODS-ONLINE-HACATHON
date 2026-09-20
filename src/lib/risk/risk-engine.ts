// Risk Engine
// Phase 5: Deterministic Risk + Consequence Engine

import type { SimulationResult } from '@/lib/simulation/simulation-types';
import { RiskEvaluation, RiskLevel, RiskFactor } from './risk-types';
import { RISK_THRESHOLDS } from './risk-config';
import {
  evaluateBudgetOverrun,
  evaluateHighBudgetUtilization,
  evaluateElevatedBudgetUtilization,
  evaluateTimelinePressure,
  evaluateParticipantPressure,
  evaluateCostEscalation
} from './risk-factors';

/**
 * Calculates the risk level based on the score.
 * @param score The risk score (0-100)
 * @returns The risk level
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.LOW_MAX) {
    return 'LOW';
  } else if (score <= RISK_THRESHOLDS.MEDIUM_MAX) {
    return 'MEDIUM';
  } else {
    return 'HIGH';
  }
}

/**
 * Evaluates risk for a scenario based on baseline and scenario values.
 * @param baseline The baseline simulation result (from Phase 4)
 * @param scenario The scenario simulation result (from Phase 4)
 * @returns RiskEvaluation object
 */
export function evaluateRisk(baseline: SimulationResult, scenario: SimulationResult): RiskEvaluation {
  const factors: RiskFactor[] = [];

  // Budget Overrun
  const budgetOverrun = evaluateBudgetOverrun(
    scenario.derived?.total_estimated_cost ?? null,
    scenario.input?.budget ?? null
  );
  if (budgetOverrun) {
    factors.push(budgetOverrun);
  }

  // High Budget Utilization
  const highBudgetUtil = evaluateHighBudgetUtilization(
    scenario.derived?.total_estimated_cost ?? null,
    scenario.input?.budget ?? null
  );
  if (highBudgetUtil) {
    factors.push(highBudgetUtil);
  }

  // Elevated Budget Utilization
  const elevatedBudgetUtil = evaluateElevatedBudgetUtilization(
    scenario.derived?.total_estimated_cost ?? null,
    scenario.input?.budget ?? null
  );
  if (elevatedBudgetUtil) {
    factors.push(elevatedBudgetUtil);
  }

  // Timeline Pressure (compare baseline and scenario timeline_days)
  const timelinePressure = evaluateTimelinePressure(
    baseline.input?.timeline_days ?? null,
    scenario.input?.timeline_days ?? null
  );
  if (timelinePressure) {
    factors.push(timelinePressure);
  }

  // Participant Pressure (compare baseline and scenario participants)
  const participantPressure = evaluateParticipantPressure(
    baseline.input?.participants ?? null,
    scenario.input?.participants ?? null
  );
  if (participantPressure) {
    factors.push(participantPressure);
  }

  // Cost Escalation (compare baseline and scenario total_estimated_cost)
  const costEscalation = evaluateCostEscalation(
    baseline.derived?.total_estimated_cost ?? null,
    scenario.derived?.total_estimated_cost ?? null
  );
  if (costEscalation) {
    factors.push(costEscalation);
  }

  // Calculate total points
  let totalPoints = 0;
  for (const factor of factors) {
    totalPoints += factor.points;
  }

  // Cap the score at 100
  const score = Math.min(totalPoints, 100);

  // Determine risk level
  const level = getRiskLevel(score);

  // Generate a summary string
  const summary = factors.length > 0
    ? factors.map(f => f.label).join(', ')
    : 'No risk factors triggered';

  return {
    score,
    level,
    factors,
    summary
  };
}