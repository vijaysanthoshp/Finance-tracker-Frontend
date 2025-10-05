import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon,
  LocalGasStation as GasIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { accountAPI, transactionAPI, budgetAPI } from '../../services/api';

// Calculate spending trends from actual user data
const calculateSpendingTrend = (transactions) => {
  if (!transactions || transactions.length === 0) return [];
  
  const monthlyData = {};
  const currentMonth = new Date().getMonth();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthlyData[monthNames[monthIndex]] = 0;
  }
  
  // Calculate actual spending per month
  transactions.forEach(transaction => {
    if ((transaction.transaction_type || transaction.type)?.toLowerCase() === 'expense') {
      const date = new Date(transaction.transaction_date || transaction.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[date.getMonth()];
      if (monthlyData.hasOwnProperty(monthName)) {
        monthlyData[monthName] += Math.abs(parseFloat(transaction.amount));
      }
    }
  });
  
  return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
};

const calculateCategorySpending = (transactions) => {
  if (!transactions || transactions.length === 0) return [];
  
  const categoryTotals = {};
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF8A65', '#BA68C8'];
  
  transactions.forEach(transaction => {
    if ((transaction.transaction_type || transaction.type)?.toLowerCase() === 'expense') {
      const category = transaction.category_name || transaction.category?.name || transaction.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(parseFloat(transaction.amount));
    }
  });
  
  return Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories
};

