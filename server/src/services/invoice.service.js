/**
 * Invoice service: server-side calculations for monetary values.
 * Never trust frontend-calculated totals.
 */

/**
 * Round to 2 decimal places safely.
 */
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Calculate invoice totals from raw input.
 * @param {Array} items - Line items from request
 * @param {string} discountType - 'none' | 'percentage' | 'fixed'
 * @param {number} discountValue
 * @param {string} taxType - 'none' | 'percentage'
 * @param {number} taxRate
 * @returns {{ items, subtotal, discountAmount, taxAmount, total }}
 */
const calculateTotals = (items = [], discountType = 'none', discountValue = 0, taxType = 'none', taxRate = 0) => {
  // Recalculate each line item amount
  const calculatedItems = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return {
      description: item.description || '',
      quantity: qty,
      unitPrice: price,
      amount: round2(qty * price),
    };
  });

  const subtotal = round2(calculatedItems.reduce((sum, item) => sum + item.amount, 0));

  let discountAmount = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(parseFloat(discountValue) || 0, 100);
    discountAmount = round2(subtotal * (pct / 100));
  } else if (discountType === 'fixed') {
    discountAmount = round2(Math.min(parseFloat(discountValue) || 0, subtotal));
  }

  const afterDiscount = round2(subtotal - discountAmount);

  let taxAmount = 0;
  if (taxType === 'percentage') {
    const rate = Math.min(parseFloat(taxRate) || 0, 100);
    taxAmount = round2(afterDiscount * (rate / 100));
  }

  const total = round2(afterDiscount + taxAmount);

  return { items: calculatedItems, subtotal, discountAmount, taxAmount, total };
};

/**
 * Generate a unique invoice number for a user.
 * Format: INV-YYYY-NNNN (auto-incrementing per user)
 */
const generateInvoiceNumber = async (userId) => {
  const Invoice = require('../models/Invoice');
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Find the highest invoice number for this user in this year
  const lastInvoice = await Invoice.findOne(
    { userId, invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
  );

  let next = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) next = lastNum + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
};

module.exports = { calculateTotals, generateInvoiceNumber };
