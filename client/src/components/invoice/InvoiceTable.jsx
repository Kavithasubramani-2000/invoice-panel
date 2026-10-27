import { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Tooltip, Typography, MenuItem, Select,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import ConfirmDialog from '../common/ConfirmDialog';
import { deleteInvoice, updateInvoiceStatus } from '../../api/invoices.api';

const STATUS_COLORS = {
  draft: 'default',
  unpaid: 'warning',
  paid: 'success',
  void: 'error',
};

const formatCurrency = (amount, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  } catch {
    return `${currency} ${(amount || 0).toFixed(2)}`;
  }
};

const InvoiceTable = ({ invoices = [], onEdit, onRefresh, loading }) => {
  const [confirmId, setConfirmId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteInvoice(confirmId);
      setConfirmId(null);
      onRefresh?.();
    } catch {}
    setDeleteLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      onRefresh?.();
    } catch {}
  };

  if (invoices.length === 0 && !loading) return null;

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              {['Invoice #', 'Customer', 'Issue Date', 'Due Date', 'Amount', 'Status', ''].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 0.5, py: 1.5, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', textTransform: 'uppercase' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow
                key={inv._id}
                hover
                sx={{ '& td': { py: 1.5, borderColor: 'divider' }, cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {inv.invoiceNumber}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{inv.customerSnapshot?.name || '—'}</Typography>
                  {inv.customerSnapshot?.email && (
                    <Typography variant="caption" color="text.secondary">{inv.customerSnapshot.email}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dayjs(inv.issueDate).format('MMM D, YYYY')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dayjs(inv.dueDate).format('MMM D, YYYY')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(inv.total, inv.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Select
                    value={inv.status}
                    size="small"
                    onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    variant="outlined"
                    sx={{
                      minWidth: 90, fontSize: '0.75rem', py: 0, height: 28,
                      '& .MuiSelect-select': { py: 0.5, px: 1 },
                    }}
                    renderValue={(val) => (
                      <Chip
                        label={val.charAt(0).toUpperCase() + val.slice(1)}
                        size="small"
                        color={STATUS_COLORS[val]}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      />
                    )}
                  >
                    {['draft', 'unpaid', 'paid', 'void'].map((s) => (
                      <MenuItem key={s} value={s} dense>
                        <Chip label={s.charAt(0).toUpperCase() + s.slice(1)} size="small" color={STATUS_COLORS[s]} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(inv); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmId(inv._id); }} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        loading={deleteLoading}
      />
    </>
  );
};

export default InvoiceTable;
