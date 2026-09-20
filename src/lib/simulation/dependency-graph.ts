// Dependency Graph Implementation
// Phase 3: Simulation Engine

import type { DependencyNode, DependencyEdge, DependencyRelationship } from './simulation-types';

/**
 * In-memory dependency graph
 */
export class DependencyGraph {
  private nodes: Map<string, DependencyNode>;
  private edges: Map<string, DependencyEdge[]>; // source -> outgoing edges
  private reverseEdges: Map<string, DependencyEdge[]>; // target -> incoming edges

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.reverseEdges = new Map();
  }

  /**
   * Add a node to the graph
   */
  addNode(id: string, value: number | null = null, type: "number" | "string" | "null" = "number"): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, value, type });
      this.edges.set(id, []); // Initialize outgoing edges
      this.reverseEdges.set(id, []); // Initialize incoming edges
    }
  }

  /**
   * Get a node from the graph
   */
  getNode(id: string): DependencyNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Update a node's value
   */
  updateNodeValue(id: string, value: number | null): void {
    const node = this.nodes.get(id);
    if (node) {
      node.value = value;
    }
  }

  /**
   * Add a dependency edge to the graph
   */
  addDependency(source: string, target: string, relationship: DependencyRelationship, strength: "LOW" | "MEDIUM" | "HIGH", reason: string): void {
    // Ensure both nodes exist
    if (!this.nodes.has(source)) {
      this.addNode(source);
    }
    if (!this.nodes.has(target)) {
      this.addNode(target);
    }

    const edge: DependencyEdge = {
      source,
      target,
      relationship,
      strength,
      reason
    };

    // Add to outgoing edges
    const outgoing = this.edges.get(source) ?? [];
    outgoing.push(edge);
    this.edges.set(source, outgoing);

    // Add to incoming edges
    const incoming = this.reverseEdges.get(target) ?? [];
    incoming.push(edge);
    this.reverseEdges.set(target, incoming);
  }

  /**
   * Get all dependencies (outgoing edges) for a node
   */
  getDependencies(source: string): DependencyEdge[] {
    return this.edges.get(source) ?? [];
  }

  /**
   * Get all dependents (incoming edges) for a node
   */
  getDependents(target: string): DependencyEdge[] {
    return this.reverseEdges.get(target) ?? [];
  }

  /**
   * Get all nodes in the graph
   */
  getAllNodes(): DependencyNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges in the graph
   */
  getAllEdges(): DependencyEdge[] {
    return Array.from(this.edges.values()).flat();
  }

  /**
   * Check if a node exists
   */
  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  /**
   * Clear the graph
   */
  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.reverseEdges.clear();
  }
}
