export interface Plan {
  title: string | null;
  type: string | null;
  participants: number | null;
  budget: number | null;
  timeline_days: number | null;
  organizers: number | null;
  location: string | null;
  resources: string[];
  constraints: string[];
}

export interface PlanDependencies {
  // Dependencies will be defined in Phase 2
  [key: string]: unknown;
}

export interface Assumptions {
  participants?: number;
  budget?: number;
  timeline_days?: number;
  organizers?: number;
  // Additional assumption fields can be added later
}