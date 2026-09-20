import { z } from 'zod';

// Parse plan validation
export const parsePlanSchema = z.object({
  input: z.string().min(1, 'Input cannot be empty')
});

// Simulate validation
export const simulateSchema = z.object({
  plan: z.object({
    title: z.union([z.string(), z.null()]),
    type: z.union([z.string(), z.null()]),
    participants: z.union([z.number().int().nonnegative(), z.null()]),
    budget: z.union([z.number().nonnegative(), z.null()]),
    timeline_days: z.union([z.number().int().nonnegative(), z.null()]),
    organizers: z.union([z.number().int().nonnegative(), z.null()]),
    location: z.union([z.string(), z.null()]),
    resources: z.array(z.string()),
    constraints: z.array(z.string())
  }),
  dependencies: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      relationship: z.enum(["increases", "decreases", "requires", "constrains", "depends_on"]),
      strength: z.enum(["LOW", "MEDIUM", "HIGH"]),
      reason: z.string()
    })
  ).default([])
});

// Resimulate validation - Updated for Phase 6
export const resimulateSchema = z.object({
  original_plan: z.object({
    title: z.union([z.string(), z.null()]),
    type: z.union([z.string(), z.null()]),
    participants: z.union([z.number().int().nonnegative(), z.null()]),
    budget: z.union([z.number().nonnegative(), z.null()]),
    timeline_days: z.union([z.number().int().nonnegative(), z.null()]),
    organizers: z.union([z.number().int().nonnegative(), z.null()]),
    location: z.union([z.string(), z.null()]),
    resources: z.array(z.string()),
    constraints: z.array(z.string())
  }),
  dependencies: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      relationship: z.enum(["increases", "decreases", "requires", "constrains", "depends_on"]),
      strength: z.enum(["LOW", "MEDIUM", "HIGH"]),
      reason: z.string()
    })
  ).default([]),
  changes: z.object({
    participants: z.union([z.number().int(), z.null()]).optional(),
    budget: z.union([z.number(), z.null()]).optional(),
    timeline_days: z.union([z.number().int(), z.null()]).optional(),
    organizers: z.union([z.number().int(), z.null()]).optional(),
    // Cost assumptions that can be modified
    food_cost_per_person: z.union([z.number(), z.null()]).optional(),
    transport_cost_per_person: z.union([z.number(), z.null()]).optional(),
    default_venue_cost: z.union([z.number(), z.null()]).optional()
  }).strict()
});

// History doesn't need validation for GET request