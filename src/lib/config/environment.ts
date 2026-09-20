// Environment configuration
// In a real app, you would use something like:
// const config = {
//   llmApiKey: process.env.LLM_API_KEY,
//   databaseUrl: process.env.DATABASE_URL,
// };

// For Phase 1, we don't need to access these yet, but we define the structure
export const config = {
  // These will be used in later phases
  llmApiKey: process.env.LLM_API_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  
  // App configuration
  appName: 'UNDO THE FUTURE',
  version: '1.0.0',
  phase: 1
};

export default config;
