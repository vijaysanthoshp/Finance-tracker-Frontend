import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { TrendingUp, PieChart, BarChart, DollarSign } from 'lucide-react';

const Reports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Financial Reports
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <TrendingUp size={48} color="#1976d2" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Income vs Expenses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your monthly income and expense trends
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <PieChart size={48} color="#1976d2" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Spending by Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See where your money goes each month
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <BarChart size={48} color="#1976d2" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Budget Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare actual spending vs budgeted amounts
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <DollarSign size={48} color="#1976d2" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Net Worth Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor your overall financial health
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          📊 Reports functionality coming soon! Your backend API is ready for data integration.
        </Typography>
      </Box>
    </Box>
  );
};

export default Reports;