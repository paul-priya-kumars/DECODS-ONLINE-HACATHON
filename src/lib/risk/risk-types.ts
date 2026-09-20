// Risk Types
// Phase 5: Deterministic Risk + Consequence Engine

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskFactor {
  code: string;
  label: string;
  points: number;
  triggered: boolean;
  explanation: string;
}

export interface RiskEvaluation {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  summary: string;
}

export interface Consequence {
  code: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
}

export interface Decision {
  action: string;
  priority: 'INFO' | 'WARNING' | 'IMMEDIATE';
  rationale: string;
}