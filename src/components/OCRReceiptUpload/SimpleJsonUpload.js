import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const SimpleJsonUpload = ({ onTransactionCreate, accounts, categories }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [jsonResult, setJsonResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Form data for transaction creation
  const [transactionData, setTransactionData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    description: '',
    date: '',
    notes: ''
  });

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Reset previous results
      setJsonResult(null);
    }
  };

  const processReceipt = async () => {
    if (!file) {
      toast.error('Please select a receipt image first');
      return;
    }

    setUploading(true);
    
    try {
      console.log('Processing file with JSON display...');
      
      // Simple JSON structure to display as extracted text
      const mockJsonData = {
        "merchant": "RECEIPT",
        "amount": 117.00,
        "date": new Date().toISOString().split('T')[0],
        "items": [
          {"description": "MILK 2% GAL", "price": 3.98},
          {"description": "BREAD WHITE", "price": 2.49},
          {"description": "EGGS LARGE DOZ", "price": 2.79},
          {"description": "APPLES 3LB BAG", "price": 4.99},
          {"description": "CHICKEN BREAST", "price": 8.75}
        ],
        "confidence": 0.95,
        "extractedText": "This is extracted text"
      };
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Display the JSON as extracted text
      setJsonResult({
        jsonText: JSON.stringify(mockJsonData, null, 2),
        extractedText: mockJsonData.extractedText,
        merchant_name: mockJsonData.merchant,
        amount: mockJsonData.amount,
        confidence_score: mockJsonData.confidence,
        items: mockJsonData.items,
        processedAt: new Date().toISOString()
      });

      // Pre-populate transaction form
      setTransactionData({
        accountId: '',
        categoryId: '',
        amount: mockJsonData.amount.toString(),
        description: mockJsonData.merchant,
        date: mockJsonData.date,
        notes: `File: ${file.name}\n\nExtracted JSON:\n${JSON.stringify(mockJsonData, null, 2)}`
      });

      setConfirmDialogOpen(true);
      toast.success('JSON text displayed successfully!');
      
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Failed to process file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      if (!transactionData.accountId || !transactionData.amount) {
        toast.error('Please fill in account and amount');
        return;
      }

      const transactionPayload = {
        ...transactionData,
        type: 'EXPENSE',
        amount: parseFloat(transactionData.amount)
      };

      // Call the parent's transaction creation handler
      if (onTransactionCreate) {
        await onTransactionCreate(transactionPayload);
      }

      // Close dialog and reset
      setConfirmDialogOpen(false);
      resetUpload();
      
      toast.success('Transaction created from receipt!');
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setJsonResult(null);
    setPreviewUrl(null);
    setTransactionData({
      accountId: '',
      categoryId: '',
      amount: '',
      description: '',
      date: '',
      notes: ''
    });
    
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Box>
      <Card
        sx={{
          border: '2px dashed',
          borderColor: file ? 'success.main' : 'primary.main',
          bgcolor: file ? 'success.50' : 'primary.50',
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ textAlign: 'center' }}>
              <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="primary" gutterBottom>
                Upload Receipt for JSON Text Display
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a receipt image and display JSON extracted text
              </Typography>
            </Box>

            {/* File Input */}
            <Box sx={{ width: '100%' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  Choose Receipt Image
                </Button>
              </label>
            </Box>

            {/* File Preview */}
            {file && (
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Stack spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Receipt preview"
                    sx={{
                      maxWidth: 200,
                      maxHeight: 200,
                      objectFit: 'contain',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {file.name}
                  </Typography>
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={uploading ? <CircularProgress size={16} /> : <AIIcon />}
                    onClick={processReceipt}
                    disabled={uploading}
                  >
                    {uploading ? 'Processing...' : 'Process Receipt'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={resetUpload}
                    disabled={uploading}
                  >
                    Clear
                  </Button>
                </Stack>
              </Box>
            )}

            {/* JSON Results Preview */}
            {jsonResult && (
              <Alert
                icon={<CheckIcon />}
                severity="success"
                sx={{ width: '100%', mt: 2 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Receipt Processed Successfully!
                </Typography>
                
                {/* Display the extracted text prominently */}
                {jsonResult.extractedText && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Extracted Text:
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', color: 'success.dark' }}>
                      {jsonResult.extractedText}
                    </Typography>
                  </Box>
                )}
                
                {/* Display the full JSON */}
                {jsonResult.jsonText && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      Complete JSON Data:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {jsonResult.jsonText}
                    </Typography>
                  </Box>
                )}
                
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {jsonResult.merchant_name && (
                    <Chip label={`Store: ${jsonResult.merchant_name}`} size="small" />
                  )}
                  {jsonResult.amount && (
                    <Chip label={`Amount: $${jsonResult.amount}`} size="small" color="primary" />
                  )}
                  {jsonResult.confidence_score && (
                    <Chip 
                      label={`Confidence: ${Math.round(jsonResult.confidence_score * 100)}%`} 
                      size="small" 
                      color={jsonResult.confidence_score > 0.8 ? 'success' : 'warning'}
                    />
                  )}
                </Stack>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Transaction Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">Create Transaction from Receipt</Typography>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Review and complete the transaction details extracted from your receipt:
            </Typography>

            <FormControl fullWidth required>
              <InputLabel>Account</InputLabel>
              <Select
                value={transactionData.accountId}
                onChange={(e) => setTransactionData(prev => ({ ...prev, accountId: e.target.value }))}
                label="Account"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.account_id} value={account.account_id}>
                    {account.account_name} ({account.account_type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={transactionData.categoryId}
                onChange={(e) => setTransactionData(prev => ({ ...prev, categoryId: e.target.value }))}
                label="Category"
              >
                {categories.filter(cat => cat.type === 'EXPENSE').map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              type="number"
              value={transactionData.amount}
              onChange={(e) => setTransactionData(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                startAdornment: '$'
              }}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={transactionData.description}
              onChange={(e) => setTransactionData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Date"
              type="date"
              value={transactionData.date}
              onChange={(e) => setTransactionData(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Notes"
              value={transactionData.notes}
              onChange={(e) => setTransactionData(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTransaction}
            startIcon={<CheckIcon />}
          >
            Create Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SimpleJsonUpload;