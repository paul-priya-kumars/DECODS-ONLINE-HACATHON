/**
 * Normalize Indian currency format to numeric value
 * Examples:
 * - "₹2 lakh" → 200000
 * - "₹50,000" → 50000
 * - "₹1.5 lakh" → 150000
 * - "₹2500" → 2500
 */
export function normalizeCurrency(value: string): number | null {
  // Remove whitespace and convert to lowercase for easier matching
  const cleaned = value.trim().toLowerCase();

  // Match patterns like "₹2 lakh", "2 lakh", "₹1.5 million", etc.
  const lakhMatch = cleaned.match(/^(?:₹)?(\d+(?:\.\d+)?)\s*lakh$/);
  if (lakhMatch) {
    return parseFloat(lakhMatch[1]) * 100000;
  }

  const millionMatch = cleaned.match(/^(?:₹)?(\d+(?:\.\d+)?)\s*million$/);
  if (millionMatch) {
    return parseFloat(millionMatch[1]) * 1000000;
  }

  // Match standard currency format with commas (e.g., "₹50,000" or "50,000")
  const standardMatch = cleaned.match(/^(?:₹)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)$/);
  if (standardMatch) {
    return parseFloat(standardMatch[1].replace(/,/g, ''));
  }

  // Match simple numeric value (e.g., "2500" or "₹2500")
  const simpleMatch = cleaned.match(/^(?:₹)?(\d+(?:\.\d+)?)$/);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1]);
  }

  return null;
}

/**
 * Normalize time expressions to days
 * Examples:
 * - "2 weeks" → 14
 * - "1 week" → 7
 * - "1 month" → 30 (approximation)
 * - "48 hours" → 2
 * - "3 days" → 3
 */
export function normalizeTime(value: string): number | null {
  // Remove whitespace and convert to lowercase
  const cleaned = value.trim().toLowerCase();

  // Match patterns like "2 weeks", "1 week", etc.
  const weekMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*weeks?$/);
  if (weekMatch) {
    return Math.round(parseFloat(weekMatch[1]) * 7);
  }

  // Match patterns like "1 month", "2 months", etc.
  const monthMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*months?$/);
  if (monthMatch) {
    // Approximate month as 30 days
    return Math.round(parseFloat(monthMatch[1]) * 30);
  }

  // Match patterns like "48 hours", "2 hours", etc.
  const hourMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*hours?$/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) / 24);
  }

  // Match patterns like "3 days", "5 days", etc.
  const dayMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*days?$/);
  if (dayMatch) {
    return Math.round(parseFloat(dayMatch[1]));
  }

  // Match simple numeric value (assumed to be days if no unit specified)
  const simpleMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1]);
  }

  return null;
}

/**
 * Normalize a plain number string (removes commas, etc.)
 */
export function normalizeNumber(value: string): number | null {
  const cleaned = value.trim().replace(/,/g, '');
  const numMatch = cleaned.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }
  return null;
}