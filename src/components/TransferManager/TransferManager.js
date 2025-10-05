import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Pagination
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import transferAPI from '../../services/transferAPI';
import { accountAPI } from '../../services/api';
import api from '../../services/api';

const TransferManager = () => {
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toUserId: '',
    amount: '',
    description: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: '',
    feeAmount: '0'
  });

  useEffect(() => {
    loadTransfers();
    loadAccounts();
    loadUsers();
  }, [page]);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const response = await transferAPI.getAll({ page, limit: 10 });
      console.log('Transfer API response:', response);
      
      // Handle the actual response structure from backend
      const transferData = response.data?.data?.transfers || [];
      
      console.log('Extracted transfer data:', transferData);
      setTransfers(Array.isArray(transferData) ? transferData : []);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading transfers:', error);
      toast.error('Failed to load transfers');
      // Ensure transfers is always an array even on error
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      console.log('Loading accounts...');
      const response = await accountAPI.getAccounts();
      console.log('Accounts API response:', response);
      console.log('Response structure:', {
        data: response.data,
        dataData: response.data?.data,
        dataType: typeof response.data,
        dataDataType: typeof response.data?.data
      });
      
      // Use the same format as Transactions page
      const accountData = response.data.data || [];
      
      console.log('Extracted account data:', accountData);
      console.log('Account data type:', typeof accountData, 'Is array:', Array.isArray(accountData));
      
      if (Array.isArray(accountData) && accountData.length > 0) {
        console.log('Sample account object:', accountData[0]);
      }
      
      setAccounts(Array.isArray(accountData) ? accountData : []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const response = await api.get('/users');
      console.log('Users API response:', response);
      
      const userData = response.data?.data || [];
      console.log('Extracted user data:', userData);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleUserChange = (userId) => {
    setFormData({ ...formData, toUserId: userId });
  };

  const getAccountBalance = (accountId) => {
    console.log('Getting balance for account ID:', accountId);
    console.log('Available accounts:', accounts);
    const account = accounts.find(acc => acc.account_id === parseInt(accountId) || acc.id === parseInt(accountId));
    console.log('Found account:', account);
    const balance = account ? parseFloat(account.current_balance || account.balance || 0) : 0;
    console.log('Extracted balance:', balance);
    return balance;
  };

  const handleCreateTransfer = async () => {
    try {
      if (!formData.fromAccountId || !formData.toUserId || !formData.amount || !formData.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.fromAccountId === formData.toAccountId) {
        toast.error('Source and destination accounts must be different');
        return;
      }

      // Validate transfer amount against account balance
      const availableBalance = getAccountBalance(formData.fromAccountId);
      const transferAmount = parseFloat(formData.amount);
      const feeAmount = parseFloat(formData.feeAmount) || 0;
      const totalAmount = transferAmount + feeAmount;

      if (totalAmount > availableBalance) {
        toast.error(`Insufficient funds. Available balance: ${formatCurrency(availableBalance)}`);
        return;
      }

      const transferData = {
        fromAccountId: parseInt(formData.fromAccountId),
        toUserId: parseInt(formData.toUserId),
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        transferDate: formData.transferDate,
        notes: formData.notes.trim() || undefined,
        feeAmount: parseFloat(formData.feeAmount) || 0
      };

      if (editingTransfer) {
        await transferAPI.update(editingTransfer.id, transferData);
        toast.success('Transfer updated successfully!');
      } else {
        await transferAPI.create(transferData);
        toast.success('Transfer created successfully!');
      }

      setDialogOpen(false);
      resetForm();
      loadTransfers();
    } catch (error) {
      console.error('Error saving transfer:', error);
      toast.error(error.response?.data?.message || 'Failed to save transfer');
    }
  };

  const handleEditTransfer = (transfer) => {
    setEditingTransfer(transfer);
    setFormData({
      fromAccountId: transfer.fromAccount.id,
      toAccountId: transfer.toAccount.id,
      amount: transfer.amount,
      description: transfer.description,
      transferDate: transfer.date,
      notes: transfer.notes || '',
      feeAmount: transfer.feeAmount || '0'
    });
    setDialogOpen(true);
  };

  const handleDeleteTransfer = async (transferId) => {
    if (!window.confirm('Are you sure you want to delete this transfer?')) {
      return;
    }

    try {
      await transferAPI.delete(transferId);
      toast.success('Transfer deleted successfully!');
      loadTransfers();
    } catch (error) {
      console.error('Error deleting transfer:', error);
      toast.error('Failed to delete transfer');
    }
  };

  const resetForm = () => {
    setFormData({
      fromAccountId: '',
      toUserId: '',
      amount: '',
      description: '',
      transferDate: new Date().toISOString().split('T')[0],
      notes: '',
      feeAmount: '0'
    });
    setEditingTransfer(null);
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.account_id === accountId);
    return account ? account.account_name : 'Unknown Account';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2" display="flex" alignItems="center">
            <TransferIcon sx={{ mr: 1 }} />
            Money Transfers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            New Transfer
          </Button>
        </Box>

        {loading ? (
          <Typography>Loading transfers...</Typography>
        ) : transfers.length === 0 ? (
          <Alert severity="info">
            No transfers found. Create your first transfer to move money between accounts.
          </Alert>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>From Account</TableCell>
                    <TableCell>To Account</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Fee</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(transfers) && transfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{formatDate(transfer.date)}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AccountIcon sx={{ mr: 1, fontSize: 16 }} />
                          {transfer.fromAccount.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <AccountIcon sx={{ mr: 1, fontSize: 16 }} />
                          {transfer.toAccount.name}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatCurrency(transfer.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{transfer.description}</TableCell>
                      <TableCell>
                        {transfer.feeAmount > 0 ? formatCurrency(transfer.feeAmount) : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Transfer">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTransfer(transfer)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Transfer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteTransfer(transfer.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        {/* Transfer Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingTransfer ? 'Edit Transfer' : 'Create New Transfer'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>From Account *</InputLabel>
                  <Select
                    value={formData.fromAccountId}
                    onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                    label="From Account *"
                  >
                    {accounts.map((account) => {
                      const accountId = account.account_id || account.id;
                      const accountName = account.account_name || account.name;
                      const balance = account.current_balance || account.balance || 0;
                      
                      return (
                        <MenuItem key={accountId} value={accountId}>
                          <Box>
                            <Typography variant="body2">{accountName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Balance: {formatCurrency(balance)}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>To User *</InputLabel>
                  <Select
                    value={formData.toUserId}
                    onChange={(e) => handleUserChange(e.target.value)}
                    label="To User *"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.user_id} value={user.user_id}>
                        <Box>
                          <Typography variant="body2">
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {formData.toUserId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    💡 Money will be sent to the recipient's primary account
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount *"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  helperText={formData.fromAccountId ? 
                    `Available: ${formatCurrency(getAccountBalance(formData.fromAccountId))}` : 
                    'Select an account first'
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transfer Date *"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Transfer to savings, Payment to friend"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transfer Fee (Optional)"
                  type="number"
                  value={formData.feeAmount}
                  onChange={(e) => setFormData({ ...formData, feeAmount: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details about this transfer..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTransfer} variant="contained">
              {editingTransfer ? 'Update Transfer' : 'Create Transfer'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TransferManager;