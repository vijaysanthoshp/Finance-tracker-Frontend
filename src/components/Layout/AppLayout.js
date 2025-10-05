import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  alpha,
  InputBase,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountsIcon,
  SwapHoriz as TransactionsIcon,
  PieChart as BudgetsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 280;

const AppLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const navigationItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      active: location.pathname === '/dashboard',
    },
    {
      text: 'Accounts',
      icon: <AccountsIcon />,
      path: '/accounts',
      active: location.pathname === '/accounts',
    },
    {
      text: 'Transactions',
      icon: <TransactionsIcon />,
      path: '/transactions',
      active: location.pathname === '/transactions',
    },
    {
      text: 'Budgets',
      icon: <BudgetsIcon />,
      path: '/budgets',
      active: location.pathname === '/budgets',
    },
    {
      text: 'Reports',
      icon: <ReportsIcon />,
      path: '/reports',
      active: location.pathname === '/reports',
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        <AccountsIcon sx={{ color: 'white', mr: 2, fontSize: 28 }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: '1.1rem',
          }}
        >
          FinanceFlow
        </Typography>
      </Box>

      {/* User Info Card */}
      <Box
        sx={{
          p: 2,
          m: 2,
          borderRadius: 2,
          background: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              mr: 2,
            }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight="600"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.full_name || user?.username || 'User'}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Premium Member"
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: item.active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: item.active ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.active ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: item.active ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Bottom Menu Items */}
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ borderRadius: 2, mb: 0.5 }}
            onClick={() => handleNavigation('/settings')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{ borderRadius: 2, mb: 0.5 }}
            onClick={() => handleNavigation('/help')}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText
              primary="Help & Support"
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { lg: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page Title */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {navigationItems.find(item => item.active)?.text || 'Dashboard'}
          </Typography>

          {/* Search Bar */}
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              bgcolor: alpha(theme.palette.common.black, 0.04),
              '&:hover': {
                bgcolor: alpha(theme.palette.common.black, 0.06),
              },
              mr: 2,
              width: { xs: 'auto', sm: 300 },
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Box
              sx={{
                padding: theme.spacing(0, 2),
                height: '100%',
                position: 'absolute',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <InputBase
              placeholder="Search transactions, accounts..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                color: 'inherit',
                width: '100%',
                '& .MuiInputBase-input': {
                  padding: theme.spacing(1, 1, 1, 0),
                  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                  transition: theme.transitions.create('width'),
                },
              }}
            />
          </Box>

          {/* Notification Button */}
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile Button */}
          <Tooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { lg: DRAWER_WIDTH }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <PersonIcon sx={{ mr: 2 }} />
          Profile Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <SettingsIcon sx={{ mr: 2 }} />
          App Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2 }} />
          Sign Out
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            maxWidth: 360,
            minWidth: 320,
            borderRadius: 2,
            boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
        </Box>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2" fontWeight="600">
              Budget Alert: Groceries
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You've spent 85% of your grocery budget this month
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2" fontWeight="600">
              New Transaction
            </Typography>
            <Typography variant="caption" color="text.secondary">
              $45.20 spent at Coffee Shop - 2 hours ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleNotificationMenuClose}>
          <Box>
            <Typography variant="body2" fontWeight="600">
              Bill Reminder
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Internet bill due in 3 days - $79.99
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppLayout;