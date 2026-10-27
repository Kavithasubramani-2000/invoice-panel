import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, TextField, InputAdornment, IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PeopleAlt as PeopleIcon,
} from '@mui/icons-material';
import { getContacts } from '../api/contacts.api';
import ContactTable from '../components/contacts/ContactTable';
import ContactForm from '../components/contacts/ContactForm';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';

const ContactsPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [formOpen, setFormOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'Kavitha';

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        sort: sortOrder === 'desc' ? '-lastInvoice' : 'lastInvoice',
      };
      if (search) params.search = search;
      const res = await getContacts(params);
      setContacts(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, sortOrder]);

  useEffect(() => {
    const t = setTimeout(loadContacts, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadContacts, search]);

  const handleAdd = () => {
    setEditContact(null);
    setFormOpen(true);
  };

  const handleEdit = (contact) => {
    setEditContact(contact);
    setFormOpen(true);
  };

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  // Determine onboarding step
  const hasContacts = contacts.length > 0;
  const hasInvoices = contacts.some((c) => c.invoiceCount > 0);
  const hasPaid = contacts.some((c) => c.lifetimeValue > 0 && c.outstanding === 0);
  const currentStep = hasPaid ? 3 : hasInvoices ? 2 : hasContacts ? 1 : 0;
  const progressPercent = currentStep === 3 ? 100 : currentStep === 2 ? 66 : currentStep === 1 ? 33 : 15;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#ffffff' }}>
      {/* Top Header */}
      <Box
        sx={{
          px: { xs: 3, md: 5 },
          pt: 4,
          pb: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
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
          Contacts
        </Typography>

        <Button
          variant="contained"
          onClick={handleAdd}
          sx={{
            bgcolor: '#18181b',
            color: '#ffffff',
            borderRadius: '8px',
            px: 2.25,
            py: 0.85,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#27272a',
              boxShadow: 'none',
            },
          }}
        >
          Add contact
        </Button>
      </Box>

      {/* Onboarding Greeting & Progress (matching Image 1) */}
      <Box sx={{ px: { xs: 3, md: 5 }, pb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: '#18181b' }}>
            Hey {displayName}. Let's get you paid.
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 500 }}>
            Step {currentStep}/3
          </Typography>
        </Box>

        {/* Progress bar line with blue accent */}
        <Box
          sx={{
            width: '100%',
            height: 3,
            bgcolor: '#f1f5f9',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progressPercent}%`,
              height: '100%',
              bgcolor: '#0284c7',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </Box>
      </Box>

      {/* Search Input Bar */}
      <Box sx={{ px: { xs: 3, md: 5 }, pb: 2.5 }}>
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contacts..."
          size="small"
          sx={{
            maxWidth: 280,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: '#e4e4e7',
              },
              '&:hover fieldset': {
                borderColor: '#cbd5e1',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#18181b',
                borderWidth: 1.5,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#a1a1aa' }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {/* Table Content or Empty State */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: { xs: 3, md: 5 }, pb: 4 }}>
        {loading ? (
          <LoadingState message="Loading contacts..." />
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={<PeopleIcon />}
            title="Add your first contact"
            description={
              search
                ? 'No contacts match your search. Try a different name or email.'
                : 'Contacts you add will appear here. You can use them when creating invoices.'
            }
            action={!search ? handleAdd : undefined}
            actionLabel="Add contact"
          />
        ) : (
          <ContactTable
            contacts={contacts}
            onEdit={handleEdit}
            onRefresh={loadContacts}
            sortOrder={sortOrder}
            onToggleSort={handleToggleSort}
          />
        )}
      </Box>

      <ContactForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditContact(null); }}
        onSaved={loadContacts}
        editContact={editContact}
      />
    </Box>
  );
};

export default ContactsPage;
