// Risk Factors Evaluation
// Phase 5: Deterministic Risk + Consequence Engine

import { RiskFactor } from './risk-types';
import { RISK_FACTORS as RF } from './risk-config';

/**
 * Evaluates the Budget Overrun factor.
 * @param totalEstimatedCost The scenario's total estimated cost (number or null)
 * @param budget The scenario's budget (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateBudgetOverrun(totalEstimatedCost: number | null, budget: number | null): RiskFactor | null {
  if (totalEstimatedCost === null || budget === null) {
    return null; // Cannot evaluate
  }
  if (totalEstimatedCost > budget) {
    const overrun = totalEstimatedCost - budget;
    const factor = RF.BUDGET_OVERRUN;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(totalEstimatedCost, budget, overrun)
    };
  }
  return null;
}

/**
 * Evaluates the High Budget Utilization factor.
 * @param totalEstimatedCost The scenario's total estimated cost (number or null)
 * @param budget The scenario's budget (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateHighBudgetUtilization(totalEstimatedCost: number | null, budget: number | null): RiskFactor | null {
  if (totalEstimatedCost === null || budget === null || budget === 0) {
    return null; // Cannot evaluate or avoid division by zero
  }
  const utilization = totalEstimatedCost / budget;
  if (utilization >= 0.90) {
    const factor = RF.HIGH_BUDGET_UTILIZATION;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(utilization)
    };
  }
  return null;
}

/**
 * Evaluates the Elevated Budget Utilization factor.
 * @param totalEstimatedCost The scenario's total estimated cost (number or null)
 * @param budget The scenario's budget (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateElevatedBudgetUtilization(totalEstimatedCost: number | null, budget: number | null): RiskFactor | null {
  if (totalEstimatedCost === null || budget === null || budget === 0) {
    return null;
  }
  const utilization = totalEstimatedCost / budget;
  if (utilization >= 0.75 && utilization < 0.90) {
    const factor = RF.ELEVATED_BUDGET_UTILIZATION;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(utilization)
    };
  }
  return null;
}

/**
 * Evaluates the Timeline Pressure factor.
 * @param baselineTimeline The baseline scenario's timeline_days (number or null)
 * @param scenarioTimeline The scenario's timeline_days (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateTimelinePressure(baselineTimeline: number | null, scenarioTimeline: number | null): RiskFactor | null {
  if (baselineTimeline === null || scenarioTimeline === null) {
    return null; // Cannot evaluate
  }
  if (baselineTimeline <= 0) {
    return null; // Avoid division by zero or negative baseline
  }
  const change = ((scenarioTimeline - baselineTimeline) / baselineTimeline) * 100; // negative means decrease
  const decrease = -change; // positive decrease
  if (decrease >= 20) {
    const factor = RF.SEVERE_TIMELINE_PRESSURE;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineTimeline, scenarioTimeline, decrease)
    };
  } else if (decrease >= 10) {
    const factor = RF.TIMELINE_PRESSURE;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineTimeline, scenarioTimeline, decrease)
    };
  }
  return null;
}

/**
 * Evaluates the Participant Pressure factor.
 * @param baselineParticipants The baseline scenario's participants (number or null)
 * @param scenarioParticipants The scenario's participants (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateParticipantPressure(baselineParticipants: number | null, scenarioParticipants: number | null): RiskFactor | null {
  if (baselineParticipants === null || scenarioParticipants === null) {
    return null;
  }
  if (baselineParticipants <= 0) {
    return null;
  }
  const change = ((scenarioParticipants - baselineParticipants) / baselineParticipants) * 100; // positive means increase
  if (change >= 20) {
    const factor = RF.HIGH_PARTICIPANT_PRESSURE;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineParticipants, scenarioParticipants, change)
    };
  } else if (change >= 10) {
    const factor = RF.PARTICIPANT_PRESSURE;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineParticipants, scenarioParticipants, change)
    };
  }
  return null;
}

/**
 * Evaluates the Cost Escalation factor.
 * @param baselineCost The baseline scenario's total_estimated_cost (number or null)
 * @param scenarioCost The scenario's total_estimated_cost (number or null)
 * @returns RiskFactor if triggered, otherwise null
 */
export function evaluateCostEscalation(baselineCost: number | null, scenarioCost: number | null): RiskFactor | null {
  if (baselineCost === null || scenarioCost === null) {
    return null;
  }
  if (baselineCost <= 0) {
    return null;
  }
  const change = ((scenarioCost - baselineCost) / baselineCost) * 100; // positive means increase
  if (change >= 25) {
    const factor = RF.HIGH_COST_ESCALATION;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineCost, scenarioCost, change)
    };
  } else if (change >= 10) {
    const factor = RF.COST_ESCALATION;
    return {
      ...factor,
      triggered: true,
      points: factor.points,
      explanation: factor.explanation(baselineCost, scenarioCost, change)
    };
  }
  return null;
}