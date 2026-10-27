import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { getInvoices } from '../api/invoices.api';
import InvoiceTable from '../components/invoice/InvoiceTable';
import InvoiceForm from '../components/invoice/InvoiceForm';
import LoadingState from '../components/common/LoadingState';

const STATUS_TABS = [
  { key: 'draft', label: 'Draft' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
  { key: 'void', label: 'Void' },
];

// Folded Invoice Illustration with dotted lines (matching Screenshot 2)
const EmptyInvoiceIllustration = () => (
  <Box
    sx={{
      width: 280,
      height: 180,
      bgcolor: '#ffffff',
      borderRadius: 2.5,
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Top meta row */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', pb: 1 }}>
      <Box sx={{ width: 60, height: 6, bgcolor: '#e5e7eb', borderRadius: 1 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ width: 40, height: 6, bgcolor: '#e5e7eb', borderRadius: 1 }} />
        <Box sx={{ width: 40, height: 6, bgcolor: '#e5e7eb', borderRadius: 1 }} />
      </Box>
    </Box>

    {/* From & To split */}
    <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
      {/* From column with dotted pattern */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#f1f5f9' }} />
        <Box sx={{ width: '80%', height: 6, bgcolor: '#f1f5f9', borderRadius: 1 }} />
        <Box
          sx={{
            width: '100%',
            height: 24,
            backgroundImage: 'radial-gradient(#93c5fd 1.2px, transparent 1.2px)',
            backgroundSize: '6px 6px',
            opacity: 0.7,
            borderRadius: 1,
          }}
        />
      </Box>

      {/* To column with dotted pattern */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#f1f5f9' }} />
        <Box sx={{ width: '70%', height: 6, bgcolor: '#f1f5f9', borderRadius: 1 }} />
        <Box
          sx={{
            width: '100%',
            height: 24,
            backgroundImage: 'radial-gradient(#93c5fd 1.2px, transparent 1.2px)',
            backgroundSize: '6px 6px',
            opacity: 0.7,
            borderRadius: 1,
          }}
        />
      </Box>
    </Box>

    {/* Dotted lines row */}
    <Box
      sx={{
        mt: 'auto',
        width: '100%',
        height: 18,
        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '6px 6px',
        opacity: 0.6,
        borderRadius: 1,
      }}
    />
  </Box>
);

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ draft: 0, unpaid: 0, paid: 0, void: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('draft');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (activeTab) params.status = activeTab;
      if (search) params.search = search;
      const res = await getInvoices(params);
      setInvoices(res.data.data || []);
      setStatusCounts(res.data.statusCounts || { draft: 0, unpaid: 0, paid: 0, void: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const t = setTimeout(loadInvoices, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadInvoices, search]);

  const handleCreate = () => {
    setEditInvoice(null);
    setFormOpen(true);
  };

  const handleEdit = (invoice) => {
    setEditInvoice(invoice);
    setFormOpen(true);
  };

  if (formOpen) {
    return (
      <InvoiceForm
        onClose={() => { setFormOpen(false); setEditInvoice(null); }}
        onSaved={loadInvoices}
        editInvoice={editInvoice}
      />
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Header */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pt: 4,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#18181b',
            letterSpacing: '-0.025em',
          }}
        >
          Invoices
        </Typography>

        <Button
          variant="contained"
          onClick={handleCreate}
          sx={{
            bgcolor: '#18181b',
            color: '#ffffff',
            borderRadius: 2,
            px: 2.25,
            py: 1,
            fontWeight: 500,
            fontSize: '0.875rem',
            '&:hover': { bgcolor: '#27272a' },
          }}
        >
          Create invoice
        </Button>
      </Box>

      {/* Status Tabs Bar */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          gap: 3,
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = statusCounts[tab.key] || 0;
          return (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                cursor: 'pointer',
                position: 'relative',
                color: isActive ? '#18181b' : '#71717a',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9375rem',
                borderBottom: isActive ? '2px solid #18181b' : '2px solid transparent',
                mb: '-1px',
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: '#18181b',
                },
              }}
            >
              <span>{tab.label}</span>
              {/* Count badge */}
              {tab.key !== 'void' && (
                <Box
                  sx={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: isActive ? '#18181b' : '#e4e4e7',
                    color: isActive ? '#ffffff' : '#71717a',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 0.5,
                  }}
                >
                  {count}
                </Box>
              )}
            </Box>
          );
        })}

        {/* Optional Search */}
        <Box sx={{ ml: 'auto', mb: 0.5 }}>
          <TextField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            size="small"
            sx={{
              width: 180,
              '& .MuiOutlinedInput-root': {
                height: 32,
                fontSize: '0.8125rem',
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16 }} /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}><ClearIcon sx={{ fontSize: 14 }} /></IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      </Box>

      {/* Main Content / Empty State (Matching Screenshot 2) */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        {loading ? (
          <LoadingState message="Loading invoices..." />
        ) : invoices.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2.5,
              my: 'auto',
            }}
          >
            <EmptyInvoiceIllustration />
            <Box>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#18181b',
                  mb: 0.75,
                }}
              >
                Create an invoice
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  color: '#71717a',
                  maxWidth: 320,
                  lineHeight: 1.5,
                }}
              >
                Let customers pay how they want while you receive what you want.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: '100%' }}>
            <InvoiceTable invoices={invoices} onEdit={handleEdit} onRefresh={loadInvoices} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InvoicesPage;
