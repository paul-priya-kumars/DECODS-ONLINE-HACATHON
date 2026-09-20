// Simulation Types for UNDO THE FUTURE
// Phase 3: Simulation Engine

export type DependencyRelationship =
  | "increases"
  | "decreases"
  | "requires"
  | "constrains"
  | "depends_on";

export interface DependencyNode {
  id: string;
  value: number | null;
  type: "number" | "string" | "null";
}

export interface DependencyEdge {
  source: string;
  target: string;
  relationship: DependencyRelationship;
  strength: "LOW" | "MEDIUM" | "HIGH";
  reason: string;
}

export interface SimulationAssumptions {
  food_cost_per_person?: number;
  transport_cost_per_person?: number;
  default_venue_cost?: number;
  [key: string]: unknown; // Allow for extensibility
}

export interface SimulationCalculation {
  calculation: string;
  formula: string;
  inputs: Record<string, number>;
  result: number;
}

export interface DerivedVariables {
  food_cost: number | null;
  transport_cost: number | null;
  venue_cost: number | null;
  total_estimated_cost: number | null;
  budget_remaining: number | null;
  budget_utilization: number | null;
  participants_per_organizer: number | null;
  [key: string]: number | null; // Allow for extensibility
}

export interface SimulationState {
  simulation_id: string;
  input: Record<string, number | null>;
  derived: DerivedVariables;
  dependencies: DependencyEdge[];
  assumptions: SimulationAssumptions;
  calculations: SimulationCalculation[];
  missing_inputs: string[];
}

export interface SimulationResult {
  simulation_id: string;
  input: Record<string, number | null>;
  derived: DerivedVariables;
  dependencies: DependencyEdge[];
  assumptions: SimulationAssumptions;
  calculations: SimulationCalculation[];
  missing_inputs: string[];
}
