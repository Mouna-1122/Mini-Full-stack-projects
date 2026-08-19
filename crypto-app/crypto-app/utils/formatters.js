/**
 * Small formatting helpers used to turn raw numbers from the CoinGecko API
 * into human-friendly strings for the EJS views.
 */

/**
 * Format a number as INR (Indian Rupee) currency, e.g. 3612500.7 -> "₹36,12,500.70"
 * Uses the en-IN locale so numbers get Indian-style comma grouping (lakhs/crores).
 * Falls back gracefully if the value is missing (API doesn't always have
 * data for every field on every coin).
 */
function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  // Very small coin prices (e.g. ₹0.0000123) need more decimal places
  // than typical currency formatting to remain meaningful.
  const decimals = value < 1 ? 6 : 2;
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a large number with commas, e.g. 812345678 -> "812,345,678"
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return Math.round(value).toLocaleString("en-IN");
}

/**
 * Format a percentage change, keeping the sign, e.g. -3.42 -> "-3.42%"
 */
function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

module.exports = { formatCurrency, formatNumber, formatPercent };
