/**
 * Ensures a value is a number; converts strings to numbers and handles null/undefined
 * @param value The value to convert to a number
 * @param defaultValue The default value to return if conversion fails
 */
export function ensureNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}