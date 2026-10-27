const Invoice = require('../models/Invoice');
const Contact = require('../models/Contact');
const { calculateTotals, generateInvoiceNumber } = require('../services/invoice.service');

// Helper to find or create / update contact from customerSnapshot
const syncContactFromCustomer = async (userId, contactId, customerSnapshot = {}) => {
  const name = (customerSnapshot.name || customerSnapshot.company || '').trim();
  const email = (customerSnapshot.email || '').trim().toLowerCase();
  const company = (customerSnapshot.company || '').trim();
  const phone = (customerSnapshot.phone || '').trim();
  const address = (customerSnapshot.address || '').trim();
  const city = (customerSnapshot.city || '').trim();
  const state = (customerSnapshot.state || '').trim();
  const postalCode = (customerSnapshot.postalCode || '').trim();
  const country = (customerSnapshot.country || '').trim();
  const taxId = (customerSnapshot.taxId || '').trim();
  const logo = (customerSnapshot.logo || '').trim();

  // If no name and no email, nothing to save
  if (!name && !email) return contactId || null;

  let contact = null;

  if (contactId) {
    contact = await Contact.findOne({ _id: contactId, userId });
  }

  if (!contact && email) {
    contact = await Contact.findOne({ userId, email });
  }

  if (!contact && name) {
    contact = await Contact.findOne({
      userId,
      name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
  }

  if (contact) {
    // Update missing or newly provided details
    let modified = false;
    if (name && contact.name !== name) { contact.name = name; modified = true; }
    if (email && !contact.email) { contact.email = email; modified = true; }
    if (company && !contact.company) { contact.company = company; modified = true; }
    if (phone && !contact.phone) { contact.phone = phone; modified = true; }
    if (address && !contact.address) { contact.address = address; modified = true; }
    if (city && !contact.city) { contact.city = city; modified = true; }
    if (state && !contact.state) { contact.state = state; modified = true; }
    if (postalCode && !contact.postalCode) { contact.postalCode = postalCode; modified = true; }
    if (country && !contact.country) { contact.country = country; modified = true; }
    if (taxId && !contact.taxId) { contact.taxId = taxId; modified = true; }
    if (logo && !contact.logo) { contact.logo = logo; modified = true; }
    if (modified) await contact.save();
    return contact._id;
  }

  // Auto-create new contact
  const newContact = await Contact.create({
    userId,
    name: name || email,
    email,
    company,
    phone,
    address,
    city,
    state,
    postalCode,
    country,
    taxId,
    logo,
  });

  return newContact._id;
};

// GET /api/invoices
const getInvoices = async (req, res, next) => {
  try {
    const { status, search = '', page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const userId = req.user._id;

    const filter = { userId };
    if (status && ['draft', 'unpaid', 'paid', 'void'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: search, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get counts per status
    const counts = await Invoice.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = { draft: 0, unpaid: 0, paid: 0, void: 0 };
    counts.forEach((c) => { statusCounts[c._id] = c.count; });

    return res.json({ success: true, data: invoices, total, page: parseInt(page), limit: parseInt(limit), statusCounts });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/:id
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// POST /api/invoices
const createInvoice = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      invoiceNumber,
      contactId,
      customerSnapshot,
      senderSnapshot,
      issueDate,
      dueDate,
      repeatFrequency,
      currency,
      items,
      notes,
      discountType,
      discountValue,
      taxType,
      taxRate,
      status,
      payoutMethod,
    } = req.body;

    // Generate invoice number if not provided
    const finalInvoiceNumber = invoiceNumber || (await generateInvoiceNumber(userId));

    // Auto-save or link customer to Contact table
    const finalContactId = await syncContactFromCustomer(userId, contactId, customerSnapshot);

    // Server-side recalculation
    const { items: calcItems, subtotal, discountAmount, taxAmount, total } = calculateTotals(
      items, discountType, discountValue, taxType, taxRate
    );

    const invoice = await Invoice.create({
      userId,
      invoiceNumber: finalInvoiceNumber,
      contactId: finalContactId || null,
      customerSnapshot: customerSnapshot || {},
      senderSnapshot: senderSnapshot || {},
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
      repeatFrequency: repeatFrequency || 'never',
      currency: currency || 'USD',
      items: calcItems,
      notes: notes || '',
      discountType: discountType || 'none',
      discountValue: parseFloat(discountValue) || 0,
      taxType: taxType || 'none',
      taxRate: parseFloat(taxRate) || 0,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      status: status || 'draft',
      payoutMethod: payoutMethod || {},
    });

    return res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/invoices/:id
const updateInvoice = async (req, res, next) => {
  try {
    const existing = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const {
      invoiceNumber,
      contactId,
      customerSnapshot,
      senderSnapshot,
      issueDate,
      dueDate,
      repeatFrequency,
      currency,
      items,
      notes,
      discountType,
      discountValue,
      taxType,
      taxRate,
      status,
      payoutMethod,
    } = req.body;

    // Sync or update Contact if customer details provided
    let finalContactId = contactId;
    if (customerSnapshot !== undefined || contactId !== undefined) {
      finalContactId = await syncContactFromCustomer(
        req.user._id,
        contactId ?? existing.contactId,
        customerSnapshot ?? existing.customerSnapshot
      );
    }

    const { items: calcItems, subtotal, discountAmount, taxAmount, total } = calculateTotals(
      items ?? existing.items,
      discountType ?? existing.discountType,
      discountValue ?? existing.discountValue,
      taxType ?? existing.taxType,
      taxRate ?? existing.taxRate
    );

    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(finalContactId !== undefined && { contactId: finalContactId || null }),
        ...(customerSnapshot !== undefined && { customerSnapshot }),
        ...(senderSnapshot !== undefined && { senderSnapshot }),
        ...(issueDate !== undefined && { issueDate: new Date(issueDate) }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(repeatFrequency !== undefined && { repeatFrequency }),
        ...(currency !== undefined && { currency }),
        ...(items !== undefined && { items: calcItems }),
        ...(notes !== undefined && { notes }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) || 0 }),
        ...(taxType !== undefined && { taxType }),
        ...(taxRate !== undefined && { taxRate: parseFloat(taxRate) || 0 }),
        subtotal, discountAmount, taxAmount, total,
        ...(status !== undefined && { status }),
        ...(payoutMethod !== undefined && { payoutMethod }),
      },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.json({ success: true, message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/invoices/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['draft', 'unpaid', 'paid', 'void'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    return res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

// GET /api/invoices/next-number
const getNextNumber = async (req, res, next) => {
  try {
    const number = await generateInvoiceNumber(req.user._id);
    return res.json({ success: true, data: { invoiceNumber: number } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, updateStatus, getNextNumber };
