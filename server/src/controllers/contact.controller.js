const Contact = require('../models/Contact');
const Invoice = require('../models/Invoice');

// Helper to auto-sync existing invoices with customer snapshots into Contact table
const syncInvoicesToContacts = async (userId) => {
  try {
    const unlinkedInvoices = await Invoice.find({
      userId,
      $or: [
        { contactId: null },
        { contactId: { $exists: false } },
      ],
      $and: [
        {
          $or: [
            { 'customerSnapshot.name': { $exists: true, $ne: '' } },
            { 'customerSnapshot.email': { $exists: true, $ne: '' } },
            { 'customerSnapshot.company': { $exists: true, $ne: '' } },
          ],
        },
      ],
    });

    for (const inv of unlinkedInvoices) {
      const snap = inv.customerSnapshot || {};
      const name = (snap.name || snap.company || '').trim();
      const email = (snap.email || '').trim().toLowerCase();
      if (!name && !email) continue;

      let contact = null;
      if (email) {
        contact = await Contact.findOne({ userId, email });
      }
      if (!contact && name) {
        contact = await Contact.findOne({
          userId,
          name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        });
      }

      if (!contact) {
        contact = await Contact.create({
          userId,
          name: name || email,
          email: email || '',
          company: snap.company || '',
          phone: snap.phone || '',
          address: snap.address || '',
          city: snap.city || '',
          state: snap.state || '',
          postalCode: snap.postalCode || '',
          country: snap.country || '',
          taxId: snap.taxId || '',
          logo: snap.logo || '',
        });
      }
      inv.contactId = contact._id;
      await inv.save();
    }
  } catch (err) {
    console.error('Error syncing unlinked invoices to contacts:', err);
  }
};

// GET /api/contacts
const getContacts = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 50, sort = 'name' } = req.query;
    const userId = req.user._id;

    // Auto-sync any invoices that have customerSnapshot info
    await syncInvoicesToContacts(userId);

    const filter = { userId };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const rawContacts = await Contact.find(filter).lean();
    const allInvoices = await Invoice.find({ userId })
      .sort({ issueDate: -1, createdAt: -1 })
      .lean();

    // Attach stats to each contact
    let contactsWithStats = rawContacts.map((contact) => {
      const cidStr = contact._id.toString();
      const cEmail = (contact.email || '').toLowerCase().trim();
      const cName = (contact.name || '').toLowerCase().trim();

      const matchedInvoices = allInvoices.filter((inv) => {
        if (inv.contactId && inv.contactId.toString() === cidStr) return true;
        if (cEmail && inv.customerSnapshot?.email?.toLowerCase().trim() === cEmail) return true;
        if (cName && (inv.customerSnapshot?.name?.toLowerCase().trim() === cName || inv.customerSnapshot?.company?.toLowerCase().trim() === cName)) return true;
        return false;
      });

      const lifetimeValue = matchedInvoices
        .filter((i) => i.status !== 'void')
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

      const outstanding = matchedInvoices
        .filter((i) => i.status === 'unpaid')
        .reduce((sum, i) => sum + (Number(i.total) || 0), 0);

      const lastInv = matchedInvoices[0] || null;

      return {
        ...contact,
        lifetimeValue,
        outstanding,
        lastInvoice: lastInv
          ? {
              _id: lastInv._id,
              invoiceNumber: lastInv.invoiceNumber,
              issueDate: lastInv.issueDate,
              total: lastInv.total,
              status: lastInv.status,
            }
          : null,
        invoiceCount: matchedInvoices.length,
      };
    });

    // Sorting
    if (sort === 'lastInvoice' || sort === '-lastInvoice') {
      const dir = sort.startsWith('-') ? -1 : 1;
      contactsWithStats.sort((a, b) => {
        const dateA = a.lastInvoice ? new Date(a.lastInvoice.issueDate).getTime() : 0;
        const dateB = b.lastInvoice ? new Date(b.lastInvoice.issueDate).getTime() : 0;
        return dir * (dateB - dateA);
      });
    } else if (sort === 'lifetimeValue' || sort === '-lifetimeValue') {
      const dir = sort.startsWith('-') ? -1 : 1;
      contactsWithStats.sort((a, b) => dir * (b.lifetimeValue - a.lifetimeValue));
    } else if (sort === 'outstanding' || sort === '-outstanding') {
      const dir = sort.startsWith('-') ? -1 : 1;
      contactsWithStats.sort((a, b) => dir * (b.outstanding - a.outstanding));
    } else {
      contactsWithStats.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    const total = contactsWithStats.length;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = contactsWithStats.slice(startIndex, startIndex + parseInt(limit));

    return res.json({ success: true, data: paginated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/contacts/:id
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    return res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// POST /api/contacts
const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, city, state, postalCode, country, taxId, notes, logo } = req.body;
    const contact = await Contact.create({
      userId: req.user._id,
      name, email, phone, company, address, city, state, postalCode, country, taxId, notes, logo,
    });
    return res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/contacts/:id
const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, city, state, postalCode, country, taxId, notes, logo } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, email, phone, company, address, city, state, postalCode, country, taxId, notes, ...(logo !== undefined && { logo }) },
      { new: true, runValidators: true }
    );
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    return res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contacts/:id
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!contact) return res.status(404).json({ success: false, message: 'Contact not found' });
    return res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContacts, getContact, createContact, updateContact, deleteContact };
