import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Alert, CircularProgress, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Receipt as InvoiceIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { signup } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const res = await signup({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        confirmPassword: data.confirmPassword || data.password,
      });
      setUser(res.data.user);
      navigate('/invoices');
    } catch (e) {
      setApiError(e.response?.data?.message || 'Sign up failed. Please try again.');
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

        {/* Faint placeholder pill at bottom left */}
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
          {/* Centered Sign-up Form Container */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 380,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              my: 'auto',
              py: 2,
            }}
          >
            {/* Title: Create account ✨ */}
            <Typography
              sx={{
                fontSize: { xs: '1.625rem', sm: '1.875rem' },
                fontWeight: 700,
                color: '#18181b',
                textAlign: 'center',
                letterSpacing: '-0.025em',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              Create account
            </Typography>

            <Typography
              sx={{
                fontSize: '0.875rem',
                color: '#71717a',
                textAlign: 'center',
                mb: 3.5,
              }}
            >
              Start managing your invoices seamlessly
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

            {/* Signup Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
              {/* Full Name */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="label"
                  htmlFor="name-input"
                  sx={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#18181b',
                    mb: 0.75,
                    textAlign: 'left',
                  }}
                >
                  Full name
                </Typography>
                <Box
                  component="input"
                  id="name-input"
                  type="text"
                  placeholder="Enter your full name"
                  autoFocus
                  {...register('name', {
                    required: 'Full name is required',
                    maxLength: { value: 100, message: 'Name too long' },
                  })}
                  sx={{
                    width: '100%',
                    height: 42,
                    px: 1.5,
                    fontSize: '0.875rem',
                    color: '#18181b',
                    bgcolor: '#ffffff',
                    border: errors.name ? '1px solid #ef4444' : '1px solid #e4e4e7',
                    borderRadius: 2,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:focus': {
                      borderColor: errors.name ? '#ef4444' : '#18181b',
                      boxShadow: errors.name ? '0 0 0 1px #ef4444' : '0 0 0 1px #18181b',
                    },
                    '&::placeholder': {
                      color: '#a1a1aa',
                    },
                  }}
                />
                {errors.name && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', mt: 0.5, textAlign: 'left' }}>
                    {errors.name.message}
                  </Typography>
                )}
              </Box>

              {/* Email address */}
              <Box sx={{ mb: 2 }}>
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
                  autoComplete="email"
                  placeholder="Enter your email address"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                  })}
                  sx={{
                    width: '100%',
                    height: 42,
                    px: 1.5,
                    fontSize: '0.875rem',
                    color: '#18181b',
                    bgcolor: '#ffffff',
                    border: errors.email ? '1px solid #ef4444' : '1px solid #e4e4e7',
                    borderRadius: 2,
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    '&:focus': {
                      borderColor: errors.email ? '#ef4444' : '#18181b',
                      boxShadow: errors.email ? '0 0 0 1px #ef4444' : '0 0 0 1px #18181b',
                    },
                    '&::placeholder': {
                      color: '#a1a1aa',
                    },
                  }}
                />
                {errors.email && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', mt: 0.5, textAlign: 'left' }}>
                    {errors.email.message}
                  </Typography>
                )}
              </Box>

              {/* Password */}
              <Box sx={{ mb: 2 }}>
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
                    autoComplete="new-password"
                    placeholder="Create a password (min. 6 characters)"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    sx={{
                      width: '100%',
                      height: 42,
                      pl: 1.5,
                      pr: 5,
                      fontSize: '0.875rem',
                      color: '#18181b',
                      bgcolor: '#ffffff',
                      border: errors.password ? '1px solid #ef4444' : '1px solid #e4e4e7',
                      borderRadius: 2,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      '&:focus': {
                        borderColor: errors.password ? '#ef4444' : '#18181b',
                        boxShadow: errors.password ? '0 0 0 1px #ef4444' : '0 0 0 1px #18181b',
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
                {errors.password && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', mt: 0.5, textAlign: 'left' }}>
                    {errors.password.message}
                  </Typography>
                )}
              </Box>

              {/* Confirm Password */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  component="label"
                  htmlFor="confirm-password-input"
                  sx={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: '#18181b',
                    mb: 0.75,
                    textAlign: 'left',
                  }}
                >
                  Confirm password
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="input"
                    id="confirm-password-input"
                    type={showConfirmPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (v) => v === password || 'Passwords do not match',
                    })}
                    sx={{
                      width: '100%',
                      height: 42,
                      pl: 1.5,
                      pr: 5,
                      fontSize: '0.875rem',
                      color: '#18181b',
                      bgcolor: '#ffffff',
                      border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #e4e4e7',
                      borderRadius: 2,
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                      '&:focus': {
                        borderColor: errors.confirmPassword ? '#ef4444' : '#18181b',
                        boxShadow: errors.confirmPassword ? '0 0 0 1px #ef4444' : '0 0 0 1px #18181b',
                      },
                      '&::placeholder': {
                        color: '#a1a1aa',
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
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
                    {showConfirmPass ? (
                      <VisibilityOff sx={{ fontSize: 18 }} />
                    ) : (
                      <Visibility sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Box>
                {errors.confirmPassword && (
                  <Typography sx={{ fontSize: '0.75rem', color: '#ef4444', mt: 0.5, textAlign: 'left' }}>
                    {errors.confirmPassword.message}
                  </Typography>
                )}
              </Box>

              {/* Create Account ▸ button */}
              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
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
                {isSubmitting ? (
                  <CircularProgress size={18} sx={{ color: '#ffffff' }} />
                ) : (
                  <>
                    Create Account
                    <span style={{ fontSize: '0.75rem', marginLeft: 2 }}>▸</span>
                  </>
                )}
              </Button>
            </Box>

            {/* Divider and Already have an account? Sign in */}
            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #f4f4f5',
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.8125rem', color: '#71717a' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#18181b',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;
