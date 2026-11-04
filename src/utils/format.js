// ₱8, ₱3.50 (decimals only when needed)
export function peso(n) {
  return (
    '₱' +
    n.toLocaleString('en-PH', {
      minimumFractionDigits: n % 1 ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}