const StatCard = ({ title, value, change, changeType, icon, color }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 3,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s ease-in-out',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: `${color}20`,
                color: color,
              }}
            >
              {icon}
            </Box>
            <Chip
              icon={changeType === 'increase' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
              label={change}
              color={changeType === 'increase' ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Stack>
          
          <Typography variant="h4" fontWeight="bold" color="text.primary" mb={0.5}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};



const RecentTransaction = ({ transaction, index }) => {
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Food': <RestaurantIcon />,
      'Housing': <HomeIcon />,
      'Transportation': <GasIcon />,
      'Shopping': <ShoppingCartIcon />,
    };
    return iconMap[categoryName] || <AttachMoneyIcon />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <ListItem sx={{ px: 0, py: 1 }}>
        <ListItemIcon>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: transaction.type === 'INCOME' ? '#4CAF5020' : '#F4433620',
              color: transaction.type === 'INCOME' ? '#4CAF50' : '#F44336',
            }}
          >
            {getCategoryIcon(transaction.category)}
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={transaction.description}
          secondary={transaction.date}
          primaryTypographyProps={{ fontWeight: 500 }}
        />
        <ListItemSecondaryAction>
          <Typography
            variant="body2"
            fontWeight="600"
            color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
          >
            {transaction.type === 'INCOME' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </Typography>
        </ListItemSecondaryAction>
      </ListItem>
    </motion.div>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    accounts: [],
    recentTransactions: [],
    budgets: [],
    allTransactions: [], // Keep all transactions for calculations
  });
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Dashboard: Loading data...');
      
      // Load data from APIs
      const [accountsRes, transactionsRes, budgetsRes] = await Promise.all([
        accountAPI.getAccounts(),
        transactionAPI.getTransactions(), // Get all transactions for calculations
        budgetAPI.getBudgets(),
      ]);

      console.log('Dashboard: Raw API responses:');
      console.log('Accounts response:', accountsRes);
      console.log('Transactions response:', transactionsRes);
      console.log('Budgets response:', budgetsRes);

      // Debug: Check exact structure of responses
      console.log('Dashboard: Detailed response analysis:');
      console.log('transactionsRes structure:', {
        hasData: !!transactionsRes.data,
        hasTransactions: !!transactionsRes.data?.transactions,
        hasDataArray: !!transactionsRes.data?.data,
        isDataArray: Array.isArray(transactionsRes.data),
        dataKeys: transactionsRes.data ? Object.keys(transactionsRes.data) : 'no data'
      });

      // Debug the exact content of the data property
      console.log('Dashboard: Deep dive into transactionsRes.data:');
      console.log('transactionsRes.data type:', typeof transactionsRes.data);
      console.log('transactionsRes.data content:', transactionsRes.data);
      console.log('transactionsRes.data.data type:', typeof transactionsRes.data?.data);
      console.log('transactionsRes.data.data content:', transactionsRes.data?.data);
      
      // Try different extraction patterns with more detailed logging
      let allTransactions = [];
      if (Array.isArray(transactionsRes.data?.transactions)) {
        allTransactions = transactionsRes.data.transactions;
        console.log('Dashboard: Using transactionsRes.data.transactions', allTransactions.length, 'items');
      } else if (Array.isArray(transactionsRes.data?.data)) {
        allTransactions = transactionsRes.data.data;
        console.log('Dashboard: Using transactionsRes.data.data', allTransactions.length, 'items');
      } else if (Array.isArray(transactionsRes.data)) {
        allTransactions = transactionsRes.data;
        console.log('Dashboard: Using transactionsRes.data directly', allTransactions.length, 'items');
      } else if (transactionsRes.data && typeof transactionsRes.data === 'object') {
        // If it's an object, look for any array property
        const dataKeys = Object.keys(transactionsRes.data);
        console.log('Dashboard: Searching for array in data keys:', dataKeys);
        for (const key of dataKeys) {
          console.log(`Dashboard: Checking key "${key}":`, typeof transactionsRes.data[key], Array.isArray(transactionsRes.data[key]));
          if (Array.isArray(transactionsRes.data[key])) {
            allTransactions = transactionsRes.data[key];
            console.log(`Dashboard: Found array in key: ${key} with ${allTransactions.length} items`);
            break;
          }
        }
      }
      
      // If still empty, try to extract from nested data
      if (allTransactions.length === 0 && transactionsRes.data?.data && typeof transactionsRes.data.data === 'object') {
        console.log('Dashboard: Checking nested data structure...');
        const nestedDataKeys = Object.keys(transactionsRes.data.data);
        console.log('Dashboard: Nested data keys:', nestedDataKeys);
        for (const key of nestedDataKeys) {
          console.log(`Dashboard: Checking nested key "${key}":`, typeof transactionsRes.data.data[key], Array.isArray(transactionsRes.data.data[key]));
          if (Array.isArray(transactionsRes.data.data[key])) {
            allTransactions = transactionsRes.data.data[key];
            console.log(`Dashboard: Found array in nested key: ${key} with ${allTransactions.length} items`);
            break;
          }
        }
      }
      
      const accounts = Array.isArray(accountsRes.data?.data) ? accountsRes.data.data : 
                      Array.isArray(accountsRes.data) ? accountsRes.data : [];
      
      console.log('Dashboard: Final extracted data:');
      console.log('All transactions:', allTransactions);
      console.log('All transactions length:', allTransactions.length);
      console.log('First transaction sample:', allTransactions[0]);
      console.log('Accounts:', accounts);
      
      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.current_balance || acc.balance || 0), 0);
      console.log('Dashboard: Total balance calculated:', totalBalance);
      
      // Calculate current month's income and expenses
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      console.log('Dashboard: Current date info:', {
        fullDate: currentDate,
        month: currentMonth,
        year: currentYear,
        monthName: currentDate.toLocaleString('default', { month: 'long' })
      });
      
      // Show all transaction dates for debugging
      console.log('Dashboard: All transaction dates:');
      allTransactions.forEach((transaction, index) => {
        const dateField = transaction.transaction_date || transaction.date;
        const transactionDate = new Date(dateField);
        console.log(`Transaction ${index}:`, {
          original: dateField,
          parsed: transactionDate,
          month: transactionDate.getMonth(),
          year: transactionDate.getFullYear(),
          isValid: !isNaN(transactionDate.getTime())
        });
      });
      
      const monthlyTransactions = allTransactions.filter(transaction => {
        const dateField = transaction.transaction_date || transaction.date;
        const transactionDate = new Date(dateField);
        
        // Check if date is valid
        if (isNaN(transactionDate.getTime())) {
          console.log('Dashboard: Invalid date found:', dateField);
          return false;
        }
        
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        console.log('Transaction date check:', {
          date: dateField,
          parsed: transactionDate,
          isCurrentMonth: isCurrentMonth,
          transactionMonth: transactionDate.getMonth(),
          transactionYear: transactionDate.getFullYear()
        });
        return isCurrentMonth;
      });
      
      console.log('Dashboard: Monthly transactions found:', monthlyTransactions.length);
      console.log('Dashboard: Monthly transactions:', monthlyTransactions);
      
      const monthlyIncome = monthlyTransactions
        .filter(t => {
          const type = (t.transaction_type || t.type)?.toLowerCase();
          const isIncome = type === 'income';
          console.log('Transaction type check:', type, 'is income:', isIncome);
          return isIncome;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
        
      const monthlyExpenses = monthlyTransactions
        .filter(t => {
          const type = (t.transaction_type || t.type)?.toLowerCase();
          const isExpense = type === 'expense';
          console.log('Transaction type check:', type, 'is expense:', isExpense);
          return isExpense;
        })
        .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

      console.log('Dashboard: Monthly calculations:');
      console.log('Monthly income:', monthlyIncome);
      console.log('Monthly expenses:', monthlyExpenses);

      // Check if user is new (no accounts and no transactions)
      const isUserNew = accounts.length === 0 && allTransactions.length === 0;
      setIsNewUser(isUserNew);
      
      setDashboardData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        accounts,
        recentTransactions: allTransactions.slice(0, 5),
        budgets: budgetsRes.data?.data || budgetsRes.data || [],
        allTransactions,
      });
      
      console.log('Dashboard: Final dashboard data set:', {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        accountsCount: accounts.length,
        transactionsCount: allTransactions.length,
        isUserNew
      });
    } catch (error) {
      console.error('Dashboard: Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };



  // Sample recent transactions
  const sampleTransactions = [
    { id: 1, description: 'Grocery Shopping', amount: -85.50, type: 'EXPENSE', category: 'Food', date: '2 hours ago' },
    { id: 2, description: 'Salary Deposit', amount: 3200.00, type: 'INCOME', category: 'Income', date: '1 day ago' },
    { id: 3, description: 'Gas Station', amount: -45.20, type: 'EXPENSE', category: 'Transportation', date: '2 days ago' },
    { id: 4, description: 'Online Shopping', amount: -129.99, type: 'EXPENSE', category: 'Shopping', date: '3 days ago' },
    { id: 5, description: 'Rent Payment', amount: -1200.00, type: 'EXPENSE', category: 'Housing', date: '5 days ago' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Welcome back, {user?.firstName || 'User'}! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Here's your financial overview for today
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadDashboardData}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={`$${dashboardData.totalBalance.toFixed(2)}`}
            change="+5.2%"
            changeType="increase"
            icon={<AccountBalanceIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={`$${dashboardData.monthlyIncome.toFixed(2)}`}
            change="+12.5%"
            changeType="increase"
            icon={<TrendingUpIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={`$${dashboardData.monthlyExpenses.toFixed(2)}`}
            change="-8.3%"
            changeType="decrease"
            icon={<TrendingDownIcon fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Budget"
            value={`$${(dashboardData.monthlyIncome - dashboardData.monthlyExpenses).toFixed(2)}`}
            change="+15.8%"
            changeType="increase"
            icon={<AttachMoneyIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>



      {/* Charts and Recent Activity */}
      {isNewUser ? (
        /* New User Welcome */
        <Box textAlign="center" py={8}>
          <Typography variant="h4" fontWeight="bold" color="primary" mb={2}>
            Welcome to Your Financial Dashboard! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            Let's get you started on your financial journey
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <AccountBalanceIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Add Your First Account
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Connect your bank account or add a manual account to start tracking
                </Typography>
                <Button variant="contained" fullWidth onClick={() => navigate('/accounts')}>
                  Add Account
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <AddIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Record a Transaction
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Add your first income or expense to see insights
                </Typography>
                <Button variant="contained" color="success" fullWidth onClick={() => navigate('/transactions')}>
                  Add Transaction
                </Button>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Set Up Budgets
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Create budgets to track your spending goals
                </Typography>
                <Button variant="contained" color="warning" fullWidth>
                  Create Budget
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Grid container spacing={3}>
        {/* Spending Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Spending Trend
              </Typography>
              {calculateSpendingTrend(dashboardData.allTransactions).length > 0 ? (
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={calculateSpendingTrend(dashboardData.allTransactions)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '14px', fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '14px', fill: theme.palette.text.secondary }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, strokeWidth: 0, r: 6 }}
                      activeDot={{ r: 8, stroke: theme.palette.primary.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="85%">
                  <TrendingUpIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No spending data yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Add some transactions to see your spending trends
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '400px' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Spending by Category
              </Typography>
              {calculateCategorySpending(dashboardData.allTransactions).length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="70%">
                    <PieChart>
                      <Pie
                        data={calculateCategorySpending(dashboardData.allTransactions)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {calculateCategorySpending(dashboardData.allTransactions).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <Stack spacing={1} mt={2}>
                    {calculateCategorySpending(dashboardData.allTransactions).slice(0, 3).map((category, index) => (
                      <Stack key={index} direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                            }}
                          />
                          <Typography variant="body2">{category.name}</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="600">
                          ${category.value.toFixed(0)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="85%">
                  <PieChartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    No categories yet
                  </Typography>
                  <Typography variant="body2" color="text.disabled" textAlign="center">
                    Categorize your expenses to see spending breakdown
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Transactions
                </Typography>
                <Button variant="text" size="small">
                  View All
                </Button>
              </Stack>
              <List sx={{ width: '100%' }}>
                {dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.transaction_id || transaction.id || index}>
                      <RecentTransaction 
                        transaction={{
                          ...transaction,
                          id: transaction.transaction_id || transaction.id,
                          description: transaction.description,
                          amount: parseFloat(transaction.amount || 0),
                          type: transaction.transaction_type || transaction.type,
                          category: transaction.category,
                          date: new Date(transaction.transaction_date || transaction.date).toLocaleDateString()
                        }} 
                        index={index} 
                      />
                      {index < dashboardData.recentTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      No recent transactions
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Your recent transactions will appear here
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}
    </Box>
  );
};

export default Dashboard;