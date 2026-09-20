// Dependency Validator
// Phase 3: Simulation Engine

import type { DependencyEdge, DependencyRelationship } from './simulation-types';
import { DependencyGraph } from './dependency-graph';

/**
 * Validate dependencies in the graph
 */
export class DependencyValidator {
  /**
   * Validate that all dependencies reference valid nodes
   */
  static validateReferences(graph: DependencyGraph): string[] {
    const errors: string[] = [];
    const edges = graph.getAllEdges();
    const nodeIds = new Set(graph.getAllNodes().map(node => node.id));

    for (const edge of edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Dependency source "${edge.source}" does not exist`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Dependency target "${edge.target}" does not exist`);
      }
    }

    return errors;
  }

  /**
   * Validate that relationship types are valid
   */
  static validateRelationships(graph: DependencyGraph): string[] {
    const errors: string[] = [];
    const validRelationships: DependencyRelationship[] = [
      "increases", "decreases", "requires", "constrains", "depends_on"
    ];
    const edges = graph.getAllEdges();

    for (const edge of edges) {
      if (!validRelationships.includes(edge.relationship)) {
        errors.push(`Invalid relationship "${edge.relationship}" for dependency from ${edge.source} to ${edge.target}`);
      }
    }

    return errors;
  }

  /**
   * Detect circular dependencies in the graph
   * Returns an array of cycles found (empty array if no cycles)
   */
  static detectCircularDependencies(graph: DependencyGraph): string[][] {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]): void => {
      if (recStack.has(nodeId)) {
        // Found a cycle
        const cycleStartIndex = path.indexOf(nodeId);
        if (cycleStartIndex !== -1) {
          const cycle = path.slice(cycleStartIndex);
          cycle.push(nodeId); // Close the cycle
          cycles.push(cycle);
        }
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      // Visit all neighbors (dependencies)
      const dependencies = graph.getDependencies(nodeId);
      for (const edge of dependencies) {
        dfs(edge.target, [...path]);
      }

      recStack.delete(nodeId);
      path.pop();
    };

    // Start DFS from each unvisited node
    for (const node of graph.getAllNodes()) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }

  /**
   * Validate the entire dependency graph
   * Returns an array of all validation errors
   */
  static validateGraph(graph: DependencyGraph): string[] {
    const errors: string[] = [];

    // Check references
    errors.push(...this.validateReferences(graph));

    // Check relationship types
    errors.push(...this.validateRelationships(graph));

    // Check for circular dependencies
    const cycles = this.detectCircularDependencies(graph);
    if (cycles.length > 0) {
      errors.push(`Circular dependency detected: ${cycles.map(cycle => cycle.join(' -> ')).join('; ')}`);
    }

    return errors;
  }
}
