import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Stack,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Restaurant as RestaurantIcon,
  LocalGasStation as GasIcon,
  Home as HomeIcon,
  School as EducationIcon,
  HealthAndSafety as HealthIcon,
  SportsEsports as EntertainmentIcon,
  MoreHoriz as MoreIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Wallet as WalletIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
} from '@mui/material/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryIcons = {
    Food: RestaurantIcon,
    Transportation: GasIcon,
    Shopping: ShoppingCartIcon,
    Housing: HomeIcon,
    Education: EducationIcon,
    Healthcare: HealthIcon,
    Entertainment: EntertainmentIcon,
    Other: MoreIcon,
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        accountsRes,
        transactionsRes,
        budgetsRes,
        reportsRes
      ] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions?limit=10'),
        api.get('/budgets'),
        api.get('/reports/dashboard')
      ]);

      setDashboardData({
        accounts: accountsRes.data,
        recentTransactions: transactionsRes.data.transactions || [],
        budgets: budgetsRes.data,
        summary: reportsRes.data,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const getAccountTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'checking':
        return <CreditCardIcon />;
      case 'savings':
        return <SavingsIcon />;
      case 'investment':
        return <TrendingUpIcon />;
      default:
        return <AccountBalanceIcon />;
    }
  };

  const getCategoryIcon = (category) => {
    const IconComponent = categoryIcons[category] || MoreIcon;
    return <IconComponent />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchDashboardData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const {
    accounts = [],
    recentTransactions = [],
    budgets = [],
    summary = {},
  } = dashboardData || {};

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const monthlyIncome = summary.monthlyIncome || 0;
  const monthlyExpenses = summary.monthlyExpenses || 0;
  const netWorth = totalBalance;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Balance
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(totalBalance)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AccountBalanceIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Monthly Income
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(monthlyIncome)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Monthly Expenses
                  </Typography>
                  <Typography variant="h5" component="div">
                    {formatCurrency(monthlyExpenses)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <TrendingDownIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              color: 'white',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Savings Rate
                  </Typography>
                  <Typography variant="h5" component="div">
                    {savingsRate.toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <SavingsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Accounts Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Accounts Overview"
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/accounts')}
                >
                  Add Account
                </Button>
              }
            />
            <CardContent>
              {accounts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No accounts found. Create your first account to get started.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/accounts')}
                  >
                    Add Account
                  </Button>
                </Box>
              ) : (
                <Box>
                  {accounts.slice(0, 4).map((account) => (
                    <Box
                      key={account.account_id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {getAccountTypeIcon(account.account_type)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {account.account_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {account.account_type}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: account.balance >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(account.balance)}
                      </Typography>
                    </Box>
                  ))}
                  {accounts.length > 4 && (
                    <Button
                      fullWidth
                      variant="text"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/accounts')}
                    >
                      View All Accounts ({accounts.length})
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Recent Transactions"
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/transactions')}
                >
                  Add Transaction
                </Button>
              }
            />
            <CardContent>
              {recentTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No transactions found. Start tracking your finances!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/transactions')}
                  >
                    Add Transaction
                  </Button>
                </Box>
              ) : (
                <Box>
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <Box
                      key={transaction.transaction_id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          {getCategoryIcon(transaction.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {transaction.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.category} • {format(new Date(transaction.transaction_date), 'MMM dd')}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Typography>
                    </Box>
                  ))}
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/transactions')}
                  >
                    View All Transactions
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Budget Overview"
              action={
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/budgets')}
                >
                  Create Budget
                </Button>
              }
            />
            <CardContent>
              {budgets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No budgets found. Create budgets to track your spending goals.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/budgets')}
                  >
                    Create Budget
                  </Button>
                </Box>
              ) : (
                <Box>
                  {budgets.slice(0, 3).map((budget) => {
                    const progress = budget.budget_limit > 0 ? (budget.spent_amount / budget.budget_limit) * 100 : 0;
                    const isOverBudget = progress > 100;
                    
                    return (
                      <Box
                        key={budget.budget_id}
                        sx={{
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">{budget.category}</Typography>
                          <Chip
                            label={`${progress.toFixed(0)}%`}
                            size="small"
                            color={isOverBudget ? 'error' : progress > 80 ? 'warning' : 'success'}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.budget_limit)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(budget.budget_limit - budget.spent_amount)} remaining
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            backgroundColor: 'grey.200',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(progress, 100)}%`,
                              height: '100%',
                              backgroundColor: isOverBudget ? 'error.main' : progress > 80 ? 'warning.main' : 'success.main',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                  {budgets.length > 3 && (
                    <Button
                      fullWidth
                      variant="text"
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/budgets')}
                    >
                      View All Budgets ({budgets.length})
                    </Button>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Expense Breakdown"
              subheader="Current month"
              action={
                <IconButton onClick={() => navigate('/reports')}>
                  <PieChartIcon />
                </IconButton>
              }
            />
            <CardContent>
              {summary.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={summary.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {summary.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PieChartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No expense data available for this month
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/transactions/new')}
                  sx={{ py: 1.5 }}
                >
                  Add Transaction
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalanceIcon />}
                  onClick={() => navigate('/accounts/new')}
                  sx={{ py: 1.5 }}
                >
                  Add Account
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PieChartIcon />}
                  onClick={() => navigate('/budgets/new')}
                  sx={{ py: 1.5 }}
                >
                  Create Budget
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TimelineIcon />}
                  onClick={() => navigate('/reports')}
                  sx={{ py: 1.5 }}
                >
                  View Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;