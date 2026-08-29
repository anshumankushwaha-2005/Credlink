export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  const formatted = Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return (n < 0 ? '-' : '') + '₹' + formatted;
}
