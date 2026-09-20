// Calculation Engine
// Phase 3: Simulation Engine

import type { DerivedVariables, SimulationAssumptions, SimulationCalculation } from './simulation-types';

/**
 * Engine for calculating derived variables from base variables and assumptions
 */
export class CalculationEngine {
  /**
   * Calculate derived variables based on base variables and assumptions
   * @param baseVariables Object containing base variables like participants, budget, timeline_days, organizers
   * @param assumptions Simulation assumptions like cost per person, default venue cost
   * @returns Object containing derived variables and calculations performed
   */
  calculateDerivedVariables(
    baseVariables: Record<string, number | null>,
    assumptions: SimulationAssumptions = {}
  ): { derived: DerivedVariables; calculations: SimulationCalculation[] } {
    const derived: DerivedVariables = {
      food_cost: null,
      transport_cost: null,
      venue_cost: null,
      total_estimated_cost: null,
      budget_remaining: null,
      budget_utilization: null,
      participants_per_organizer: null
    };

    const calculations: SimulationCalculation[] = [];

    // Extract base variables with null checks
    const participants = baseVariables.participants ?? null;
    const budget = baseVariables.budget ?? null;
    const organizers = baseVariables.organizers ?? null;

    // Calculate food_cost = participants * food_cost_per_person
    if (participants !== null && assumptions.food_cost_per_person !== undefined) {
      const foodCost = participants * assumptions.food_cost_per_person;
      derived.food_cost = foodCost;
      calculations.push({
        calculation: 'food_cost',
        formula: 'participants × food_cost_per_person',
        inputs: { participants, food_cost_per_person: assumptions.food_cost_per_person },
        result: foodCost
      });
    }

    // Calculate transport_cost = participants * transport_cost_per_person
    if (participants !== null && assumptions.transport_cost_per_person !== undefined) {
      const transportCost = participants * assumptions.transport_cost_per_person;
      derived.transport_cost = transportCost;
      calculations.push({
        calculation: 'transport_cost',
        formula: 'participants × transport_cost_per_person',
        inputs: { participants, transport_cost_per_person: assumptions.transport_cost_per_person },
        result: transportCost
      });
    }

    // Calculate venue_cost = default_venue_cost (simplified for Phase 3)
    if (assumptions.default_venue_cost !== undefined) {
      derived.venue_cost = assumptions.default_venue_cost;
      calculations.push({
        calculation: 'venue_cost',
        formula: 'default_venue_cost',
        inputs: { default_venue_cost: assumptions.default_venue_cost },
        result: assumptions.default_venue_cost
      });
    }

    // Calculate total_estimated_cost = food_cost + transport_cost + venue_cost
    if (
      derived.food_cost !== null &&
      derived.transport_cost !== null &&
      derived.venue_cost !== null
    ) {
      const totalCost = derived.food_cost + derived.transport_cost + derived.venue_cost;
      derived.total_estimated_cost = totalCost;
      calculations.push({
        calculation: 'total_estimated_cost',
        formula: 'food_cost + transport_cost + venue_cost',
        inputs: {
          food_cost: derived.food_cost,
          transport_cost: derived.transport_cost,
          venue_cost: derived.venue_cost
        },
        result: totalCost
      });
    }

    // Calculate budget_remaining = budget - total_estimated_cost
    if (budget !== null && derived.total_estimated_cost !== null) {
      const budgetRemaining = budget - derived.total_estimated_cost;
      derived.budget_remaining = budgetRemaining;
      calculations.push({
        calculation: 'budget_remaining',
        formula: 'budget - total_estimated_cost',
        inputs: { budget, total_estimated_cost: derived.total_estimated_cost },
        result: budgetRemaining
      });
    }

    // Calculate budget_utilization = (total_estimated_cost / budget) * 100
    if (
      budget !== null &&
      budget !== 0 &&
      derived.total_estimated_cost !== null
    ) {
      const budgetUtilization = (derived.total_estimated_cost / budget) * 100;
      derived.budget_utilization = budgetUtilization;
      calculations.push({
        calculation: 'budget_utilization',
        formula: '(total_estimated_cost / budget) × 100',
        inputs: { total_estimated_cost: derived.total_estimated_cost, budget },
        result: budgetUtilization
      });
    }

    // Calculate participants_per_organizer = participants / organizers
    if (participants !== null && organizers !== null && organizers !== 0) {
      const participantsPerOrganizer = participants / organizers;
      derived.participants_per_organizer = participantsPerOrganizer;
      calculations.push({
        calculation: 'participants_per_organizer',
        formula: 'participants / organizers',
        inputs: { participants, organizers },
        result: participantsPerOrganizer
      });
    }

    return { derived, calculations };
  }
}