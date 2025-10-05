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

const OCRReceiptUpload = ({ onTransactionCreate, accounts, categories }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
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
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
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
      setOcrResult(null);
    }
  };

  const processReceipt = async () => {
    if (!file) {
      toast.error('Please select a receipt image first');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      console.log('📤 Starting Mock OCR workflow: Processing receipt with JSON structure...');
      
      // Use the mock OCR endpoint that returns extracted text from JSON structure
      const response = await fetch('/api/v1/mock-ocr/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Mock OCR processing completed:', result);
      
      if (result.success) {
        // Store the OCR result with extracted text
        setOcrResult({
          // Main extracted text data
          text: result.data.text,
          extractedText: result.data.extractedText,
          raw_text: result.data.raw_text,
          
          // Parsed receipt data
          merchant_name: result.data.merchant_name,
          amount: result.data.amount,
          confidence_score: result.data.confidence_score,
          
          // Additional data
          items: result.data.items || [],
          word_count: result.data.word_count,
          processedAt: result.data.processedAt,
          
          // For UI display
          fullOcrResponse: result.data.fullOcrResponse
        });
        
        // Pre-fill transaction form with parsed OCR data
        setTransactionData({
          accountId: '',
          categoryId: '',
          amount: result.data.amount?.toString() || '',
          description: result.data.merchant_name || '',
          date: result.data.transaction_date || new Date().toISOString().split('T')[0],
          notes: `Receipt processed from: ${file.name}\nExtracted Text:\n${result.data.text}\n\nItems: ${result.data.items?.length || 0} found`
        });
        
        // Show confirmation dialog
        setConfirmDialogOpen(true);
        
        toast.success('Receipt processed successfully with Mock OCR!');
        console.log('� Extracted Text:', result.data.text);
        console.log('🏪 Merchant:', result.data.merchant_name);
        console.log('💰 Amount:', result.data.amount);
        
      } else {
        throw new Error(result.message || 'OCR processing failed');
      }
    } catch (error) {
      console.error('Mock OCR processing error:', error);
      toast.error(error.message || 'Failed to process receipt');
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
        amount: parseFloat(transactionData.amount),
        receipt_id: ocrResult?.receipt_id
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
    setOcrResult(null);
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
      <Card sx={{ borderRadius: 3, border: '2px dashed', borderColor: 'primary.main', mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Stack spacing={2} alignItems="center">
            <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            
            <Typography variant="h6" fontWeight="bold">
              Upload Receipt for OCR Processing
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Upload a receipt image and let AI extract transaction details
            </Typography>

            {!file && (
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{ mt: 2 }}
              >
                Select Receipt Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
            )}

            {file && (
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <Stack spacing={2}>
                  {/* File preview */}
                  <Box sx={{ textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 200,
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {file.name}
                    </Typography>
                  </Box>

                  {/* Action buttons */}
                  <Stack direction="row" spacing={2} justifyContent="center">
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
                </Stack>
              </Box>
            )}

            {/* OCR Results Preview */}
            {ocrResult && (
              <Alert
                icon={<CheckIcon />}
                severity="success"
                sx={{ width: '100%', mt: 2 }}
              >
                <Typography variant="body2" fontWeight="bold">
                  Receipt Processed Successfully!
                </Typography>
                
                {/* Display the extracted text prominently */}
                {ocrResult.text && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                      📄 Extracted Text:
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {ocrResult.text}
                    </Typography>
                  </Box>
                )}
                
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {ocrResult.merchant_name && (
                    <Chip label={`Store: ${ocrResult.merchant_name}`} size="small" />
                  )}
                  {ocrResult.amount && (
                    <Chip label={`Amount: $${ocrResult.amount}`} size="small" color="primary" />
                  )}
                  {ocrResult.confidence_score && (
                    <Chip 
                      label={`Confidence: ${Math.round(ocrResult.confidence_score * 100)}%`} 
                      size="small" 
                      color={ocrResult.confidence_score > 0.8 ? 'success' : 'warning'}
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

export default OCRReceiptUpload;