// Propagation Engine
// Phase 3: Simulation Engine

import type { DependencyNode, DependencyEdge } from './simulation-types';
import { DependencyGraph } from './dependency-graph';

/**
 * Engine for propagating values through the dependency graph
 */
export class PropagationEngine {
  private graph: DependencyGraph;

  constructor(graph: DependencyGraph) {
    this.graph = graph;
  }

  /**
   * Propagate a value change through the graph
   * This is a simplified propagation - in a more complex system,
   * this would trigger recalculations based on dependency relationships
   */
  propagateValueChange(sourceId: string, newValue: number | null): void {
    // Update the source node's value
    const sourceNode = this.graph.getNode(sourceId);
    if (sourceNode) {
      sourceNode.value = newValue;
    }

    // In a more sophisticated implementation, we would:
    // 1. Find all nodes that depend on this node (through dependencies)
    // 2. Recalculate their values based on the dependency relationships
    // 3. Recursively propagate those changes
    
    // For Phase 3, we're focusing on explicit calculations rather than
    // generic dependency propagation, so this is a placeholder
  }

  /**
   * Get all nodes that depend on the given node (directly or indirectly)
   */
  getDependentNodes(sourceId: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const queue: string[] = [sourceId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      // Get all nodes that depend on currentId (incoming edges to currentId)
      const dependents = this.graph.getDependents(currentId);
      for (const edge of dependents) {
        if (!visited.has(edge.source)) {
          queue.push(edge.source);
          result.push(edge.source);
        }
      }
    }

    return result;
  }

  /**
   * Get all nodes that the given node depends on (directly or indirectly)
   */
  getDependencyNodes(targetId: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    const queue: string[] = [targetId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      // Get all nodes that currentId depends on (outgoing edges from currentId)
      const dependencies = this.graph.getDependencies(currentId);
      for (const edge of dependencies) {
        if (!visited.has(edge.target)) {
          queue.push(edge.target);
          result.push(edge.target);
        }
      }
    }

    return result;
  }
}
