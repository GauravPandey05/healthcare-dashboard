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
  if (!patientId) return '';
  
  const id = String(patientId);
  
  // Keep the prefix letter and ensure uniqueness by preserving the last character
  if (/^[A-Z]\d+$/.test(id)) {
    const prefix = id.charAt(0);
    const numericPart = id.substring(1);
    const lastChar = numericPart.slice(-1);
    
    // Always keep last digit to ensure uniqueness
    return `${prefix}${'•'.repeat(Math.max(0, numericPart.length - 1))}${lastChar}`;
  }
  
  // For other formats, keep first and last character
  if (id.length <= 2) return id;
  return `${id.charAt(0)}${'•'.repeat(id.length - 2)}${id.slice(-1)}`;
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

// Add this utility function
export function maskTextContent(text: string): string {
  if (!text) return '';
  
  // Mask patient IDs (format: P followed by digits)
  text = text.replace(/\b(P\d{3,})\b/g, (match) => maskPatientId(match));
  
  // Mask potential names (format: First Last) - look for capitalized words
  text = text.replace(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g, (match) => maskPII(match));
  
  return text;
}

/**
 * Masks a staff ID for privacy (e.g., S001 -> S***1)
 * @param staffId The staff ID to mask
 * @returns The masked staff ID
 */
export const maskStaffId = (staffId: string): string => {
  if (!staffId || staffId.length < 3) return staffId;
  
  // For staff IDs like "S001", return "S***1"
  const firstChar = staffId.charAt(0);
  const lastChar = staffId.charAt(staffId.length - 1);
  const middleLength = staffId.length - 2;
  const maskedMiddle = '*'.repeat(middleLength);
  
  return `${firstChar}${maskedMiddle}${lastChar}`;
};