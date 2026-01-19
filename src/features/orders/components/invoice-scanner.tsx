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
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-[var(--ds-gray-900)]">
          <Receipt className="h-4 w-4" />
          Invoice Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!invoice ? (
          <>
            <p className="text-sm text-[var(--ds-gray-600)]">
              Upload a supplier invoice to automatically extract order details using AWS Textract.
            </p>

            <div
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                ${dragActive 
                  ? 'border-[var(--ds-blue-500)] bg-[var(--ds-blue-100)]' 
                  : 'border-[var(--ds-gray-300)] hover:border-[var(--ds-gray-400)]'
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
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-blue-600)]" />
                  <p className="text-sm text-[var(--ds-gray-600)]">Processing invoice…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-[var(--ds-gray-400)]" />
                  <p className="text-sm text-[var(--ds-gray-600)]">
                    Drag and drop an invoice, or click to browse
                  </p>
                  <p className="text-xs text-[var(--ds-gray-500)]">
                    Supports images and PDF files
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-red-100)] text-[var(--ds-red-800)]">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-green-100)]">
              <Check className="h-4 w-4 text-[var(--ds-green-600)]" />
              <span className="text-sm text-[var(--ds-green-800)]">
                Invoice processed successfully
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-gray-100)]">
                <Building2 className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <div>
                  <p className="text-xs text-[var(--ds-gray-500)]">Supplier</p>
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    {invoice.supplierName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-gray-100)]">
                <FileText className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <div>
                  <p className="text-xs text-[var(--ds-gray-500)]">Invoice #</p>
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    {invoice.invoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-gray-100)]">
                <Calendar className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <div>
                  <p className="text-xs text-[var(--ds-gray-500)]">Date</p>
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    {invoice.invoiceDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-md bg-[var(--ds-gray-100)]">
                <DollarSign className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <div>
                  <p className="text-xs text-[var(--ds-gray-500)]">Total</p>
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                    {formatCurrency(invoice.total)}
                  </p>
                </div>
              </div>
            </div>

            {invoice.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--ds-gray-900)]">
                  Line Items ({invoice.items.length})
                </p>
                <div className="border border-[var(--ds-gray-200)] rounded-md divide-y divide-[var(--ds-gray-200)]">
                  {invoice.items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm">
                      <span className="text-[var(--ds-gray-800)] truncate flex-1">
                        {item.name}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        ×{item.quantity}
                      </Badge>
                      <span className="ml-2 text-[var(--ds-gray-600)] tabular-nums">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  {invoice.items.length > 5 && (
                    <div className="p-2 text-center text-sm text-[var(--ds-gray-500)]">
                      +{invoice.items.length - 5} more items
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInvoice(null)}
                className="flex-1"
              >
                Scan Another
              </Button>
              <Button
                size="sm"
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
