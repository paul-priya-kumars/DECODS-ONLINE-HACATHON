// Simulation Engine

import type { Plan } from '@/lib/types/plan';
import type { DependencyEdge } from './simulation-types';
import type { SimulationResult, DerivedVariables, SimulationAssumptions, SimulationCalculation } from './simulation-types';
import { DependencyGraph } from './dependency-graph';
import { DependencyValidator } from './dependency-validator';
import { CalculationEngine } from './calculation-engine';
import { PropagationEngine } from './propagation-engine';

/**
 * Main simulation engine that orchestrates the simulation process
 */
export class SimulationEngine {

  private dependencyGraph: DependencyGraph;
  private calculationEngine: CalculationEngine;
  private propagationEngine: PropagationEngine;

  constructor() {
    this.dependencyGraph = new DependencyGraph();
    this.calculationEngine = new CalculationEngine();
    this.propagationEngine = new PropagationEngine(this.dependencyGraph);
  }

  /**
   * Run a simulation based on a plan and dependencies
   * @param plan The structured plan to simulate
   * @param dependencies The dependencies between variables
   * @returns The simulation result
   */
  simulate(plan: Plan, dependencies: DependencyEdge[] = []): SimulationResult {
    const defaultAssumptions = this.getDefaultAssumptions();
    return this.simulateWithAssumptions(plan, dependencies, defaultAssumptions);
  }

  /**
   * Run a simulation based on a plan, dependencies, and explicit assumptions
   * @param plan The structured plan to simulate
   * @param dependencies The dependencies between variables
   * @param assumptions The simulation assumptions to use
   * @returns The simulation result
   */
  simulateWithAssumptions(plan: Plan, dependencies: DependencyEdge[] = [], assumptions: SimulationAssumptions = {}): SimulationResult {
    // Step 1: Validate the plan
    this.validatePlan(plan);

    // Step 2: Build the dependency graph from plan and dependencies
    this.buildDependencyGraph(plan, dependencies);

    // Step 3: Validate the dependency graph
    const validationErrors = DependencyValidator.validateGraph(this.dependencyGraph);
    if (validationErrors.length > 0) {
      throw new Error("Dependency validation failed: " + validationErrors.join("; "));
    }

    // Step 4: Extract base variables from the plan
    const baseVariables = this.extractBaseVariables(plan);

    // Step 5: Set node values in the graph
    this.setNodeValues(baseVariables);

    // Step 6: Calculate derived variables
    const { derived, calculations } = this.calculateDerivedVariables(baseVariables, assumptions);

    // Step 7: Identify missing inputs
    const missingInputs = this.identifyMissingInputs(baseVariables);

    // Step 8: Generate simulation ID
    const simulationId = this.generateSimulationId();

    // Step 9: Build and return the simulation result
    return {
      simulation_id: simulationId,
      input: baseVariables,
      derived,
      dependencies,
      assumptions, // Return the assumptions used
      calculations,
      missing_inputs: missingInputs
    };
  }

