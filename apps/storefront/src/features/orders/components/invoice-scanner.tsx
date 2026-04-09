'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Loader2, 
  Check, 
  AlertCircle,
  Receipt,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface InvoiceScannerProps {
  onInvoiceProcessed?: (data: ProcessedInvoice) => void;
}

interface ProcessedInvoice {
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export function InvoiceScanner({ onInvoiceProcessed }: InvoiceScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<ProcessedInvoice | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = async (file: File) => {
    if (!file.type.includes('image') && !file.type.includes('pdf')) {
      setError('Please upload an image or PDF file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/invoice/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process invoice');
      }

      const data = await response.json();
      
      if (data.success && data.purchaseOrder) {
        setInvoice(data.purchaseOrder);
        onInvoiceProcessed?.(data.purchaseOrder);
      } else {
        throw new Error(data.error || 'Failed to extract invoice data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Receipt className="h-4 w-4" />
          Invoice Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!invoice ? (
          <>
            <p className="text-sm text-muted-foreground">
              Upload a supplier invoice to automatically extract order details using AWS Textract.
            </p>

            <div
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${dragActive 
                  ? 'border-primary/70 bg-primary/10' 
                  : 'border-border hover:border-border'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing invoice…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop an invoice, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    Supports images and PDF files
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-700">
                Invoice processed successfully
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground/50">Supplier</p>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.supplierName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground/50">Invoice #</p>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.invoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground/50">Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {invoice.invoiceDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground/50">Total</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(invoice.total)}
                  </p>
                </div>
              </div>
            </div>

            {invoice.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Line Items ({invoice.items.length})
                </p>
                <div className="border border-border rounded-md divide-y divide-[var(--border)]">
                  {invoice.items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm">
                      <span className="text-muted-foreground truncate flex-1">
                        {item.name}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        ×{item.quantity}
                      </Badge>
                      <span className="ml-2 text-muted-foreground tabular-nums">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  {invoice.items.length > 5 && (
                    <div className="p-2 text-center text-sm text-muted-foreground/50">
                      +{invoice.items.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
               
                onClick={() => setInvoice(null)}
                className="flex-1"
              >
                Scan Another
              </Button>
              <Button
               
                onClick={() => onInvoiceProcessed?.(invoice)}
                className="flex-1"
              >
                Create Purchase Order
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
