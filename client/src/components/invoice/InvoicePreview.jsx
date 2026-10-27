import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import AnimatedSelectionFrame from './AnimatedSelectionFrame';

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `$${(amount || 0).toFixed(2)}`;
  }
};

const formatDate = (date) => {
  if (!date) return '—';
  return dayjs(date).format('MM/DD/YY');
};

const calcTotals = (items = [], discountValue = 0) => {
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const subtotal = round2(
    items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0)
  );
  const discount = round2(parseFloat(discountValue) || 0);
  const total = round2(Math.max(0, subtotal - discount));
  return { subtotal, discount, total };
};

// Dotted skeleton block (matching Image 1 empty states)
const DottedSkeleton = ({ width = '100%', height = 12, circle = false }) => (
  <Box
    sx={{
      width,
      height,
      borderRadius: circle ? '50%' : 1,
      backgroundImage: 'radial-gradient(#93c5fd 1.2px, transparent 1.2px)',
      backgroundSize: '5px 5px',
      opacity: 0.75,
      flexShrink: 0,
    }}
  />
);

const InvoicePreview = ({ data = {}, activeSection, onSectionClick, forPrint = false }) => {
  const {
    invoiceNumber = '000001',
    issueDate = dayjs().format('YYYY-MM-DD'),
    dueDate = dayjs().add(14, 'day').format('YYYY-MM-DD'),
    customerSnapshot = {},
    senderSnapshot = {},
    items = [],
    notes = '',
    discountValue = 0,
    currency = 'USD',
  } = data;

  const { subtotal, discount, total } = calcTotals(items, discountValue);

  const senderName = senderSnapshot.company || senderSnapshot.name || '';
  const senderEmail = senderSnapshot.email || '';
  const senderAddress = senderSnapshot.address || '';
  const senderInitial = senderName ? senderName.charAt(0).toUpperCase() : '';

  const hasCustomer = !!(customerSnapshot.name || customerSnapshot.company);
  const customerName = customerSnapshot.company || customerSnapshot.name || '';
  const customerEmail = customerSnapshot.email || '';
  const customerInitial = customerName ? customerName.charAt(0).toUpperCase() : '';

  const validItems = items.filter((i) => (i.description || '').trim() || (parseFloat(i.unitPrice) || 0) > 0);
  const hasItems = validItems.length > 0;

  const SECTION_STEP = {
    company: 1,
    customer: 2,
    details: 3,
    terms: 4,
    payout: 5,
  };
  const currentStep = SECTION_STEP[activeSection] || 1;

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        borderRadius: 2.5,
        border: '1px solid #f1f5f9',
        boxShadow: forPrint ? 'none' : '0 4px 24px rgba(0,0,0,0.03)',
        p: { xs: 3, sm: 4.5 },
        color: '#18181b',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        minHeight: 520,
        boxSizing: 'border-box',
        '@media print': { boxShadow: 'none', border: 'none' },
      }}
      className="invoice-preview-paper"
    >
      {/* Top Metadata Row: INVOICE NO, ISSUED, DUE DATE (Terms Section) */}
      <AnimatedSelectionFrame
        sectionId="terms"
        selected={!forPrint && activeSection === 'terms'}
        stepNumber="4"
        badgeText="Terms"
        forPrint={forPrint}
        sx={{
          p: 1.5,
          m: -1.5,
          cursor: forPrint ? 'default' : 'pointer',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box
          onClick={() => onSectionClick?.('terms')}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pb: 2,
            borderBottom: '1px solid #f4f4f5',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#9ca3af',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mb: 0.5,
              }}
            >
              Invoice No
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#18181b' }}>
              {invoiceNumber || '000001'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  mb: 0.5,
                }}
              >
                Issued
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#18181b' }}>
                {formatDate(issueDate)}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  mb: 0.5,
                }}
              >
                Due Date
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#18181b' }}>
                {formatDate(dueDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </AnimatedSelectionFrame>

      {/* FROM & TO Columns */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 4 }}>
        {/* FROM Column */}
        <AnimatedSelectionFrame
          sectionId="company"
          selected={!forPrint && activeSection === 'company'}
          stepNumber="1"
          badgeText="Company"
          forPrint={forPrint}
          sx={{ p: 1.5, m: -1.5, cursor: forPrint ? 'default' : 'pointer', borderRadius: 2 }}
        >
          <Box onClick={() => onSectionClick?.('company')}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#9ca3af',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              From
            </Typography>

            {/* Avatar / Logo */}
            {senderSnapshot.logo ? (
              <Box
                component="img"
                src={senderSnapshot.logo}
                alt={senderName}
                sx={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', mb: 1.5 }}
              />
            ) : senderInitial ? (
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: '#f4f4f5',
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 1.5,
                }}
              >
                {senderInitial}
              </Box>
            ) : (
              <DottedSkeleton width={38} height={38} circle />
            )}

            {senderName ? (
              <>
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b', mb: 0.25 }}>
                  {senderName}
                </Typography>
                {senderEmail && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 1 }}>
                    {senderEmail}
                  </Typography>
                )}
                {senderAddress && (
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      color: '#71717a',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.45,
                    }}
                  >
                    {senderAddress}
                  </Typography>
                )}
                {senderSnapshot.taxId && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mt: 0.5 }}>
                    Tax ID: {senderSnapshot.taxId}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1 }}>
                <DottedSkeleton width="60%" height={16} />
                <DottedSkeleton width="85%" height={12} />
                <DottedSkeleton width="50%" height={12} />
              </Box>
            )}
          </Box>
        </AnimatedSelectionFrame>

        {/* TO Column */}
        <AnimatedSelectionFrame
          sectionId="customer"
          selected={!forPrint && activeSection === 'customer'}
          stepNumber="2"
          badgeText="Customer"
          forPrint={forPrint}
          sx={{ p: 1.5, m: -1.5, cursor: forPrint ? 'default' : 'pointer', borderRadius: 2 }}
        >
          <Box onClick={() => onSectionClick?.('customer')}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#9ca3af',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              To
            </Typography>

            {hasCustomer ? (
              <>
                {customerSnapshot.logo ? (
                  <Box
                    component="img"
                    src={customerSnapshot.logo}
                    alt={customerName}
                    sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', mb: 1.5 }}
                  />
                ) : customerInitial ? (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#f4f4f5',
                      color: '#71717a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    {customerInitial}
                  </Box>
                ) : null}
                <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#18181b', mb: 0.25 }}>
                  {customerName}
                </Typography>
                {customerEmail && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', mb: 0.5 }}>
                    {customerEmail}
                  </Typography>
                )}
                {customerSnapshot.address && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a', lineHeight: 1.45, mb: 0.5 }}>
                    {customerSnapshot.address}
                  </Typography>
                )}
                {customerSnapshot.taxId && (
                  <Typography sx={{ fontSize: '0.8125rem', color: '#71717a' }}>
                    Tax ID: {customerSnapshot.taxId}
                  </Typography>
                )}
              </>
            ) : (
              /* Dotted placeholder skeleton matching Image 1 */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <DottedSkeleton width={38} height={38} circle />
                <DottedSkeleton width="60%" height={16} />
                <DottedSkeleton width="85%" height={12} />
                <DottedSkeleton width="50%" height={12} />
              </Box>
            )}
          </Box>
        </AnimatedSelectionFrame>
      </Box>

      {/* ITEMS Table & Totals Section (Matching Image 1) */}
      <AnimatedSelectionFrame
        sectionId="details"
        selected={!forPrint && activeSection === 'details'}
        stepNumber="3"
        badgeText="Items"
        forPrint={forPrint}
        sx={{
          p: 1.5,
          m: -1.5,
          cursor: forPrint ? 'default' : 'pointer',
          borderRadius: 2,
          pb: 12,
        }}
      >
        <Box onClick={() => onSectionClick?.('details')}>
          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
              pb: 1.5,
            }}
          >
            <Typography
              sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}
            >
              DESCRIPTION
            </Typography>
            <Typography
              sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textAlign: 'right' }}
            >
              QTY
            </Typography>
            <Typography
              sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textAlign: 'right' }}
            >
              PRICE
            </Typography>
            <Typography
              sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textAlign: 'right' }}
            >
              AMOUNT
            </Typography>
          </Box>

          {/* Table Rows */}
          {hasItems ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {validItems.map((item, idx) => {
                const qty = parseFloat(item.quantity) || 1;
                const price = parseFloat(item.unitPrice) || 0;
                const amount = qty * price;
                return (
                  <Box
                    key={idx}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
                      py: 1.75,
                      borderBottom: '1px solid #f4f4f5',
                      fontSize: '0.875rem',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.875rem', color: '#18181b', fontWeight: 400 }}>
                      {item.description || 'Item'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#18181b', textAlign: 'right' }}>
                      {qty.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#18181b', textAlign: 'right' }}>
                      {formatCurrency(price, currency)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#18181b', textAlign: 'right' }}>
                      {formatCurrency(amount, currency)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            /* Dotted skeleton line with divider under it matching Image 1 */
            <Box
              sx={{
                py: 2.25,
                borderBottom: '1px solid #f4f4f5',
                display: 'grid',
                gridTemplateColumns: '2.5fr 1fr 1fr 1fr',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <DottedSkeleton width="75%" height={14} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DottedSkeleton width={42} height={14} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DottedSkeleton width={56} height={14} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <DottedSkeleton width={66} height={14} />
              </Box>
            </Box>
          )}

          {/* Subtotal & Total Rows inside frame matching Image 1 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mt: 2.5,
            }}
          >
            {/* Left Notes */}
            <Box sx={{ maxWidth: 220 }}>
              {notes && (
                <>
                  <Typography
                    sx={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500, mb: 0.25 }}
                  >
                    Note
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#18181b' }}>
                    {notes}
                  </Typography>
                </>
              )}
            </Box>

            {/* Right Totals */}
            <Box sx={{ width: 220, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1.25,
                  borderBottom: '1px solid #f4f4f5',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', color: '#71717a' }}>Subtotal</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#18181b', fontWeight: 500 }}>
                  {formatCurrency(subtotal, currency)}
                </Typography>
              </Box>

              {discount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.25,
                    borderBottom: '1px solid #f4f4f5',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', color: '#71717a' }}>Discount</Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#18181b', fontWeight: 500 }}>
                    -{formatCurrency(discount, currency)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', color: '#18181b', fontWeight: 600 }}>Total</Typography>
                <Typography sx={{ fontSize: '1.05rem', color: '#18181b', fontWeight: 700 }}>
                  {formatCurrency(total, currency)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </AnimatedSelectionFrame>
    </Box>
  );
};

export default InvoicePreview;
