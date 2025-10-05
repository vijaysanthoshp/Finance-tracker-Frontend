import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://financetraker-backend-bafucshrcngbhdb6.centralindia-01.azurewebsites.net/api/v1',
  timeout: 30000, // Increased timeout for Azure App Service cold starts
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for Azure CORS with credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add debug logging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses and errors
api.interceptors.response.use(
  (response) => {
    // Add debug logging for successful responses
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Add debug logging for errors
    console.error('API Error:', {
      url: error.config?.url,
      status: response?.status,
      message: response?.data?.message,
      error: error.message
    });
    
    // Handle different error scenarios
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - remove token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 422:
          // Validation errors
          if (response.data?.errors) {
            const errorMessages = Object.values(response.data.errors).flat();
            errorMessages.forEach(message => toast.error(message));
          } else {
            toast.error(response.data?.message || 'Validation error occurred.');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(response.data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your internet connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  verify: () => api.get('/auth/verify'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  deleteAccount: () => api.delete('/users/profile'),
};

export const accountAPI = {
  // Get all user accounts  
  getAccounts: () => api.get('/accounts'),
  
  // Get account types for dropdown
  getTypes: () => api.get('/accounts/types'),
  
  // Get specific account by ID
  getById: (id) => api.get(`/accounts/${id}`),
  
  // Create new account
  create: (data) => {
    // Transform frontend data to match backend expectations
    const backendData = {
      accountName: data.name || data.accountName,
      accountTypeId: data.typeId || data.accountTypeId,
      initialBalance: data.initialBalance || data.initial_balance || 0,
      accountNumber: data.accountNumber || data.account_number || null,
      description: data.description || data.notes || null
    };
    return api.post('/accounts', backendData);
  },
  
  // Update existing account
  update: (id, data) => {
    const backendData = {
      accountName: data.name || data.accountName,
      description: data.description || data.notes
    };
    return api.put(`/accounts/${id}`, backendData);
  },
  
  // Delete account
  delete: (id) => api.delete(`/accounts/${id}`),
  
  // Get account balance
  getBalance: (id) => api.get(`/accounts/${id}/balance`),
};

export const transactionAPI = {
  // Get all user transactions with optional filters
  getTransactions: (params = {}) => api.get('/transactions', { params }),
  
  // Get specific transaction by ID
  getById: (id) => api.get(`/transactions/${id}`),
  
  // Create new transaction
  create: (data) => {
    // Transform frontend data to match backend expectations
    const dateValue = data.date || data.transactionDate || data.transaction_date;
    // Ensure date is in YYYY-MM-DD format for the backend
    const formattedDate = dateValue ? 
      (dateValue.includes('T') ? dateValue.split('T')[0] : dateValue) : 
      new Date().toISOString().split('T')[0];

    const backendData = {
      accountId: data.accountId || data.account_id,
      categoryId: data.categoryId || data.category_id,
      transactionType: (data.type || data.transactionType || data.transaction_type).toUpperCase(),
      amount: Math.abs(parseFloat(data.amount)),
      description: data.description,
      transactionDate: formattedDate,
      notes: data.notes || null
    };
    
    console.log('Sending transaction data to backend:', backendData);
    return api.post('/transactions', backendData);
  },
  
  // Update existing transaction
  update: (id, data) => {
    const backendData = {
      categoryId: data.categoryId || data.category_id,
      transactionType: (data.type || data.transactionType || data.transaction_type).toUpperCase(),
      amount: Math.abs(parseFloat(data.amount)),
      description: data.description,
      transactionDate: data.date || data.transactionDate || data.transaction_date,
      notes: data.notes
    };
    return api.put(`/transactions/${id}`, backendData);
  },
  
  // Delete transaction
  delete: (id) => api.delete(`/transactions/${id}`),
  
  // Get transaction categories
  getCategories: () => api.get('/transactions/categories'),
  
  // Search transactions
  search: (query, params) => api.get('/transactions/search', { params: { query, ...params } }),
};

export const budgetAPI = {
  // Get all user budgets
  getBudgets: (params) => api.get('/budgets', { params }),
  
  // Get specific budget by ID  
  getById: (id) => api.get(`/budgets/${id}`),
  
  // Create new budget
  create: (data) => api.post('/budgets', data),
  
  // Update existing budget
  update: (id, data) => api.put(`/budgets/${id}`, data),
  
  // Delete budget
  delete: (id) => api.delete(`/budgets/${id}`),
  
  // Get budget progress
  getProgress: (id) => api.get(`/budgets/${id}/progress`),
  
  // Get budget alerts
  getAlerts: () => api.get('/budgets/alerts'),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSpendingByCategory: (params) => api.get('/reports/spending-by-category', { params }),
  getIncomeVsExpenses: (params) => api.get('/reports/income-vs-expenses', { params }),
  getMonthlyTrends: (params) => api.get('/reports/monthly-trends', { params }),
  getNetWorth: (params) => api.get('/reports/net-worth', { params }),
  getBudgetPerformance: (params) => api.get('/reports/budget-performance', { params }),
  getCashFlow: (params) => api.get('/reports/cash-flow', { params }),
  exportData: (params) => api.get('/reports/export', { params, responseType: 'blob' }),
};

// Utility functions
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const downloadFile = (url, filename) => {
  return api.get(url, {
    responseType: 'blob',
  }).then(response => {
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  });
};

export default api;
