/**
 * Formats a given number into Indian Rupee locale with Indian spacing / grouping.
 * E.g., 150000 becomes "₹ 1,50,000" and 1500 becomes "₹ 1,500"
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null) return "₹ 0";
  const numFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });
  // Replace standard Symbol with Symbol + space to match requested format "₹ 1,50,000"
  return numFormatter.format(amount).replace('₹', '₹ ');
}

/**
 * Converts ISO / standard date string to standard Indian Date representation DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      // If already DD/MM/YYYY formatted
      return dateString;
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
}

/**
 * Custom age calculator from Date of Birth
 */
export function calculateAge(dobStr: string): number {
  if (!dobStr) return 0;
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
