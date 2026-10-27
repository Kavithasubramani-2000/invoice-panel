import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Typography, IconButton, useMediaQuery, useTheme, Popover, Divider,
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  CreditCard as PaymentsIcon,
  ShieldOutlined as ContactsIcon,
  Menu as MenuIcon,
  UnfoldMore as ChevronUpDownIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import AppearanceSettings from '../../settings/AppearanceSettings';

const SIDEBAR_WIDTH = 220;


const navItems = [
  { label: 'Invoices', path: '/invoices', icon: <InvoiceIcon sx={{ fontSize: 18 }} /> },
  { label: 'Contacts', path: '/contacts', icon: <ContactsIcon sx={{ fontSize: 18 }} /> },
];

const Sidebar = ({ onClose, mobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const handleNav = (path) => {
    navigate(path);
    if (mobile && onClose) onClose();
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const formattedName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : displayName;
  const initial = formattedName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#eae8e4', // Warm neutral sidebar
        px: 2,
        py: 3,
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ px: 1, mb: 4, display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
          Invoice Panel
        </Typography>
      </Box>

      {/* Main Navigation */}
      <List sx={{ p: 0, mb: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => handleNav(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 0.85,
                  px: 1.2,
                  color: isActive ? '#18181b' : '#52525b',
                  bgcolor: isActive ? 'transparent' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    color: '#18181b',
                    '& .MuiListItemIcon-root': { color: '#18181b' },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: isActive ? '#18181b' : '#71717a',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Profile selector pill at bottom */}
      <Box
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          px: 1.25,
          py: 0.85,
          borderRadius: 2.5,
          bgcolor: '#f4f4f2',
          border: '1px solid #dcdad5',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: '#ffffff',
            borderColor: '#c4c2bc',
          },
        }}
      >
        <Avatar
          sx={{
            width: 22,
            height: 22,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: '#fce7f3',
            color: '#be185d',
          }}
        >
          {initial}
        </Avatar>
        <Typography
          sx={{
            flexGrow: 1,
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#18181b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {formattedName}
        </Typography>
        <ChevronUpDownIcon sx={{ fontSize: 16, color: '#a1a1aa' }} />
      </Box>

      {/* User Dropdown Menu matching Image 2 */}
      <Popover
        open={Boolean(menuAnchor)}
        anchorEl={menuAnchor}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: menuAnchor ? `${menuAnchor.offsetWidth}px` : 200,
            boxSizing: 'border-box',
            mb: 1,
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e4e4e7',
            p: 1.25,
            bgcolor: '#ffffff',
          },
        }}
      >
        <Box sx={{ px: 0.75, pt: 0.5, pb: 0.75 }}>
          {user?.email && (
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: '#71717a',
                lineHeight: 1.35,
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mb: 0.35,
              }}
            >
              {user.email}
            </Typography>
          )}

          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#18181b',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formattedName}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5, borderColor: '#f4f4f5' }} />

        <Box
          onClick={async () => {
            setMenuAnchor(null);
            await logout();
            navigate('/login');
          }}
          sx={{
            px: 0.75,
            py: 0.75,
            borderRadius: 1,
            cursor: 'pointer',
            color: '#71717a',
            fontSize: '0.875rem',
            fontWeight: 400,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#f4f4f5',
              color: '#18181b',
            },
          }}
        >
          Logout
        </Box>
      </Popover>

      <AppearanceSettings open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
    </Box>
  );
};

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: '#eae8e4', // Seamless canvas color matching sidebar
      }}
    >
      {/* Desktop sidebar */}
      {!isMobile && (
        <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, height: '100vh' }}>
          <Sidebar />
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH, bgcolor: '#eae8e4' } }}
        >
          <Sidebar mobile onClose={() => setDrawerOpen(false)} />
        </Drawer>
      )}

      {/* Main content with rounded top-left corner */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: '#eae8e4',
          pt: { md: 1 },
          pr: { md: 1 },
        }}
      >
        {isMobile && (
          <Box sx={{ px: 2, py: 1.5, bgcolor: '#eae8e4' }}>
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            borderTopLeftRadius: { xs: 0, md: 24 },
            borderTopRightRadius: { xs: 0, md: 0 },
            boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
