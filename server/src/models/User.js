const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const appearanceSettingsSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
  primaryColor: { type: String, default: '#2563eb' },
  selectionColor: { type: String, default: '#3b82f6' },
  mainTextColor: { type: String, default: '#111827' },
  secondaryTextColor: { type: String, default: '#6b7280' },
  borderColor: { type: String, default: '#e5e7eb' },
  invoiceBgColor: { type: String, default: '#ffffff' },
  fontFamily: { type: String, default: 'Inter' },
  fontSize: { type: String, default: '14px' },
  headingFontSize: { type: String, default: '24px' },
  bodyFontSize: { type: String, default: '14px' },
  fontWeight: { type: String, default: '400' },
  headingFontWeight: { type: String, default: '700' },
  secondaryFontWeight: { type: String, default: '400' },
  lineHeight: { type: String, default: '1.6' },
  pagePadding: { type: String, default: '32px' },
  sectionPadding: { type: String, default: '24px' },
  horizontalSpacing: { type: String, default: '24px' },
  verticalSpacing: { type: String, default: '16px' },
  tableRowSpacing: { type: String, default: '12px' },
  inputHeight: { type: String, default: '40px' },
  borderRadius: { type: String, default: '8px' },
  previewWidth: { type: String, default: '480px' },
  sidebarWidth: { type: String, default: '220px' },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name must be at most 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
  },
  passwordHash: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    default: '',
  },
  taxId: {
    type: String,
    trim: true,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  appearanceSettings: {
    type: appearanceSettingsSchema,
    default: () => ({}),
  },
}, {
  timestamps: true,
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function () {
  const { _id, name, email, company, address, taxId, logo, appearanceSettings, createdAt, updatedAt } = this;
  return { _id, name, email, company: company || '', address: address || '', taxId: taxId || '', logo: logo || '', appearanceSettings, createdAt, updatedAt };
};

module.exports = mongoose.model('User', userSchema);
