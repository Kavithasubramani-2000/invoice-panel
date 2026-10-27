import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon, title, description, action, actionLabel }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    py={10}
    gap={2}
    sx={{ textAlign: 'center' }}
  >
    {icon && (
      <Box sx={{ mb: 1, opacity: 0.5, '& svg': { fontSize: 72, color: 'text.secondary' } }}>
        {icon}
      </Box>
    )}
    <Typography variant="h5" fontWeight={700} gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" maxWidth={360}>
        {description}
      </Typography>
    )}
    {action && actionLabel && (
      <Button
        variant="contained"
        onClick={action}
        sx={{ mt: 1 }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
