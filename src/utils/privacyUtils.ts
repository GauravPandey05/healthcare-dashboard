/**
 * Privacy utilities for masking or encrypting PII data
 */

/**
 * Masks personally identifiable information (PII) like names
 * Shows only first name and initial of last name
 */
export function maskPII(fullName: string): string {
  if (!fullName) return '';
  
  const nameParts = fullName.split(' ');
  if (nameParts.length === 1) {
    return nameParts[0];
  }
  
  // Keep first name and initial of last name
  const firstName = nameParts[0];
  const lastInitial = nameParts[nameParts.length - 1][0];
  
  return `${firstName} ${lastInitial}.`;
}

/**
 * Masks a patient ID by showing only last 4 characters
 */
export function maskPatientId(patientId: string | number): string {
  const id = String(patientId);
  if (id.length <= 4) return id;
  
  const lastFour = id.slice(-4);
  const masked = '•'.repeat(id.length - 4);
  
  return `${masked}${lastFour}`;
}

/**
 * Masks an email address
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '';
  
  const parts = email.split('@');
  const username = parts[0];
  const domain = parts[1];
  
  const maskedUsername = `${username.charAt(0)}${'•'.repeat(username.length - 2)}${username.charAt(username.length - 1)}`;
  
  return `${maskedUsername}@${domain}`;
}

/**
 * Masks a phone number by showing only last 4 digits
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 4) return digits;
  
  const lastFour = digits.slice(-4);
  return `•••-•••-${lastFour}`;
}

/**
 * Determines if current user has permission to view full PII
 */
export function canViewFullPII(): boolean {
  // In a real app, this would check user roles/permissions
  // For demo purposes, always return false to mask PII
  return false;
}

/**
 * Conditionally masks PII based on user permissions
 */
export function conditionallyMaskPII(value: string, maskFunction: (value: string) => string): string {
  if (canViewFullPII()) {
    return value;
  }
  return maskFunction(value);
}