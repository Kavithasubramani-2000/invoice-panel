import { useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, IconButton, CircularProgress, Box, Avatar
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { createContact, updateContact } from '../../api/contacts.api';

const defaultValues = {
  name: '', email: '', phone: '', company: '',
  address: '', city: '', state: '', postalCode: '', country: '',
  taxId: '', notes: '', logo: '',
};

const ContactForm = ({ open, onClose, onSaved, editContact = null }) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(editContact ? { ...defaultValues, ...editContact } : defaultValues);
    }
  }, [open, editContact, reset]);

  const onSubmit = async (data) => {
    try {
      if (editContact) {
        await updateContact(editContact._id, data);
      } else {
        await createContact(data);
      }
      onSaved?.();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const currentLogo = watch('logo');
  const currentName = watch('name');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700} flexGrow={1}>
          {editContact ? 'Edit Contact' : 'Add Contact'}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  src={currentLogo}
                  variant="rounded"
                  sx={{ width: 44, height: 44, borderRadius: 1.5, border: '1px solid #e2e8f0', bgcolor: '#f4f4f5', color: '#52525b', fontWeight: 600 }}
                >
                  {(currentName || 'C').charAt(0).toUpperCase()}
                </Avatar>
                <Button
                  component="label"
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
                >
                  {currentLogo ? 'Change Logo' : 'Upload Logo'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setValue('logo', reader.result);
                      reader.readAsDataURL(file);
                    }}
                  />
                </Button>
                {currentLogo && (
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setValue('logo', '')}
                    sx={{ textTransform: 'none' }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                {...register('name', { required: 'Name is required' })}
                label="Full Name *"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                {...register('email', {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('phone')} label="Phone" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField {...register('company')} label="Company" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField {...register('address')} label="Billing Address" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('city')} label="City" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('state')} label="State / Province" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('postalCode')} label="Postal Code" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('country')} label="Country" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField {...register('taxId')} label="Tax ID (optional)" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField {...register('notes')} label="Notes" multiline rows={2} fullWidth />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={isSubmitting} variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={16} /> : (editContact ? 'Save Changes' : 'Add Contact')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactForm;
