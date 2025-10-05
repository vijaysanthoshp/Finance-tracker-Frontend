import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  SwapHoriz as TransferIcon,
  Restaurant as RestaurantIcon,
  LocalGasStation as GasIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { transactionAPI, accountAPI } from '../../services/api';
import TransferManager from '../../components/TransferManager';
import OCRReceiptUpload from '../../components/OCRReceiptUpload';
import toast from 'react-hot-toast';

const Transactions = () => {
  const theme = useTheme();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    type: 'EXPENSE',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadTransactions();
    loadAccounts();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      console.log('Loading transactions...');
      const response = await transactionAPI.getTransactions();
      console.log('Transactions API response:', response);
      const transactionData = response.data?.data?.transactions || response.data?.transactions || response.data || [];
      console.log('Extracted transaction data:', transactionData);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      console.log('Set transactions state with:', Array.isArray(transactionData) ? transactionData : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]); // Ensure transactions is always an array
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountAPI.getAccounts();
      setAccounts(response.data.data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await transactionAPI.getCategories();
      console.log('Categories response:', response);
      const categoriesData = response.data?.data || response.data || [];
      console.log('Categories data:', categoriesData);
      
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Fallback categories if backend doesn't return any
        console.warn('No categories returned from backend, using fallback categories based on system categories');
        // Use system category IDs that should exist in the database
        setCategories([
          { id: 9, name: 'Groceries', type: 'EXPENSE' },
          { id: 11, name: 'Transportation', type: 'EXPENSE' },
          { id: 15, name: 'Entertainment', type: 'EXPENSE' },
          { id: 16, name: 'Shopping', type: 'EXPENSE' },
          { id: 1, name: 'Salary', type: 'INCOME' },
          { id: 8, name: 'Other Income', type: 'INCOME' }
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories from server, using default categories');
      // Fallback categories on error - use system category IDs
      setCategories([
        { id: 9, name: 'Groceries', type: 'EXPENSE' },
        { id: 11, name: 'Transportation', type: 'EXPENSE' },
        { id: 15, name: 'Entertainment', type: 'EXPENSE' },
        { id: 16, name: 'Shopping', type: 'EXPENSE' },
        { id: 1, name: 'Salary', type: 'INCOME' },
        { id: 8, name: 'Other Income', type: 'INCOME' }
      ]);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      if (!formData.accountId || !formData.amount || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.categoryId) {
        toast.error('Please select a category. If no categories are available, there may be an issue loading them.');
        return;
      }

      const transactionData = {
        accountId: parseInt(formData.accountId),
        categoryId: parseInt(formData.categoryId),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date, // Should be in YYYY-MM-DD format
        notes: formData.notes
      };

      console.log('Creating transaction with data:', transactionData);
      await transactionAPI.create(transactionData);

      toast.success('Transaction created successfully!');
      setDialogOpen(false);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async () => {
    try {
      if (!formData.categoryId || !formData.amount || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      await transactionAPI.update(editingTransaction.id, {
        categoryId: parseInt(formData.categoryId),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        notes: formData.notes
      });

      toast.success('Transaction updated successfully!');
      setDialogOpen(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await transactionAPI.delete(selectedTransaction.id);
      toast.success('Transaction deleted successfully!');
      setMenuAnchor(null);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: '',
      categoryId: '',
      type: 'EXPENSE',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingTransaction(null);
    setDialogOpen(true);
  };

  const openEditDialog = (transaction) => {
    setFormData({
      accountId: transaction.account?.id || '',
      categoryId: transaction.category?.id || '',
      type: transaction.type?.toUpperCase() || 'EXPENSE',
      amount: Math.abs(transaction.amount) || '',
      description: transaction.description || '',
      date: transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: transaction.notes || ''
    });
    setEditingTransaction(transaction);
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuClick = (event, transaction) => {
    setSelectedTransaction(transaction);
    setMenuAnchor(event.currentTarget);
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase();
    switch (name) {
      case 'food':
      case 'dining':
      case 'restaurant':
        return <RestaurantIcon />;
      case 'gas':
      case 'fuel':
      case 'transportation':
        return <GasIcon />;
      case 'housing':
      case 'rent':
      case 'mortgage':
        return <HomeIcon />;
      case 'shopping':
      case 'retail':
        return <ShoppingIcon />;
      case 'income':
      case 'salary':
        return <IncomeIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  const getCategoryColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
        return theme.palette.success.main;
      case 'expense':
        return theme.palette.error.main;
      case 'transfer':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
    return type?.toLowerCase() === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const getFilteredTransactions = () => {
    // Ensure transactions is always an array
    if (!Array.isArray(transactions)) {
      console.log('Transactions is not an array:', transactions);
      return [];
    }
    
    console.log('Filtering transactions. Original count:', transactions.length);
    let filtered = [...transactions];
    
    // Filter by tab (type)
    if (tabValue === 1) {
      filtered = filtered.filter(t => t.type?.toLowerCase() === 'income');
    } else if (tabValue === 2) {
      filtered = filtered.filter(t => t.type?.toLowerCase() === 'expense');
    } else if (tabValue === 3) {
      // For transfers tab, return empty array since TransferManager handles its own data
      return [];
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log('Filtered transactions result:', sorted);
    return sorted;
  };

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
            Transactions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your income, expenses, and transfers
          </Typography>
        </Box>
{tabValue !== 3 && tabValue !== 4 && (
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
            Add Transaction
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      {tabValue !== 3 && tabValue !== 4 && (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <IncomeIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Income
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    transactions
                      .filter(t => t.type?.toLowerCase() === 'income')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                <ExpenseIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Expenses
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    transactions
                      .filter(t => t.type?.toLowerCase() === 'expense')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <MoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net Income
                </Typography>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color={
                    (transactions.filter(t => t.type?.toLowerCase() === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0) -
                     transactions.filter(t => t.type?.toLowerCase() === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)) > 0 
                    ? 'success.main' 
                    : 'error.main'
                  }
                >
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(
                    transactions.filter(t => t.type?.toLowerCase() === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0) -
                    transactions.filter(t => t.type?.toLowerCase() === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  )}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
      )}

      {/* Filters and Search */}
      {tabValue !== 3 && tabValue !== 4 && (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ px: 3 }}
          >
            <Tab label="All Transactions" />
            <Tab label="Income" />
            <Tab label="Expenses" />
            <Tab label="Transfers" icon={<TransferIcon />} iconPosition="start" />
            <Tab label="Upload Receipt" icon={<ReceiptIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search transactions..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton
              onClick={(e) => setFilterAnchor(e.currentTarget)}
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <FilterIcon />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>
      )}

      {/* Tab Content */}
      {tabValue === 3 ? (
        <TransferManager />
      ) : tabValue === 4 ? (
        <OCRReceiptUpload 
          accounts={accounts} 
          categories={categories}
          onTransactionCreate={handleCreateTransaction}
        />
      ) : getFilteredTransactions().length === 0 ? (
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
          <CardContent>
            <MoneyIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={2}>
              No transactions yet
            </Typography>
            <Typography variant="body2" color="text.disabled" mb={3}>
              Add your first transaction to start tracking your finances
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Add Your First Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {getFilteredTransactions().map((transaction) => (
            <Card key={transaction.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(getCategoryColor(transaction.type), 0.1),
                      color: getCategoryColor(transaction.type),
                    }}
                  >
                    {getCategoryIcon(transaction.category?.name)}
                  </Avatar>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      {transaction.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={transaction.category?.name || 'Uncategorized'}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.account?.name || 'Unknown Account'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={getCategoryColor(transaction.type)}
                    >
                      {formatAmount(transaction.amount, transaction.type)}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, transaction)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => openEditDialog(selectedTransaction)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Transaction</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteTransaction} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Transaction</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Transaction Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {!editingTransaction && (
              <FormControl fullWidth required>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  label="Account"
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                >
                  {accounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} (${account.balance.toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="INCOME">Income</MenuItem>
                <MenuItem value="EXPENSE">Expense</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.categoryId}
                label="Category"
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
            onClick={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
          >
            {editingTransaction ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Transactions;