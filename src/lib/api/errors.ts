// Standard error codes for the API
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SIMULATION_NOT_FOUND: 'SIMULATION_NOT_FOUND'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
