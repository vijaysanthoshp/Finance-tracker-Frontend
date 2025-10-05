import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MonetizationOn as MoneyIcon,
} from '@mui/icons-material';
import { budgetAPI, transactionAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    budgetName: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    totalLimit: '',
    notes: '',
    categories: [] // Simple array of category IDs
  });

  useEffect(() => {
    loadBudgets();
    loadCategories();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getBudgets();
      const budgetsData = response.data?.data || [];
      setBudgets(budgetsData);
      
      // Check for budget overages and show notifications
      budgetsData.forEach(budget => {
        if (budget.isActive && budget.isOverBudget) {
          toast.error(`🚨 Budget "${budget.name}" is over limit by ${formatCurrency(budget.totalSpent - budget.totalLimit)}!`, {
            duration: 8000,
            position: 'top-right'
          });
        } else if (budget.isActive && budget.percentUsed > 90) {
          toast.warning(`⚠️ Budget "${budget.name}" is ${budget.percentUsed.toFixed(1)}% used!`, {
            duration: 5000,
            position: 'top-right'
          });
        }
      });
    } catch (error) {
      console.error('Error loading budgets:', error);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await transactionAPI.getCategories();
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateBudget = async () => {
    try {
      if (!formData.budgetName || !formData.totalLimit) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Categories are optional - users can add them later

      await budgetAPI.create({
        budgetName: formData.budgetName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalLimit: parseFloat(formData.totalLimit),
        notes: formData.notes,
        categories: [] // Don't send category allocations - let users add them later
      });

      toast.success('Budget created successfully!');
      setDialogOpen(false);
      resetForm();
      loadBudgets();
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget');
    }
  };

  const resetForm = () => {
    setFormData({
      budgetName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      totalLimit: '',
      notes: '',
      categories: []
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Create Budget
        </Button>
      </Box>

      {budgets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MoneyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No budgets found
            </Typography>
            <Typography color="text.secondary" paragraph>
              Create your first budget to track your spending and stay on top of your finances.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const totalSpent = budget.totalSpent || 0; // Default to 0 if not provided
            const spentPercentage = (totalSpent / budget.totalLimit) * 100;
            const remainingAmount = budget.totalLimit - totalSpent;

            return (
              <Grid item xs={12} md={6} key={budget.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" component="h2">
                        {budget.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={budget.isActive ? 'Active' : 'Inactive'}
                        color={budget.isActive ? 'success' : 'default'}
                      />
                    </Box>

                    <Stack spacing={2}>
                      <Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(totalSpent)} / {formatCurrency(budget.totalLimit)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(spentPercentage, 100)}
                          color={getProgressColor(spentPercentage)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {spentPercentage.toFixed(1)}% used
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Remaining
                          </Typography>
                          <Typography variant="h6" color={remainingAmount >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(Math.abs(remainingAmount))}
                            {remainingAmount < 0 && ' over budget'}
                          </Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="body2" color="text.secondary">
                            Period
                          </Typography>
                          <Typography variant="body2">
                            {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Budget Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Budget Name"
              value={formData.budgetName}
              onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
              required
            />

            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Box>

            <TextField
              fullWidth
              type="number"
              label="Total Budget Limit"
              value={formData.totalLimit}
              onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })}
              InputProps={{ startAdornment: '$' }}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Categories to Track</InputLabel>
              <Select
                multiple
                value={formData.categories}
                onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                label="Categories to Track"
                renderValue={(selected) => 
                  selected.map(categoryId => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? category.name : '';
                  }).join(', ')
                }
              >
                {categories
                  .filter(category => category.type === 'EXPENSE')
                  .map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={formData.categories.indexOf(category.id) > -1} />
                      <Typography sx={{ ml: 1 }}>
                        {category.name}
                      </Typography>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this budget..."
            />

            <Alert severity="info">
              <Typography variant="body2" component="div">
                <strong>How it works:</strong> Create multiple budgets for different purposes (Food, Entertainment, Transport, etc.). 
                Each budget can have its own limit and track different categories. Periods can overlap - just like real banking!
              </Typography>
            </Alert>

            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>💡 Examples:</strong> 
                • "Monthly Food" - $300 (Food categories) | 
                • "Weekly Entertainment" - $75 (Entertainment) | 
                • "Quarterly Travel" - $1200 (Transportation, Hotels)
              </Typography>
              {budgets.length > 0 && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Your active budgets:</strong> {budgets.filter(b => b.isActive).length} budget(s) totaling{' '}
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    budgets.filter(b => b.isActive).reduce((sum, b) => sum + b.totalLimit, 0)
                  )}
                </Typography>
              )}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBudget} variant="contained">
            Create Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budgets;