import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Stack,
  IconButton,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { accountAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Accounts = () => {
  const theme = useTheme();
  
  // State management
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    typeId: '',
    initialBalance: '',
    accountNumber: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadAccounts();
    loadAccountTypes();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadAccountTypes = async () => {
    try {
      const response = await accountAPI.getTypes();
      setAccountTypes(response.data.data || []);
    } catch (error) {
      console.error('Error loading account types:', error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      if (!formData.name || !formData.typeId) {
        toast.error('Please fill in all required fields');
        return;
      }

      await accountAPI.create({
        name: formData.name,
        typeId: parseInt(formData.typeId),
        initialBalance: parseFloat(formData.initialBalance) || 0,
        accountNumber: formData.accountNumber,
        description: formData.description
      });

      toast.success('Account created successfully!');
      setDialogOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const handleUpdateAccount = async () => {
    try {
      if (!formData.name) {
        toast.error('Account name is required');
        return;
      }

      await accountAPI.update(editingAccount.id, {
        name: formData.name,
        description: formData.description
      });

      toast.success('Account updated successfully!');
      setDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await accountAPI.delete(selectedAccount.id);
      toast.success('Account deleted successfully!');
      setMenuAnchor(null);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      typeId: '',
      initialBalance: '',
      accountNumber: '',
      description: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingAccount(null);
    setDialogOpen(true);
  };

  const openEditDialog = (account) => {
    setFormData({
      name: account.name,
      typeId: account.typeId || '',
      initialBalance: account.balance || '',
      accountNumber: account.accountNumber || '',
      description: account.description || ''
    });
    setEditingAccount(account);
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuClick = (event, account) => {
    setSelectedAccount(account);
    setMenuAnchor(event.currentTarget);
  };

  const getAccountIcon = (type) => {
    const typeLower = type?.toLowerCase();
    switch (typeLower) {
      case 'checking':
        return <BankIcon />;
      case 'savings':
        return <SavingsIcon />;
      case 'credit card':
      case 'credit':
        return <CardIcon />;
      default:
        return <WalletIcon />;
    }
  };

  const getAccountColor = (type) => {
    const typeLower = type?.toLowerCase();
    switch (typeLower) {
      case 'checking':
        return theme.palette.primary.main;
      case 'savings':
        return theme.palette.success.main;
      case 'credit card':
      case 'credit':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const formatBalance = (amount, isAsset) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBalanceColor = (amount, isAsset) => {
    if (isAsset) {
      return amount > 0 ? theme.palette.success.main : theme.palette.error.main;
    } else {
      // For liabilities (credit cards), negative balance is good
      return amount < 0 ? theme.palette.error.main : theme.palette.success.main;
    }
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return account.isAsset ? sum + account.balance : sum - Math.abs(account.balance);
  }, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your financial accounts and track balances
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 3,
          }}
        >
          Add Account
        </Button>
      </Box>

      {/* Summary Card */}
      <Card sx={{ mb: 4, borderRadius: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
        <CardContent sx={{ color: 'white', py: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Total Net Worth
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {formatBalance(totalBalance, true)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={`${accounts.length} ${accounts.length === 1 ? 'Account' : 'Accounts'}`}
                sx={{ 
                  backgroundColor: alpha('#fff', 0.2), 
                  color: 'white',
                  mb: 1
                }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon sx={{ opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Updated just now
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
          <CardContent>
            <WalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              No accounts yet
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Add your first account to start tracking your finances
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(getAccountColor(account.type), 0.1),
                        color: getAccountColor(account.type),
                      }}
                    >
                      {getAccountIcon(account.type)}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, account)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Stack>

                  <Typography variant="h6" fontWeight="bold" mb={1} noWrap>
                    {account.name}
                  </Typography>

                  <Chip
                    label={account.type}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getAccountColor(account.type), 0.1),
                      color: getAccountColor(account.type),
                      mb: 2,
                    }}
                  />

                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={getBalanceColor(account.balance, account.isAsset)}
                    mb={1}
                  >
                    {formatBalance(account.balance, account.isAsset)}
                  </Typography>

                  {account.accountNumber && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      ••••{account.accountNumber.slice(-4)}
                    </Typography>
                  )}

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="caption" color="text.disabled">
                      {account.transactionCount || 0} transactions
                    </Typography>
                    {account.lastTransaction && (
                      <Typography variant="caption" color="text.disabled">
                        Last: {new Date(account.lastTransaction).toLocaleDateString()}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => openEditDialog(selectedAccount)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Account</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteAccount} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Account</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Account Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Account Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            {!editingAccount && (
              <>
                <FormControl fullWidth required>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.typeId}
                    label="Account Type"
                    onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Initial Balance"
                  type="number"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  fullWidth
                  InputProps={{
                    startAdornment: '$',
                  }}
                />

                <TextField
                  label="Account Number (optional)"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  fullWidth
                  placeholder="e.g., 1234567890"
                />
              </>
            )}

            <TextField
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={editingAccount ? handleUpdateAccount : handleCreateAccount}
          >
            {editingAccount ? 'Update Account' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;