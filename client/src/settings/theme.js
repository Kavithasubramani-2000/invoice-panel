import { createTheme } from '@mui/material/styles';

export const buildMuiTheme = (tokens = {}) => {
  const isDark = tokens.theme === 'dark';
  const primary = tokens.primaryColor || '#18181b';
  const textPrimary = tokens.mainTextColor || '#18181b';
  const textSecondary = tokens.secondaryTextColor || '#71717a';
  const borderColor = tokens.borderColor || '#e4e4e7';
  const fontFamily = tokens.fontFamily || 'Inter';
  const borderRadius = parseInt(tokens.borderRadius || '8', 10);

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: { main: primary },
      background: {
        default: isDark ? '#111827' : '#ffffff',
        paper: isDark ? '#1f2937' : '#ffffff',
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: borderColor,
    },
    typography: {
      fontFamily: `'${fontFamily}', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
      fontSize: 14,
      h1: { fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontWeight: 600, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.015em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
    },
    shape: { borderRadius },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.15s ease',
          },
          containedPrimary: {
            backgroundColor: '#18181b',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#27272a',
            },
          },
          outlined: {
            borderColor: '#e4e4e7',
            color: '#18181b',
            backgroundColor: '#ffffff',
            '&:hover': {
              backgroundColor: '#f4f4f5',
              borderColor: '#d4d4d8',
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: '#e4e4e7',
              },
              '&:hover fieldset': {
                borderColor: '#a1a1aa',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#18181b',
                borderWidth: '1.5px',
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.875rem',
              color: '#71717a',
              '&.Mui-focused': {
                color: '#18181b',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid #e4e4e7',
            boxShadow: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15)',
          },
        },
      },
    },
  });
};
