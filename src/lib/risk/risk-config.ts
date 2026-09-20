// Risk Configuration
// Phase 5: Deterministic Risk + Consequence Engine

export const RISK_THRESHOLDS = {
  LOW_MAX: 29,
  MEDIUM_MAX: 59,
  HIGH_MAX: 100
} as const;

export const RISK_FACTORS = {
  BUDGET_OVERRUN: {
    code: 'BUDGET_OVERRUN',
    label: 'Budget Overrun',
    points: 30,
    explanation: (estimatedCost: number, budget: number, overrun: number) =>
      `Estimated cost: ${estimatedCost.toLocaleString()}, Budget: ${budget.toLocaleString()}, Overrun: ${overrun.toLocaleString()}`
  },
  HIGH_BUDGET_UTILIZATION: {
    code: 'HIGH_BUDGET_UTILIZATION',
    label: 'High Budget Utilization',
    points: 20,
    explanation: (utilization: number) => `Budget utilization: ${(utilization * 100).toFixed(1)}%`
  },
  ELEVATED_BUDGET_UTILIZATION: {
    code: 'ELEVATED_BUDGET_UTILIZATION',
    label: 'Elevated Budget Utilization',
    points: 10,
    explanation: (utilization: number) => `Budget utilization: ${(utilization * 100).toFixed(1)}%`
  },
  SEVERE_TIMELINE_PRESSURE: {
    code: 'SEVERE_TIMELINE_PRESSURE',
    label: 'Severe Timeline Pressure',
    points: 25,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline timeline: ${baseline} days, Scenario timeline: ${scenario} days, Change: ${change}%`
  },
  TIMELINE_PRESSURE: {
    code: 'TIMELINE_PRESSURE',
    label: 'Timeline Pressure',
    points: 15,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline timeline: ${baseline} days, Scenario timeline: ${scenario} days, Change: ${change}%`
  },
  HIGH_PARTICIPANT_PRESSURE: {
    code: 'HIGH_PARTICIPANT_PRESSURE',
    label: 'High Participant Pressure',
    points: 20,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline participants: ${baseline}, Scenario participants: ${scenario}, Change: ${change}%`
  },
  PARTICIPANT_PRESSURE: {
    code: 'PARTICIPANT_PRESSURE',
    label: 'Participant Pressure',
    points: 10,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline participants: ${baseline}, Scenario participants: ${scenario}, Change: ${change}%`
  },
  HIGH_COST_ESCALATION: {
    code: 'HIGH_COST_ESCALATION',
    label: 'High Cost Escalation',
    points: 25,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline estimated cost: ${baseline.toLocaleString()}, Scenario estimated cost: ${scenario.toLocaleString()}, Change: ${change}%`
  },
  COST_ESCALATION: {
    code: 'COST_ESCALATION',
    label: 'Cost Escalation',
    points: 15,
    explanation: (baseline: number, scenario: number, change: number) =>
      `Baseline estimated cost: ${baseline.toLocaleString()}, Scenario estimated cost: ${scenario.toLocaleString()}, Change: ${change}%`
  }
} as const;