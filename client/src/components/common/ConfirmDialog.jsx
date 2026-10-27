import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
      <WarningIcon color="warning" />
      {title || 'Confirm Action'}
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        {message || 'Are you sure? This action cannot be undone.'}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={loading} variant="outlined" size="small">
        Cancel
      </Button>
      <Button onClick={onConfirm} disabled={loading} variant="contained" color="error" size="small">
        {loading ? 'Deleting...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
