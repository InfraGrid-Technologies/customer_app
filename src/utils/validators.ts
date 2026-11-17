/**
 * Global Validation Utilities
 *
 * ROLE:
 * Pure, stateless validation functions used across all feature slices.
 * Ensures consistent data entry rules for Indian compliance and identity registries.
 */

export const validators = {
  /**
   * Cleans input by removing spaces, hyphens, slashes, and dots
   */
  cleanInput(value: string): string {
    if (!value) return '';
    return value.trim().replace(/[\s\-\/\.]/g, '').toUpperCase();
  },

  /**
   * Validates Indian Driving License format
   * Covers:
   * - 15-char standard: TS0920210001234
   * - 16-char 3-digit RTO: TS01620240001534
   * - Legacy 13-15 digits: MH0119980005432
   */
  isValidDrivingLicense(dlNumber: string): boolean {
    if (!dlNumber) return false;
    const cleaned = this.cleanInput(dlNumber);

    // 1. Strict Sarathi 4.0: State(2) + RTO(2-3) + Year(19xx/20xx) + Number(7)
    const sarathiStandard = /^[A-Z]{2}[0-9]{2,3}(19|20)\d{2}\d{7}$/;

    // 2. Fallback for legacy state licenses (2 letters + 13-15 digits)
    const legacyStandard = /^[A-Z]{2}[0-9]{13,15}$/;

    return sarathiStandard.test(cleaned) || legacyStandard.test(cleaned);
  },

  /**
   * Validates Indian Vehicle Registration (RC) Number
   * Covers:
   * - Standard 10-char: TS16FD7966, DL01AB1234
   * - Single-digit RTO: DL1C1234, DL4S9999
   * - 3-letter series: DL1CAA1234
   * - Bharat Series: 22BH1234AA
   * - Vintage 0-series: MH021234
   */
  isValidVehicleNumber(vehicleNumber: string): boolean {
    if (!vehicleNumber) return false;
    const cleaned = this.cleanInput(vehicleNumber);

    // Standard VAHAN format: State(2) + RTO(1-2) + Series(0-3) + Number(4)
    const standardVahan = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

    // Bharat Series (BH): Year(2) + BH + Number(4) + Series(1-2)
    const bharatSeries = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/;

    return standardVahan.test(cleaned) || bharatSeries.test(cleaned);
  },

  /**
   * Validates Chassis Number (VIN - 17 characters, no letters I, O, Q)
   */
  isValidChassisNumber(chassisNumber: string): boolean {
    if (!chassisNumber) return false;
    const cleaned = this.cleanInput(chassisNumber);
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned);
  },

  /**
   * Validates Date of Birth (YYYY-MM-DD)
   */
  isValidDob(dob: string): boolean {
    if (!dob) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(dob.trim());
  },

  /**
   * Validates Indian Bank Account Number (9 to 18 digits)
   */
  isValidAccountNumber(accountNumber: string): boolean {
    if (!accountNumber) return false;
    return /^\d{9,18}$/.test(accountNumber.trim());
  },

  /**
   * Validates Indian Financial System Code (IFSC)
   * Format: 4 letters + '0' + 6 alphanumeric characters (e.g. UTIB0000001, SBIN0001234)
   */
  isValidIfsc(ifsc: string): boolean {
    if (!ifsc) return false;
    return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(this.cleanInput(ifsc));
  },
};

export default validators;