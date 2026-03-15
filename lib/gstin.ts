/**
 * GSTIN (GST Identification Number) validation - Indian government format.
 * Structure: 2 digits (state) + 5 letters + 4 digits + 1 letter (PAN) + 1 char (entity) + Z + 1 char (checksum)
 * Uses Luhn mod 36 algorithm for check digit.
 * @see https://ddvat.gov.in/docs/List%20of%20State%20Code.pdf
 */

const GSTIN_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Valid state codes (01-37 per Census 2011) */
const VALID_STATE_CODES = new Set([
  "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "10", "11", "12", "13", "14", "15", "16", "17", "18",
  "19", "20", "21", "22", "23", "24", "25", "26", "27",
  "28", "29", "30", "31", "32", "33", "34", "35", "36", "37",
]);

/**
 * Luhn mod 36 checksum. Valid GSTIN has checksum 0.
 */
function luhnMod36Checksum(value: string): number {
  const n = 36;
  const values = [...value].reverse().map((c) => GSTIN_ALPHABET.indexOf(c));
  if (values.some((v) => v < 0)) return -1; // invalid char

  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    if (i % 2 === 0) {
      sum += values[i];
    } else {
      const doubled = values[i] * 2;
      sum += Math.floor(doubled / n) + (doubled % n);
    }
  }
  return sum % n;
}

/**
 * Validate GSTIN per Indian government format.
 * - 15 characters
 * - Position 1-2: State code (01-37)
 * - Position 3-7: 5 letters (PAN)
 * - Position 8-11: 4 digits (PAN)
 * - Position 12: 1 letter (PAN)
 * - Position 13: Entity (1-9 or A-Z, not 0)
 * - Position 14: Always 'Z'
 * - Position 15: Check digit (Luhn mod 36)
 */
export function isValidGSTIN(value: string): boolean {
  const upper = value.trim().toUpperCase();
  if (upper.length !== 15) return false;

  // Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 char + Z + 1 char
  const formatRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  if (!formatRegex.test(upper)) return false;

  // State code must be valid
  if (!VALID_STATE_CODES.has(upper.slice(0, 2))) return false;

  // Luhn mod 36 checksum
  return luhnMod36Checksum(upper) === 0;
}
