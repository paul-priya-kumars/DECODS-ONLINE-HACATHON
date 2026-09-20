// Consequence Engine
// Phase 5: Deterministic Risk + Consequence Engine

import type { SimulationResult } from '@/lib/simulation/simulation-types';
import { RiskEvaluation, Consequence } from './risk-types';
import { RISK_FACTORS as RF } from './risk-config';

/**
 * Generates consequences based on the risk evaluation and scenario data.
 * @param riskEvaluation The risk evaluation for a scenario
 * @param baseline The baseline simulation result (for comparison)
 * @param scenario The scenario simulation result
 * @returns Array of consequences
 */
export function generateConsequences(riskEvaluation: RiskEvaluation, baseline: SimulationResult, scenario: SimulationResult): Consequence[] {
  const consequences: Consequence[] = [];

  for (const factor of riskEvaluation.factors) {
    switch (factor.code) {
      case RF.BUDGET_OVERRUN.code: {
        const totalEst = scenario.derived?.total_estimated_cost ?? 0;
        const budget = scenario.input?.budget ?? 0;
        const overrun = totalEst - budget;
        consequences.push({
          code: 'BUDGET_EXCEEDED',
          category: 'financial',
          severity: 'WARNING' as const,
          title: 'Budget Exceeded',
          description: `Estimated cost exceeds the available budget by ${overrun.toLocaleString()}.`
        });
        break;
      }
      case RF.HIGH_BUDGET_UTILIZATION.code: {
        const utilization = (scenario.derived?.total_estimated_cost ?? 0) / (scenario.input?.budget ?? 1);
        consequences.push({
          code: 'BUDGET_BUFFER_LOW',
          category: 'financial',
          severity: 'WARNING' as const,
          title: 'Low Budget Buffer',
          description: `Most of the available budget is already allocated, leaving limited financial buffer. Utilization: ${(utilization * 100).toFixed(1)}%.`
        });
        break;
      }
      case RF.ELEVATED_BUDGET_UTILIZATION.code: {
        const utilization = (scenario.derived?.total_estimated_cost ?? 0) / (scenario.input?.budget ?? 1);
        consequences.push({
          code: 'BUDGET_BUFFER_MODERATE',
          category: 'financial',
          severity: 'INFO' as const,
          title: 'Moderate Budget Utilization',
          description: `A significant portion of the budget is utilized. Utilization: ${(utilization * 100).toFixed(1)}%.`
        });
        break;
      }
      case RF.SEVERE_TIMELINE_PRESSURE.code: {
        const baselineTl = baseline.input?.timeline_days ?? 0;
        const scenarioTl = scenario.input?.timeline_days ?? 0;
        const change = ((scenarioTl - baselineTl) / baselineTl) * 100;
        consequences.push({
          code: 'SEVERE_TIMELINE_PRESSURE',
          category: 'schedule',
          severity: 'CRITICAL' as const,
          title: 'Severe Timeline Pressure',
          description: `Timeline reduced by ${Math.abs(change).toFixed(1)}% (from ${baselineTl} to ${scenarioTl} days).`
        });
        break;
      }
      case RF.TIMELINE_PRESSURE.code: {
        const baselineTl = baseline.input?.timeline_days ?? 0;
        const scenarioTl = scenario.input?.timeline_days ?? 0;
        const change = ((scenarioTl - baselineTl) / baselineTl) * 100;
        consequences.push({
          code: 'TIMELINE_PRESSURE',
          category: 'schedule',
          severity: 'WARNING' as const,
          title: 'Timeline Pressure',
          description: `Timeline reduced by ${Math.abs(change).toFixed(1)}% (from ${baselineTl} to ${scenarioTl} days).`
        });
        break;
      }
      case RF.HIGH_PARTICIPANT_PRESSURE.code: {
        const baselinePart = baseline.input?.participants ?? 0;
        const scenarioPart = scenario.input?.participants ?? 0;
        const change = ((scenarioPart - baselinePart) / baselinePart) * 100;
        consequences.push({
          code: 'HIGH_CAPACITY_PRESSURE',
          category: 'capacity',
          severity: 'CRITICAL' as const,
          title: 'High Capacity Pressure',
          description: `Participant count increased by ${change.toFixed(1)}% (from ${baselinePart} to ${scenarioPart}).`
        });
        break;
      }
      case RF.PARTICIPANT_PRESSURE.code: {
        const baselinePart = baseline.input?.participants ?? 0;
        const scenarioPart = scenario.input?.participants ?? 0;
        const change = ((scenarioPart - baselinePart) / baselinePart) * 100;
        consequences.push({
          code: 'CAPACITY_PRESSURE',
          category: 'capacity',
          severity: 'WARNING' as const,
          title: 'Capacity Pressure',
          description: `Participant count increased by ${change.toFixed(1)}% (from ${baselinePart} to ${scenarioPart}).`
        });
        break;
      }
      case RF.HIGH_COST_ESCALATION.code: {
        const baselineCost = baseline.derived?.total_estimated_cost ?? 0;
        const scenarioCost = scenario.derived?.total_estimated_cost ?? 0;
        const change = ((scenarioCost - baselineCost) / baselineCost) * 100;
        consequences.push({
          code: 'HIGH_COST_ESCALATION',
          category: 'financial',
          severity: 'CRITICAL' as const,
          title: 'High Cost Escalation',
          description: `Estimated cost increased by ${change.toFixed(1)}% (from ${baselineCost.toLocaleString()} to ${scenarioCost.toLocaleString()}).`
        });
        break;
      }
      case RF.COST_ESCALATION.code: {
        const baselineCost = baseline.derived?.total_estimated_cost ?? 0;
        const scenarioCost = scenario.derived?.total_estimated_cost ?? 0;
        const change = ((scenarioCost - baselineCost) / baselineCost) * 100;
        consequences.push({
          code: 'COST_ESCALATION',
          category: 'financial',
          severity: 'WARNING' as const,
          title: 'Cost Escalation',
          description: `Estimated cost increased by ${change.toFixed(1)}% (from ${baselineCost.toLocaleString()} to ${scenarioCost.toLocaleString()}).`
        });
        break;
      }
      default:
        // Unknown factor, skip
        break;
    }
  }

  return consequences;
}