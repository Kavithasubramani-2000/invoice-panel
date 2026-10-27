const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: [0.001, 'Quantity must be positive'] },
  unitPrice: { type: Number, required: true, min: [0, 'Unit price cannot be negative'] },
  amount: { type: Number, required: true },
}, { _id: false });

const customerSnapshotSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  taxId: { type: String, default: '' },
  logo: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  country: { type: String, default: '' },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true,
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null,
  },
  customerSnapshot: {
    type: customerSnapshotSchema,
    default: () => ({}),
  },
  senderSnapshot: {
    type: customerSnapshotSchema,
    default: () => ({}),
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  repeatFrequency: {
    type: String,
    enum: ['never', 'weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'never',
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    trim: true,
  },
  items: {
    type: [lineItemSchema],
    default: [],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['none', 'percentage', 'fixed'],
    default: 'none',
  },
  discountValue: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0,
  },
  taxType: {
    type: String,
    enum: ['none', 'percentage'],
    default: 'none',
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0,
  },
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'unpaid', 'paid', 'void'],
    default: 'draft',
  },
  payoutMethod: {
    methodType: { type: String, enum: ['bank', 'crypto'], default: 'bank' },
    country: { type: String, default: 'India' },
    currency: { type: String, default: 'INR' },
    transferType: { type: String, default: 'NEFT' },
    accountNumber: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    accountHolderName: { type: String, default: '' },
    nickname: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

// Unique invoice number per user
invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
