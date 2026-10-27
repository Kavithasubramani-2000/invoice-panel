import { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Typography, Avatar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteContact } from '../../api/contacts.api';

const ContactTable = ({ contacts = [], onEdit, onRefresh, sortOrder = 'desc', onToggleSort }) => {
  const [confirmId, setConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteContact(confirmId);
      setConfirmId(null);
      onRefresh?.();
    } catch {}
    setDeleteLoading(false);
  };

  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatLastInvoice = (lastInv) => {
    if (!lastInv || !lastInv.issueDate) return '—';
    try {
      const d = new Date(lastInv.issueDate);
      return isNaN(d.getTime())
        ? '—'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  if (contacts.length === 0) return null;

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid #f1f5f9',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          overflow: 'hidden',
          bgcolor: '#ffffff',
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  py: 1.75,
                  px: 3,
                  color: '#71717a',
                  borderBottom: '1px solid #f1f5f9',
                  width: '40%',
                }}
              >
                Name
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  py: 1.75,
                  px: 2,
                  color: '#71717a',
                  borderBottom: '1px solid #f1f5f9',
                  width: '20%',
                }}
              >
                Lifetime Value
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  py: 1.75,
                  px: 2,
                  color: '#71717a',
                  borderBottom: '1px solid #f1f5f9',
                  width: '18%',
                }}
              >
                Outstanding
              </TableCell>

              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  py: 1.75,
                  px: 2,
                  color: '#71717a',
                  borderBottom: '1px solid #f1f5f9',
                  width: '16%',
                }}
              >
                <Box
                  onClick={onToggleSort}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: onToggleSort ? 'pointer' : 'default',
                    userSelect: 'none',
                    '&:hover': onToggleSort ? { color: '#18181b' } : {},
                  }}
                >
                  Last Invoice
                  <ArrowDropDownIcon sx={{ fontSize: 18, color: '#71717a' }} />
                </Box>
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  py: 1.75,
                  px: 3,
                  borderBottom: '1px solid #f1f5f9',
                  width: '6%',
                }}
              />
            </TableRow>
          </TableHead>

          <TableBody>
            {contacts.map((contact) => (
              <TableRow
                key={contact._id}
                hover
                sx={{
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: '#fafafa' },
                  '& td': {
                    py: 1.5,
                    borderColor: '#f8fafc',
                  },
                }}
              >
                {/* Name column: Avatar and Name/Email in a single horizontal row */}
                <TableCell sx={{ px: 3, whiteSpace: 'nowrap' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1.75,
                      flexWrap: 'nowrap',
                    }}
                  >
                    {contact.logo ? (
                      <Avatar
                        src={contact.logo}
                        variant="rounded"
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          border: '1px solid #e2e8f0',
                          bgcolor: '#ffffff',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          bgcolor: '#f4f4f5',
                          color: '#52525b',
                          borderRadius: 1.5,
                          border: '1px solid #e4e4e7',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(contact.name || contact.company)}
                      </Avatar>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, justifyContent: 'center' }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#18181b',
                          lineHeight: 1.25,
                        }}
                      >
                        {contact.name || contact.company || 'Unnamed Customer'}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.8125rem',
                          color: '#71717a',
                          lineHeight: 1.25,
                          mt: 0.35,
                        }}
                      >
                        {contact.email || '—'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Lifetime Value */}
                <TableCell sx={{ px: 2, whiteSpace: 'nowrap' }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#18181b',
                    }}
                  >
                    {formatCurrency(contact.lifetimeValue)}
                  </Typography>
                </TableCell>

                {/* Outstanding */}
                <TableCell sx={{ px: 2, whiteSpace: 'nowrap' }}>
                  <Typography
                    sx={{
                      fontWeight: contact.outstanding > 0 ? 600 : 400,
                      fontSize: '0.875rem',
                      color: contact.outstanding > 0 ? '#b91c1c' : '#71717a',
                    }}
                  >
                    {contact.outstanding > 0 ? formatCurrency(contact.outstanding) : '—'}
                  </Typography>
                </TableCell>

                {/* Last Invoice */}
                <TableCell sx={{ px: 2, whiteSpace: 'nowrap' }}>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      color: '#71717a',
                    }}
                  >
                    {formatLastInvoice(contact.lastInvoice)}
                  </Typography>
                </TableCell>

                {/* Actions: Horizontal Row */}
                <TableCell align="right" sx={{ px: 3, whiteSpace: 'nowrap' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 0.75,
                      flexWrap: 'nowrap',
                    }}
                  >
                    <Tooltip title="Edit contact">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(contact)}
                        sx={{ color: '#a1a1aa', p: 0.5, '&:hover': { color: '#18181b', bgcolor: '#f4f4f5' } }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete contact">
                      <IconButton
                        size="small"
                        onClick={() => setConfirmId(contact._id)}
                        sx={{ color: '#a1a1aa', p: 0.5, '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? Any associated invoices will remain intact."
        loading={deleteLoading}
      />
    </>
  );
};

export default ContactTable;
