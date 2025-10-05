import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const SimpleOCRDisplay = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const sampleJsonText = `{
    "status": "succeeded",
    "createdDateTime": "2025-10-04T19:37:03Z",
    "lastUpdatedDateTime": "2025-10-04T19:37:04Z",
    "analyzeResult": {
        "version": "3.2.0",
        "modelVersion": "2022-04-30",
        "readResults": [
            {
                "page": 1,
                "angle": 0,
                "width": 676,
                "height": 1288,
                "unit": "pixel",
                "lines": [
                    {
                        "boundingBox": [217, 140, 461, 139, 461, 185, 217, 186],
                        "text": "RECEIPT",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [217, 141, 451, 140, 450, 186, 217, 186],
                                "text": "RECEIPT",
                                "confidence": 0.994
                            }
                        ]
                    },
                    {
                        "boundingBox": [85, 290, 286, 291, 286, 321, 85, 318],
                        "text": "1x Lorem ipsum",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [85, 290, 112, 291, 112, 318, 85, 318],
                                "text": "1x",
                                "confidence": 0.959
                            },
                            {
                                "boundingBox": [118, 291, 192, 292, 192, 319, 118, 318],
                                "text": "Lorem",
                                "confidence": 0.997
                            },
                            {
                                "boundingBox": [205, 292, 275, 291, 276, 322, 206, 319],
                                "text": "ipsum",
                                "confidence": 0.998
                            }
                        ]
                    },
                    {
                        "boundingBox": [460, 291, 479, 291, 480, 316, 462, 316],
                        "text": "$",
                        "appearance": {
                            "style": {
                                "name": "handwriting",
                                "confidence": 0.936
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [464, 291, 480, 291, 480, 316, 464, 316],
                                "text": "$",
                                "confidence": 0.995
                            }
                        ]
                    },
                    {
                        "boundingBox": [520, 289, 590, 291, 590, 319, 518, 317],
                        "text": "35.00",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [519, 289, 586, 291, 585, 319, 519, 317],
                                "text": "35.00",
                                "confidence": 0.997
                            }
                        ]
                    },
                    {
                        "boundingBox": [85, 333, 289, 334, 289, 365, 84, 364],
                        "text": "2x Lorem ipsum",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [86, 334, 115, 335, 114, 364, 85, 365],
                                "text": "2x",
                                "confidence": 0.998
                            },
                            {
                                "boundingBox": [120, 335, 193, 336, 193, 364, 119, 364],
                                "text": "Lorem",
                                "confidence": 0.997
                            },
                            {
                                "boundingBox": [207, 336, 278, 336, 278, 366, 207, 364],
                                "text": "ipsum",
                                "confidence": 0.997
                            }
                        ]
                    },
                    {
                        "boundingBox": [101, 652, 291, 652, 291, 675, 101, 675],
                        "text": "TOTAL AMOUNT",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [103, 653, 176, 654, 175, 676, 102, 674],
                                "text": "TOTAL",
                                "confidence": 0.998
                            },
                            {
                                "boundingBox": [183, 654, 288, 653, 288, 676, 183, 676],
                                "text": "AMOUNT",
                                "confidence": 0.997
                            }
                        ]
                    },
                    {
                        "boundingBox": [492, 653, 586, 653, 586, 675, 492, 676],
                        "text": "$ 117.00",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [492, 654, 505, 654, 505, 677, 492, 677],
                                "text": "$",
                                "confidence": 0.995
                            },
                            {
                                "boundingBox": [509, 654, 583, 653, 583, 675, 509, 676],
                                "text": "117.00",
                                "confidence": 0.996
                            }
                        ]
                    },
                    {
                        "boundingBox": [187, 924, 485, 923, 485, 963, 187, 964],
                        "text": "THANK YOU",
                        "appearance": {
                            "style": {
                                "name": "other",
                                "confidence": 0.972
                            }
                        },
                        "words": [
                            {
                                "boundingBox": [190, 924, 348, 924, 347, 963, 190, 964],
                                "text": "THANK",
                                "confidence": 0.998
                            },
                            {
                                "boundingBox": [377, 924, 469, 924, 469, 964, 377, 963],
                                "text": "YOU",
                                "confidence": 0.991
                            }
                        ]
                    }
                ]
            }
        ]
    }
}`;

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Immediately show the JSON text when file is selected - no API call
      setExtractedText(sampleJsonText);
    }
  };

  const clearUpload = () => {
    setFile(null);
    setExtractedText('');
    // Reset the file input
    document.getElementById('file-upload').value = '';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              🚀 SIMPLE JSON DISPLAY (NEW VERSION)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select any image file and JSON text will appear instantly - NO API CALLS
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ py: 2, fontSize: '1.1rem' }}
              >
                📁 SELECT FILE → JSON APPEARS INSTANTLY
              </Button>
            </label>
          </Box>

          {file && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ File selected: {file.name}
            </Alert>
          )}

          {extractedText && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📄 Extracted Text:
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: '#f8f9fa', 
                  borderRadius: 1, 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: 600,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  boxShadow: 1
                }}
              >
                {extractedText}
              </Box>
            </Box>
          )}

          {file && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" onClick={clearUpload} color="secondary">
                Clear
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SimpleOCRDisplay;