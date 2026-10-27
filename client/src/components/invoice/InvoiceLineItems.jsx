import { Box, TextField, IconButton, Button, Typography, Divider } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFieldArray } from 'react-hook-form';

const InvoiceLineItems = ({ control, register, watch, setValue, errors }) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const items = watch('items') || [];
  const currency = watch('currency') || 'USD';

  const formatAmt = (qty, price) => {
    const amt = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amt);
    } catch {
      return `${currency} ${amt.toFixed(2)}`;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        display="grid"
        gridTemplateColumns="1fr 80px 100px 90px 40px"
        gap={1}
        sx={{ mb: 1, px: 0.5 }}
        alignItems="center"
      >
        {['Description', 'Qty', 'Price', 'Amount', ''].map((label) => (
          <Typography key={label} variant="caption" fontWeight={700} color="text.secondary"
            textTransform="uppercase" fontSize="0.65rem" letterSpacing={0.5}
            textAlign={label === 'Amount' ? 'right' : 'left'}>
            {label}
          </Typography>
        ))}
      </Box>

      <Divider sx={{ mb: 1 }} />

      {fields.map((field, index) => {
        const qty = items[index]?.quantity;
        const price = items[index]?.unitPrice;

        return (
          <Box
            key={field.id}
            display="grid"
            gridTemplateColumns="1fr 80px 100px 90px 40px"
            gap={1}
            alignItems="flex-start"
            sx={{ mb: 1 }}
          >
            <TextField
              {...register(`items.${index}.description`, { required: 'Required' })}
              placeholder="Item description"
              size="small"
              fullWidth
              error={!!errors?.items?.[index]?.description}
              multiline
              maxRows={3}
            />
            <TextField
              {...register(`items.${index}.quantity`, {
                required: 'Required',
                min: { value: 0.001, message: 'Must be > 0' },
                valueAsNumber: true,
              })}
              type="number"
              size="small"
              placeholder="1"
              inputProps={{ min: 0, step: 'any' }}
              error={!!errors?.items?.[index]?.quantity}
            />
            <TextField
              {...register(`items.${index}.unitPrice`, {
                required: 'Required',
                min: { value: 0, message: 'Must be ≥ 0' },
                valueAsNumber: true,
              })}
              type="number"
              size="small"
              placeholder="0.00"
              inputProps={{ min: 0, step: 'any' }}
              error={!!errors?.items?.[index]?.unitPrice}
            />
            <Box display="flex" alignItems="center" justifyContent="flex-end" height={40}>
              <Typography variant="body2" fontWeight={500} textAlign="right">
                {formatAmt(qty, price)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="center">
              <IconButton
                size="small"
                onClick={() => fields.length > 1 && remove(index)}
                disabled={fields.length <= 1}
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        );
      })}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
        sx={{ mt: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        Add item
      </Button>
    </Box>
  );
};

export default InvoiceLineItems;