  /**
   * Validate that the plan has required fields or at least some data
   */
  private validatePlan(plan: Plan): void {
    // Basic validation - at least some fields should be present
    // We're lenient here since the simulation can work with null values
    // but we want to ensure we got a plan object
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan: plan must be a non-null object');
    }
  }

  /**
   * Build the dependency graph from the plan and explicit dependencies
   */
  private buildDependencyGraph(plan: Plan, dependencies: DependencyEdge[]): void {
    // Clear the graph first
    this.dependencyGraph.clear();

    // Add nodes for base variables (from plan)
    const baseVariableFields: (keyof Plan)[] = [
      'participants',
      'budget',
      'timeline_days',
      'organizers'
    ];

    // Add nodes for each base variable field
    for (const field of baseVariableFields) {
      const value = plan[field];
      this.dependencyGraph.addNode(field, typeof value === 'number' ? value : null, 'number');
    }

    // Add nodes for derived variables (calculated during simulation)
    const derivedVariableFields = [
      'food_cost',
      'transport_cost',
      'venue_cost',
      'total_estimated_cost',
      'budget_remaining',
      'budget_utilization',
      'participants_per_organizer'
    ];

    // Add nodes for each derived variable field (initial value is null)
    for (const field of derivedVariableFields) {
      this.dependencyGraph.addNode(field, null, 'number');
    }

    // Add explicit dependencies
    for (const dep of dependencies) {
      this.dependencyGraph.addDependency(
        dep.source,
        dep.target,
        dep.relationship,
        dep.strength,
        dep.reason
      );
    }

    // Add implicit dependencies based on how variables are calculated
    this.addImplicitDependencies();
  }

  /**
   * Add implicit dependencies based on calculation formulas
   */
  private addImplicitDependencies(): void {
    // food_cost depends on participants
    this.dependencyGraph.addDependency(
      'participants',
      'food_cost',
      'depends_on',
      'MEDIUM',
      'Food cost calculation depends on number of participants'
    );

    // transport_cost depends on participants
    this.dependencyGraph.addDependency(
      'participants',
      'transport_cost',
      'depends_on',
      'MEDIUM',
      'Transport cost calculation depends on number of participants'
    );

    // total_estimated_cost depends on food_cost, transport_cost, venue_cost
    this.dependencyGraph.addDependency(
      'food_cost',
      'total_estimated_cost',
      'depends_on',
      'HIGH',
      'Total estimated cost includes food cost'
    );
    this.dependencyGraph.addDependency(
      'transport_cost',
      'total_estimated_cost',
      'depends_on',
      'HIGH',
      'Total estimated cost includes transport cost'
    );
    this.dependencyGraph.addDependency(
      'venue_cost',
      'total_estimated_cost',
      'depends_on',
      'HIGH',
      'Total estimated cost includes venue cost'
    );

    // budget_remaining depends on budget and total_estimated_cost
    this.dependencyGraph.addDependency(
      'budget',
      'budget_remaining',
      'depends_on',
      'HIGH',
      'Budget remaining calculation depends on total budget'
    );
    this.dependencyGraph.addDependency(
      'total_estimated_cost',
      'budget_remaining',
      'depends_on',
      'HIGH',
      'Budget remaining calculation depends on total estimated cost'
    );

    // budget_utilization depends on total_estimated_cost and budget
    this.dependencyGraph.addDependency(
      'total_estimated_cost',
      'budget_utilization',
      'depends_on',
      'HIGH',
      'Budget utilization calculation depends on total estimated cost'
    );
    this.dependencyGraph.addDependency(
      'budget',
      'budget_utilization',
      'depends_on',
      'HIGH',
      'Budget utilization calculation depends on total budget'
    );

    // participants_per_organizer depends on participants and organizers
    this.dependencyGraph.addDependency(
      'participants',
      'participants_per_organizer',
      'depends_on',
      'MEDIUM',
      'Participants per organizer calculation depends on number of participants'
    );
    this.dependencyGraph.addDependency(
      'organizers',
      'participants_per_organizer',
      'depends_on',
      'MEDIUM',
      'Participants per organizer calculation depends on number of organizers'
    );
  }

  /**
   * Extract base variables from the plan object
   */
  private extractBaseVariables(plan: Plan): Record<string, number | null> {
    return {
      participants: plan.participants ?? null,
      budget: plan.budget ?? null,
      timeline_days: plan.timeline_days ?? null,
      organizers: plan.organizers ?? null
      // Note: location, title, type, resources, constraints are not used in calculations
    };
  }

  /**
   * Set node values in the dependency graph from base variables
   */
  private setNodeValues(baseVariables: Record<string, number | null>): void {
    for (const [key, value] of Object.entries(baseVariables)) {
      this.dependencyGraph.updateNodeValue(key, value);
    }
  }

  /**
   * Get default assumptions from environment variables
   */
  getDefaultAssumptions(): SimulationAssumptions {
    const foodCostPerPerson = parseFloat(process.env.FOOD_COST_PER_PERSON || '250');
    const transportCostPerPerson = parseFloat(process.env.TRANSPORT_COST_PER_PERSON || '100');
    const defaultVenueCost = parseFloat(process.env.DEFAULT_VENUE_COST || '30000');

    return {
      food_cost_per_person: isNaN(foodCostPerPerson) ? 250 : foodCostPerPerson,
      transport_cost_per_person: isNaN(transportCostPerPerson) ? 100 : transportCostPerPerson,
      default_venue_cost: isNaN(defaultVenueCost) ? 30000 : defaultVenueCost
    };
  }

  /**
   * Calculate derived variables using the calculation engine
   */
  private calculateDerivedVariables(baseVariables: Record<string, number | null>, assumptions: SimulationAssumptions = {}): { derived: DerivedVariables; calculations: SimulationCalculation[] } {
    return this.calculationEngine.calculateDerivedVariables(baseVariables, assumptions);
  }

  /**
   * Identify which base variables are missing (null)
   */
  private identifyMissingInputs(baseVariables: Record<string, number | null>): string[] {
    const missing: string[] = [];
    for (const [key, value] of Object.entries(baseVariables)) {
      if (value === null) {
        missing.push(key);
      }
    }
    return missing;
  }

  /**
   * Generate a unique simulation ID
   * Using timestamp + random string for simplicity
   * In production, you might want to use a proper UUID library
   */
  private generateSimulationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return `sim_${timestamp}_${random}`;
  }
}