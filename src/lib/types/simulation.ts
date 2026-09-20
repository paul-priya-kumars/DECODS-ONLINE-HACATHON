import type { Assumptions } from './plan';
import type { SimulationAssumptions, SimulationResult, DerivedVariables, DependencyEdge, SimulationCalculation } from '@/lib/simulation/simulation-types';
import type { RiskEvaluation } from '@/lib/risk/risk-types';
import type { Consequence } from '@/lib/risk/risk-types';
import type { Decision } from '@/lib/risk/risk-types';

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RiskScore = number; // 0-100

export interface Scenario {
  risk: RiskLevel;
  risk_score: RiskScore;
  estimated_cost: number;
  timeline_days: number;
  impact: string;
  consequences: string[];
}

export interface Scenarios {
  normal: Scenario;
  stress: Scenario;
  failure: Scenario;
}

// Removed duplicate SimulationResult interface - using the imported one

export interface ResimulationRequest {
  simulation_id: string;
  assumptions: Assumptions;
}

// Added for Phase 6 - Resimulation
export interface ResimulationChanges {
  participants?: number | null;
  budget?: number | null;
  timeline_days?: number | null;
  organizers?: number | null;
  food_cost_per_person?: number | null;
  transport_cost_per_person?: number | null;
  default_venue_cost?: number | null;
}

export interface ResimulationRequestV2 {
  original_plan: any; // Will be typed as Plan from '@/lib/types/plan'
  dependencies: any[]; // Will be typed as DependencyEdge[] from '@/lib/simulation/simulation-types'
  changes: ResimulationChanges;
}

export interface EnrichedSimulationResult extends SimulationResult {
  risk: RiskEvaluation;
  consequences: Consequence[];
  decision: Decision;
}

export interface ResimulationResult {
  simulation_id: string;
  original: {
    plan: any; // Plan
    simulation: EnrichedSimulationResult;
    scenarios: any; // Scenarios
  };
  changed: {
    plan: any; // Plan
    simulation: EnrichedSimulationResult;
    scenarios: any; // Scenarios
  };
  changes: {
    [key: string]: {
      before: number | null;
      after: number | null;
      change: number | null;
      change_percent: number | null;
    };
  };
  comparison: {
    metrics: {
      [key: string]: {
        before: number | null;
        after: number | null;
        change: number | null;
        change_percent: number | null;
      };
    };
    scenarios: {
      normal: {
        risk: {
          before: { score: number; level: RiskLevel };
          after: { score: number; level: RiskLevel };
        };
        total_estimated_cost: {
          before: number | null;
          after: number | null;
          change: number | null;
          change_percent: number | null;
        };
      };
      stress: {
        risk: {
          before: { score: number; level: RiskLevel };
          after: { score: number; level: RiskLevel };
        };
        total_estimated_cost: {
          before: number | null;
          after: number | null;
          change: number | null;
          change_percent: number | null;
        };
      };
      failure: {
        risk: {
          before: { score: number; level: RiskLevel };
          after: { score: number; level: RiskLevel };
        };
        total_estimated_cost: {
          before: number | null;
          after: number | null;
          change: number | null;
          change_percent: number | null;
        };
      };
    };
    risk: {
      before: { score: number; level: RiskLevel };
      after: { score: number; level: RiskLevel };
    };
    consequences: {
      normal: {
        before: Consequence[];
        after: Consequence[];
        added: Consequence[];
        removed: Consequence[];
      };
      stress: {
        before: Consequence[];
        after: Consequence[];
        added: Consequence[];
        removed: Consequence[];
      };
      failure: {
        before: Consequence[];
        after: Consequence[];
        added: Consequence[];
        removed: Consequence[];
      };
    };
    decisions: {
      normal: {
        before: Decision;
        after: Decision;
      };
      stress: {
        before: Decision;
        after: Decision;
      };
      failure: {
        before: Decision;
        after: Decision;
      };
    };
  };
}