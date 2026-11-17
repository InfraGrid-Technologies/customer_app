/**
 * Global Formatting Utilities
 *
 * ROLE:
 * Pure, stateless formatting functions for currency, masks, and vehicle registration IDs.
 */

export const formatters = {
  /**
   * Formats numbers into Indian Rupee currency format
   * Example: 150000 -> "₹ 1,50,000"
   */
  formatCurrency(amount: number): string {
    if (isNaN(amount)) return '₹ 0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Masks sensitive identifiers like Aadhaar or Bank Account numbers for privacy
   * Example: "123456789012" -> "•••• •••• 9012"
   */
  maskAadhaar(aadhaar: string): string {
    if (!aadhaar || aadhaar.length < 4) return '••••';
    const last4 = aadhaar.slice(-4);
    return `•••• •••• ${last4}`;
  },

  /**
   * Normalizes vehicle numbers into uppercase without spaces
   * Example: "mh 12 ab 1234" -> "MH12AB1234"
   */
  cleanRegistrationNumber(regNo: string): string {
    if (!regNo) return '';
    return regNo.replace(/[\s-]/g, '').toUpperCase();
  },

  /**
   * Formats ISO date string into readable Indian Standard Time format
   * Example: "2026-11-13T10:00:00.000Z" -> "13 Nov 2026, 03:30 PM"
   */
  formatDateTime(isoDate: string): string {
    if (!isoDate) return '-';
    try {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  },
};

export default formatters;

