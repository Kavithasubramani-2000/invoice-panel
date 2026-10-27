import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  IconButton,
  Autocomplete,
  Collapse,
  Menu,
  MenuItem,
  Select,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AccountBalance as BankIcon,
  AccountBalanceWalletOutlined as CryptoIcon,
  ChevronLeft as ChevronLeftIcon,
  InfoOutlined as InfoIcon,
  CalendarTodayOutlined as CalendarIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { createInvoice, updateInvoice, getNextInvoiceNumber } from '../../api/invoices.api';
import { getContacts, createContact } from '../../api/contacts.api';
import { useAuth } from '../../context/AuthContext';
import InvoicePreview from './InvoicePreview';

const CURRENCIES = [
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  { code: 'INR', symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'CAD', symbol: '$', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', flag: '🇦🇺', name: 'Australian Dollar' },
];

const defaultValues = {
  invoiceNumber: '',
  contactId: null,
  customerSnapshot: {
    name: '',
    company: '',
    email: '',
    taxId: '',
    address: '',
    logo: '',
  },
  senderSnapshot: {
    name: '',
    company: '',
    email: '',
    address: '',
    taxId: '',
    logo: '',
  },
  issueDate: dayjs().format('YYYY-MM-DD'),
  dueDate: dayjs().add(14, 'day').format('YYYY-MM-DD'),
  repeatFrequency: 'never',
  currency: 'USD',
  items: [
    { description: '', quantity: 1, unitPrice: 0 },
  ],
  notes: '',
  discountValue: 0,
  payoutMethod: {
    methodType: 'bank',
    country: 'India',
    currency: 'INR',
    transferType: 'NEFT',
    accountNumber: '',
    ifsc: '',
    accountHolderName: '',
    nickname: '',
  },
};

const InvoiceForm = ({ onClose, onSaved, editInvoice = null }) => {
  const { user } = useAuth();
  // Steps:
  // 0: Company
  // 1: Who's this invoice for?
  // 2: Details
  // 3: Payment details (Add a payout method)
  const [step, setStep] = useState(0);
  const [companyDetailsOpen, setCompanyDetailsOpen] = useState(true);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(true);
  const [currencyAnchor, setCurrencyAnchor] = useState(null);
  const [payoutTab, setPayoutTab] = useState('NEFT');
  const [payoutMethodType, setPayoutMethodType] = useState('bank');
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const senderInitialInfo = {
    name: user?.name || '',
    company: user?.company || user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
    taxId: user?.taxId || '',
    logo: user?.logo || '',
  };

  const { register, watch, setValue, reset } = useForm({
    defaultValues: editInvoice
      ? {
          ...defaultValues,
          ...editInvoice,
          issueDate: editInvoice.issueDate ? dayjs(editInvoice.issueDate).format('YYYY-MM-DD') : defaultValues.issueDate,
          dueDate: editInvoice.dueDate ? dayjs(editInvoice.dueDate).format('YYYY-MM-DD') : defaultValues.dueDate,
        }
      : {
          ...defaultValues,
          senderSnapshot: senderInitialInfo,
        },
  });

  const formData = watch();

  const loadContacts = useCallback(async (search = '') => {
    try {
      const res = await getContacts({ search, limit: 50 });
      setContacts(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    if (!editInvoice) {
      reset({
        ...defaultValues,
        senderSnapshot: senderInitialInfo,
      });
      getNextInvoiceNumber()
        .then((res) => {
          setValue('invoiceNumber', res.data.data.invoiceNumber || '000001');
        })
        .catch(() => {
          setValue('invoiceNumber', '000001');
        });
    }
    loadContacts();
  }, [editInvoice, reset, setValue, loadContacts]);

  const handleContactSelect = (contact) => {
    if (!contact) {
      setValue('contactId', null);
      setValue('customerSnapshot', { name: '', email: '', company: '', address: '', taxId: '', logo: '' });
      return;
    }
    setValue('contactId', contact._id);
    setValue('customerSnapshot', {
      name: contact.name || '',
      email: contact.email || '',
      company: contact.company || contact.name || '',
      address: contact.address || '',
      taxId: contact.taxId || '',
      logo: contact.logo || '',
    });
  };

  const handleCreateContactInline = async (name) => {
    if (!name.trim()) return;
    try {
      const res = await createContact({ name: name.trim() });
      const created = res.data.data;
      setContacts((prev) => [...prev, created]);
      handleContactSelect(created);
    } catch (e) {
      console.error(e);
    }
  };

  // Line item helpers
  const items = formData.items || [];
  const handleAddItem = () => {
    setValue('items', [...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    setValue('items', updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setValue('items', updated);
  };

  // Section highlight mapping
  const stepToSection = ['company', 'customer', 'details', 'payout', 'terms'];
  const activeSection = stepToSection[step] || 'company';

  const onSectionClick = (section) => {
    const targetStep = stepToSection.indexOf(section);
    if (targetStep !== -1) setStep(targetStep);
  };

  const handleSave = async (status = 'draft') => {
    setLoading(true);
    try {
      const custName = (contactSearch || formData.customerSnapshot?.name || formData.customerSnapshot?.company || '').trim();
      const updatedCustomerSnapshot = {
        ...formData.customerSnapshot,
        name: custName || formData.customerSnapshot?.name || '',
        company: formData.customerSnapshot?.company || custName || '',
      };
      const payload = {
        ...formData,
        customerSnapshot: updatedCustomerSnapshot,
        status,
        discountType: formData.discountValue > 0 ? 'fixed' : 'none',
      };
      if (editInvoice) {
        await updateInvoice(editInvoice._id, payload);
      } else {
        await createInvoice(payload);
      }
      setSnack({ open: true, msg: 'Invoice saved successfully!', severity: 'success' });
      setTimeout(() => {
        onSaved?.();
        onClose?.();
      }, 700);
    } catch (e) {
      setSnack({
        open: true,
        msg: e.response?.data?.message || 'Failed to save invoice',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === formData.currency) || CURRENCIES[0];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        borderTopLeftRadius: { xs: 0, md: 24 },
        position: 'relative',
      }}
    >
      {/* ======================================================== */}
      {/* LEFT PANEL: Form Wizard Steps (Width ~46%) */}
      {/* ======================================================== */}
      <Box
        sx={{
          width: { xs: '100%', md: '46%' },
          maxWidth: 520,
          height: '100%',
          bgcolor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #f1f5f9',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}
      >
        {/* Top Header Row with 'Create invoice' + Close 'X' */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            pt: 3.5,
            pb: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#18181b' }}>
            Create invoice
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#71717a', '&:hover': { color: '#18181b' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Form Scrollable Area */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 4, py: 2 }}>
          {/* ========================================== */}
          {/* STEP 0: Company (Matching Image 1) */}
          {/* ========================================== */}
          {step === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#18181b', mb: 0.5 }}>
                Company
              </Typography>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Company
                </Typography>
                <TextField
                  {...register('senderSnapshot.company')}
                  fullWidth
                  size="small"
                  placeholder="Enter your company name"
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextField
                  {...register('senderSnapshot.email')}
                  fullWidth
                  size="small"
                  placeholder="billing@yourdomain.com"
                  InputProps={{
                    endAdornment: <ExpandMoreIcon sx={{ color: '#a1a1aa', fontSize: 20 }} />,
                  }}
                />
              </Box>

              {/* Collapsible 'Additional details' */}
              <Box>
                <Box
                  onClick={() => setCompanyDetailsOpen(!companyDetailsOpen)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: '#71717a',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    py: 0.5,
                    '&:hover': { color: '#18181b' },
                  }}
                >
                  <span>Additional details</span>
                  {companyDetailsOpen ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </Box>

                <Collapse in={companyDetailsOpen}>
                  <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Address
                      </Typography>
                      <TextField
                        {...register('senderSnapshot.address')}
                        fullWidth
                        size="small"
                        placeholder="Search for an address or enter street..."
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Tax ID
                      </Typography>
                      <TextField
                        {...register('senderSnapshot.taxId')}
                        fullWidth
                        size="small"
                        placeholder="Enter tax ID..."
                      />
                    </Box>

                    {/* Logo upload field (Matching Image 1) */}
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Logo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {formData.senderSnapshot?.logo ? (
                          <Box
                            component="img"
                            src={formData.senderSnapshot.logo}
                            alt="Company Logo"
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              border: '1px solid #e2e8f0',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.5,
                              border: '1px dashed #cbd5e1',
                              backgroundImage: 'radial-gradient(#93c5fd 1.2px, transparent 1.2px)',
                              backgroundSize: '5px 5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          />
                        )}

                        {formData.senderSnapshot?.logo && (
                          <Typography
                            onClick={() => setValue('senderSnapshot.logo', '')}
                            sx={{
                              fontSize: '0.8125rem',
                              color: '#71717a',
                              cursor: 'pointer',
                              '&:hover': { color: '#ef4444' },
                            }}
                          >
                            Remove
                          </Typography>
                        )}

                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          sx={{
                            borderRadius: 2,
                            py: 0.4,
                            px: 1.75,
                            fontSize: '0.8125rem',
                            borderColor: '#18181b',
                            color: '#18181b',
                            textTransform: 'none',
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#18181b',
                              bgcolor: '#f4f4f5',
                            },
                          }}
                        >
                          {formData.senderSnapshot?.logo ? 'Replace' : 'Upload'}
                          <input
                            type="file"
                            hidden
                            accept="image/png, image/jpeg, image/jpg, image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = () => {
                                setValue('senderSnapshot.logo', reader.result);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </Button>

                        {!formData.senderSnapshot?.logo && (
                          <Typography sx={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            PNG or JPEG
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          )}

          {/* ========================================== */}
          {/* STEP 1: Who's this invoice for? (Matching Image 2) */}
          {/* ========================================== */}
          {step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#18181b', mb: 0.5 }}>
                Who's this invoice for?
              </Typography>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Name
                </Typography>
                <Autocomplete
                  options={contacts}
                  freeSolo
                  getOptionLabel={(o) => (typeof o === 'string' ? o : o.name || o.company || '')}
                  value={contacts.find((c) => c._id === formData.contactId) || (formData.customerSnapshot?.company || formData.customerSnapshot?.name ? (formData.customerSnapshot.company || formData.customerSnapshot.name) : null)}
                  onChange={(_, val) => {
                    if (typeof val === 'string') {
                      setValue('customerSnapshot.name', val);
                      setValue('customerSnapshot.company', val);
                      handleCreateContactInline(val);
                    } else if (val) {
                      handleContactSelect(val);
                    } else {
                      handleContactSelect(null);
                    }
                  }}
                  onInputChange={(_, val, reason) => {
                    setContactSearch(val);
                    if (reason === 'input') {
                      setValue('customerSnapshot.name', val);
                      setValue('customerSnapshot.company', val);
                    }
                  }}
                  inputValue={contactSearch}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search or enter customer name"
                      fullWidth
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: <ExpandMoreIcon sx={{ color: '#a1a1aa', fontSize: 20 }} />,
                      }}
                    />
                  )}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Email
                </Typography>
                <TextField
                  {...register('customerSnapshot.email')}
                  fullWidth
                  size="small"
                  placeholder="customer@domain.com"
                />
              </Box>

              {/* Collapsible 'Additional details' */}
              <Box>
                <Box
                  onClick={() => setCustomerDetailsOpen(!customerDetailsOpen)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    color: '#71717a',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    py: 0.5,
                    '&:hover': { color: '#18181b' },
                  }}
                >
                  <span>Additional details</span>
                  {customerDetailsOpen ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </Box>

                <Collapse in={customerDetailsOpen}>
                  <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Address
                      </Typography>
                      <TextField
                        {...register('customerSnapshot.address')}
                        fullWidth
                        size="small"
                        placeholder="Search for an address or enter street..."
                      />
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Tax ID
                      </Typography>
                      <TextField
                        {...register('customerSnapshot.taxId')}
                        fullWidth
                        size="small"
                        placeholder="e.g. TAX-12345678"
                      />
                    </Box>

                    {/* Logo field with thumbnail + Remove / Replace (Matching Image 2) */}
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                        Logo
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {formData.customerSnapshot?.logo ? (
                          <Box
                            component="img"
                            src={formData.customerSnapshot.logo}
                            alt="Logo"
                            sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: '#f4f4f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8125rem',
                              fontWeight: 600,
                              color: '#71717a',
                            }}
                          >
                            {(formData.customerSnapshot?.company || formData.customerSnapshot?.name || 'C').charAt(0).toUpperCase()}
                          </Box>
                        )}
                        {formData.customerSnapshot?.logo && (
                          <Typography
                            onClick={() => setValue('customerSnapshot.logo', '')}
                            sx={{
                              fontSize: '0.8125rem',
                              color: '#71717a',
                              cursor: 'pointer',
                              '&:hover': { color: '#ef4444' },
                            }}
                          >
                            Remove
                          </Typography>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          component="label"
                          sx={{
                            borderRadius: 2,
                            py: 0.4,
                            px: 1.5,
                            fontSize: '0.8125rem',
                            borderColor: '#e5e7eb',
                            color: '#18181b',
                            textTransform: 'none',
                          }}
                        >
                          {formData.customerSnapshot?.logo ? 'Replace' : 'Upload'}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => setValue('customerSnapshot.logo', reader.result);
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          )}

          {/* ========================================== */}
          {/* STEP 2: Details (Matching Image 3) */}
          {/* ========================================== */}
          {step === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Header with Title + Currency Picker */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#18181b' }}>
                  Details
                </Typography>

                {/* Currency Badge */}
                <Button
                  onClick={(e) => setCurrencyAnchor(e.currentTarget)}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: '#e5e7eb',
                    color: '#18181b',
                    px: 1.25,
                    py: 0.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    bgcolor: '#ffffff',
                    '&:hover': { bgcolor: '#f9fafb' },
                  }}
                >
                  <span>{currentCurrency.flag}</span>
                  <span style={{ fontWeight: 600 }}>{currentCurrency.code}</span>
                  <ExpandMoreIcon sx={{ fontSize: 16, color: '#71717a' }} />
                </Button>

                <Menu
                  anchorEl={currencyAnchor}
                  open={Boolean(currencyAnchor)}
                  onClose={() => setCurrencyAnchor(null)}
                >
                  {CURRENCIES.map((c) => (
                    <MenuItem
                      key={c.code}
                      onClick={() => {
                        setValue('currency', c.code);
                        setCurrencyAnchor(null);
                      }}
                      sx={{ fontSize: '0.875rem', gap: 1 }}
                    >
                      <span>{c.flag}</span>
                      <span>{c.code}</span>
                      <span style={{ color: '#71717a', fontSize: '0.75rem' }}>({c.name})</span>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Items Table Input Rows */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {/* Row headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 75px 95px 36px', gap: 1, px: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', fontWeight: 500 }}>
                    Item
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', fontWeight: 500 }}>
                    Qty
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', fontWeight: 500 }}>
                    Price
                  </Typography>
                  <Box />
                </Box>

                {/* Row fields */}
                {items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 75px 95px 36px',
                      gap: 1,
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 'any' }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 'any' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                ))}

                {/* + add item button */}
                <Button
                  onClick={handleAddItem}
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    py: 0.85,
                    color: '#18181b',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    textTransform: 'lowercase',
                    mt: 0.5,
                    '&:hover': { bgcolor: '#f9fafb', borderColor: '#d4d4d8' },
                  }}
                >
                  add item
                </Button>
              </Box>

              {/* Note Field */}
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Note
                </Typography>
                <TextField
                  {...register('notes')}
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Add payment terms, notes, or instructions..."
                />
              </Box>

              {/* Discount Field */}
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Discount
                </Typography>
                <TextField
                  {...register('discountValue', { valueAsNumber: true })}
                  type="number"
                  fullWidth
                  size="small"
                  placeholder="1"
                  inputProps={{ min: 0, step: 'any' }}
                />
              </Box>
            </Box>
          )}

          {/* ========================================== */}
          {/* STEP 3: Add a payout method (Matching Image 4 & 5) */}
          {/* ========================================== */}
          {step === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              {/* Top back link: < Payment details */}
              <Box
                onClick={() => setStep(2)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  color: '#71717a',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  '&:hover': { color: '#18181b' },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: 16 }} />
                <span>Payment details</span>
              </Box>

              <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, color: '#18181b' }}>
                Add a payout method
              </Typography>

              {/* Method Cards: Bank account vs Crypto wallet */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {/* Bank Account Card */}
                <Box
                  onClick={() => setPayoutMethodType('bank')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: payoutMethodType === 'bank' ? '2px solid #0084ff' : '1px solid #e5e7eb',
                    bgcolor: payoutMethodType === 'bank' ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <BankIcon sx={{ color: payoutMethodType === 'bank' ? '#0084ff' : '#71717a', fontSize: 24, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b' }}>
                    Bank account
                  </Typography>
                </Box>

                {/* Crypto Wallet Card */}
                <Box
                  onClick={() => setPayoutMethodType('crypto')}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    border: payoutMethodType === 'crypto' ? '2px solid #0084ff' : '1px solid #e5e7eb',
                    bgcolor: payoutMethodType === 'crypto' ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <CryptoIcon sx={{ color: payoutMethodType === 'crypto' ? '#0084ff' : '#71717a', fontSize: 24, mb: 1 }} />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#18181b' }}>
                    Crypto wallet
                  </Typography>
                </Box>
              </Box>

              {/* Country & Currency Pickers */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                    Country
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      color: '#18181b',
                    }}
                  >
                    <span>🇮🇳</span>
                    <span style={{ fontWeight: 500 }}>India</span>
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                    Currency
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid #e5e7eb',
                      fontSize: '0.875rem',
                      color: '#18181b',
                    }}
                  >
                    <span>🇮🇳</span>
                    <span style={{ fontWeight: 500 }}>INR</span>
                  </Box>
                </Box>
              </Box>

              {/* Transfer Type Selector: NEFT vs SWIFT */}
              <Box
                sx={{
                  display: 'flex',
                  p: 0.5,
                  borderRadius: 2.5,
                  bgcolor: '#f4f4f5',
                  gap: 1,
                }}
              >
                <Button
                  onClick={() => setPayoutTab('NEFT')}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: payoutTab === 'NEFT' ? '#ffffff' : 'transparent',
                    color: '#18181b',
                    boxShadow: payoutTab === 'NEFT' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  NEFT
                </Button>
                <Button
                  onClick={() => setPayoutTab('SWIFT')}
                  sx={{
                    flex: 1,
                    py: 0.75,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: payoutTab === 'SWIFT' ? '#ffffff' : 'transparent',
                    color: payoutTab === 'SWIFT' ? '#18181b' : '#71717a',
                    boxShadow: payoutTab === 'SWIFT' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <InfoIcon sx={{ fontSize: 16, mr: 0.5, color: '#9ca3af' }} /> SWIFT
                </Button>
              </Box>

              {/* Bank Inputs (Matching Image 4 & 5) */}
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Account number
                </Typography>
                <TextField
                  {...register('payoutMethod.accountNumber')}
                  fullWidth
                  size="small"
                  placeholder="Account number"
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  IFSC
                </Typography>
                <TextField
                  {...register('payoutMethod.ifsc')}
                  fullWidth
                  size="small"
                  placeholder="IFSC"
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Account holder name
                </Typography>
                <TextField
                  {...register('payoutMethod.accountHolderName')}
                  fullWidth
                  size="small"
                  placeholder="Account holder name"
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Nickname
                </Typography>
                <TextField
                  {...register('payoutMethod.nickname')}
                  fullWidth
                  size="small"
                  placeholder="e.g, Business checking"
                />
              </Box>

              {/* Inside Cancel / Add buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
                <Button
                  size="small"
                  onClick={() => setStep(2)}
                  sx={{ color: '#71717a', textTransform: 'none', fontSize: '0.875rem' }}
                >
                  Cancel
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSave('unpaid')}
                  sx={{
                    bgcolor: '#f4f4f5',
                    color: '#a1a1aa',
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 2.25,
                    '&:hover': { bgcolor: '#18181b', color: '#ffffff' },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          )}

          {/* ========================================== */}
          {/* STEP 4: Terms (Matching Screenshot) */}
          {/* ========================================== */}
          {step === 4 && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                sx={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#18181b',
                  mb: 3,
                }}
              >
                Terms
              </Typography>

              {/* Invoice Number */}
              <Box sx={{ mb: 2.75 }}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Invoice number
                </Typography>
                <TextField
                  {...register('invoiceNumber')}
                  fullWidth
                  size="small"
                  placeholder="000001"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    '& input': { fontSize: '0.875rem' },
                  }}
                />
              </Box>

              {/* Issue Date & Due Date Row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.75 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                    Issue date
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={formData.issueDate || ''}
                    onChange={(e) => setValue('issueDate', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ color: '#a1a1aa', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& input': { fontSize: '0.875rem' },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                    Due date
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={formData.dueDate || ''}
                    onChange={(e) => setValue('dueDate', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon sx={{ color: '#a1a1aa', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      '& input': { fontSize: '0.875rem' },
                    }}
                  />
                </Box>
              </Box>

              {/* Repeats */}
              <Box sx={{ mb: 2.75 }}>
                <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.75, fontWeight: 500 }}>
                  Repeats
                </Typography>
                <Select
                  value={formData.repeatFrequency || 'never'}
                  onChange={(e) => setValue('repeatFrequency', e.target.value)}
                  fullWidth
                  size="small"
                  IconComponent={ExpandMoreIcon}
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    color: '#18181b',
                    '& .MuiSelect-select': { py: 1.1 },
                  }}
                >
                  <MenuItem value="never">Never</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom Action Bar (Matching All Images) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            py: 2.5,
            borderTop: '1px solid #f4f4f5',
            mt: 'auto',
          }}
        >
          {/* Left Save Draft Button */}
          <Button
            onClick={() => handleSave('draft')}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 2.25,
              py: 0.85,
              borderColor: '#e5e7eb',
              color: '#18181b',
              fontWeight: 500,
              fontSize: '0.875rem',
              textTransform: 'none',
              bgcolor: '#ffffff',
              '&:hover': { bgcolor: '#f4f4f5' },
            }}
          >
            Save draft
          </Button>

          {/* Right Navigation Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {step > 0 && (
              <Button
                onClick={() => setStep((s) => s - 1)}
                sx={{
                  color: '#18181b',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                }}
              >
                Back
              </Button>
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 2.75,
                  py: 0.85,
                  bgcolor: '#18181b',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#27272a' },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => handleSave('unpaid')}
                disabled={loading}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 2.75,
                  py: 0.85,
                  bgcolor: '#18181b',
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#27272a' },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Live Paper Preview on Dotted Canvas (Width ~54%) */}
      {/* ======================================================== */}
      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          overflowY: 'auto',
          bgcolor: '#f8f9fa',
          backgroundImage: 'radial-gradient(#d1d5db 1.2px, transparent 1.2px)',
          backgroundSize: '16px 16px',
          p: { xs: 2, md: 4.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Close 'X' at top right of canvas (matching All Images) */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton onClick={onClose} size="small" sx={{ color: '#9ca3af', '&:hover': { color: '#18181b' } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 540 }}>
          <InvoicePreview
            data={formData}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
          />
        </Box>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceForm;
