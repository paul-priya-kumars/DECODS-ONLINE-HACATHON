// Decision Engine
// Phase 5: Deterministic Risk + Consequence Engine

import { RiskEvaluation, RiskLevel } from './risk-types';

/**
 * Generates a decision based on the risk evaluation.
 * @param riskEvaluation The risk evaluation for a scenario
 * @returns Decision object with action, priority, rationale, and specific actions
 */
export function generateDecision(riskEvaluation: RiskEvaluation): {
  action: string;
  priority: 'INFO' | 'WARNING' | 'IMMEDIATE';
  rationale: string;
  specificActions: {
    code: string;
    label: string;
    reason: string;
  }[];
} {
  const { level } = riskEvaluation;

  let action: string;
  let priority: 'INFO' | 'WARNING' | 'IMMEDIATE';
  let rationale: string;

  switch (level) {
    case 'LOW':
      action = 'PROCEED';
      priority = 'INFO';
      rationale = 'No significant risk factors detected. Proceed with the plan as is.';
      break;
    case 'MEDIUM':
      action = 'REVIEW_ASSUMPTIONS';
      priority = 'WARNING';
      rationale = 'Some risk factors present. Review assumptions and consider mitigations.';
      break;
    case 'HIGH':
      action = 'MITIGATE_AND_REASSESS';
      priority = 'IMMEDIATE';
      rationale = 'Significant risk factors detected. Immediate action required to mitigate risks.';
      break;
    default:
      action = 'PROCEED';
      priority = 'INFO';
      rationale = 'Unknown risk level. Proceed with caution.';
  }

  // Optionally, we can add specific actions based on triggered factors
  const specificActions: {
    code: string;
    label: string;
    reason: string;
  }[] = [];
  for (const factor of riskEvaluation.factors) {
    switch (factor.code) {
      case 'BUDGET_OVERRUN':
        specificActions.push({
          code: 'REVIEW_BUDGET',
          label: 'Review budget assumptions',
          reason: 'Estimated cost exceeds available budget.'
        });
        break;
      case 'HIGH_BUDGET_UTILIZATION':
      case 'ELEVATED_BUDGET_UTILIZATION':
        specificActions.push({
          code: 'REVIEW_BUDGET',
          label: 'Review budget assumptions',
          reason: 'High budget utilization detected.'
        });
        break;
      case 'SEVERE_TIMELINE_PRESSURE':
      case 'TIMELINE_PRESSURE':
        specificActions.push({
          code: 'REVIEW_TIMELINE',
          label: 'Review timeline assumptions',
          reason: 'Timeline pressure detected.'
        });
        break;
      case 'HIGH_PARTICIPANT_PRESSURE':
      case 'PARTICIPANT_PRESSURE':
        specificActions.push({
          code: 'REVIEW_PARTICIPANTS',
          label: 'Review participant assumptions',
          reason: 'Participant pressure detected.'
        });
        break;
      case 'HIGH_COST_ESCALATION':
      case 'COST_ESCALATION':
        specificActions.push({
          code: 'REVIEW_COSTS',
          label: 'Review cost assumptions',
          reason: 'Cost escalation detected.'
        });
        break;
      default:
        break;
    }
  }

  // Remove duplicate specific actions (by code)
  const uniqueSpecificActions = specificActions.filter(
    (action, index, self) =>
      index === self.findIndex((t) => t.code === action.code)
  );

  return {
    action,
    priority,
    rationale,
    specificActions: uniqueSpecificActions
  };
}