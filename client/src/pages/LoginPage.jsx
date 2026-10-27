import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Alert, CircularProgress, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Receipt as InvoiceIcon } from '@mui/icons-material';
import { login } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setApiError('');

    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setApiError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setApiError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: email.trim().toLowerCase(), password });
      if (res.data?.token) localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/invoices');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: '#eae8e4', // Warm neutral canvas matching Acctual
      }}
    >
      {/* Left Sidebar matching Acctual */}
      <Box
        sx={{
          width: { xs: 0, md: 220 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 2.5,
          py: 3,
          boxSizing: 'border-box',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <InvoiceIcon sx={{ fontSize: 22, color: '#18181b' }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              color: '#18181b',
              letterSpacing: '-0.02em',
              fontFamily: 'inherit',
            }}
          >
            InvoicePanel
          </Typography>
        </Box>

        {/* Faint placeholder pill at bottom left matching Image 2 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.25,
            py: 0.85,
            borderRadius: 2.5,
            bgcolor: 'rgba(0, 0, 0, 0.03)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            width: 140,
            height: 32,
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: 'rgba(0, 0, 0, 0.06)',
            }}
          />
          <Box
            sx={{
              width: 60,
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0, 0, 0, 0.06)',
            }}
          />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#eae8e4',
          pt: { xs: 0, md: 1 },
          pr: { xs: 0, md: 1 },
          height: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {/* Large white canvas with rounded top-left corner */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#ffffff',
            borderTopLeftRadius: { xs: 0, md: 24 },
            borderTopRightRadius: { xs: 0, md: 0 },
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            overflowY: 'auto',
          }}
        >
          {/* Centered Sign-in Form Container */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 360,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
            }}
          >
            {/* Title: Welcome back 👋 */}
            <Typography
              sx={{
                fontSize: { xs: '1.625rem', sm: '1.875rem' },
                fontWeight: 700,
                color: '#18181b',
                textAlign: 'center',
                letterSpacing: '-0.025em',
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              Welcome!
            </Typography>

            {/* Error Alert */}
            {apiError && (
              <Alert
                severity="error"
                onClose={() => setApiError('')}
                sx={{
                  mb: 2.5,
                  borderRadius: 2,
                  fontSize: '0.8125rem',
                  py: 0.5,
                }}
              >
                {apiError}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              {/* Email address field */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  component="label"
                  htmlFor="email-input"
                  sx={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#18181b',
                    mb: 0.75,
                    textAlign: 'left',
                  }}
                >
                  Email address
                </Typography>
                <Box
                  component="input"
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (apiError) setApiError('');
                  }}
                  placeholder="Enter your email address"
                  autoFocus
                  autoComplete="email"
                  sx={{
                    width: '100%',
                    height: 42,
                    px: 1.5,
                    fontSize: '0.875rem',
                    color: '#18181b',
                    bgcolor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: 2,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:focus': {
                      borderColor: '#18181b',
                      boxShadow: '0 0 0 1px #18181b',
                    },
                    '&::placeholder': {
                      color: '#a1a1aa',
                    },
                  }}
                />
              </Box>

              {/* Password field */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  htmlFor="password-input"
                  sx={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#18181b',
                    mb: 0.75,
                    textAlign: 'left',
                  }}
                >
                  Password
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="input"
                    id="password-input"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (apiError) setApiError('');
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    sx={{
                      width: '100%',
                      height: 42,
                      pl: 1.5,
                      pr: 5,
                      fontSize: '0.875rem',
                      color: '#18181b',
                      bgcolor: '#ffffff',
                      border: '1px solid #e4e4e7',
                      borderRadius: 2,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      '&:focus': {
                        borderColor: '#18181b',
                        boxShadow: '0 0 0 1px #18181b',
                      },
                      '&::placeholder': {
                        color: '#a1a1aa',
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#71717a',
                      p: 0.5,
                    }}
                  >
                    {showPass ? (
                      <VisibilityOff sx={{ fontSize: 18 }} />
                    ) : (
                      <Visibility sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>

              {/* Sign In ▸ button */}
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  height: 42,
                  background: 'linear-gradient(180deg, #3f3f46 0%, #18181b 100%)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  '&:hover': {
                    background: '#09090b',
                  },
                  '&:disabled': {
                    background: '#a1a1aa',
                    color: '#ffffff',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                ) : (
                  <>
                    Sign In
                    <span style={{ fontSize: '0.75rem', marginLeft: 2 }}>▸</span>
                  </>
                )}
              </Button>
            </Box>

            {/* Divider and Don't have an account? Sign up */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #f4f4f5',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: '#71717a' }}>
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: '#18181b',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
