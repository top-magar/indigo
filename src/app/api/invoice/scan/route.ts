import { NextRequest, NextResponse } from 'next/server';
import { AIService, StorageService } from '@/infrastructure/services';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const aiService = new AIService();
    const storageService = new StorageService();

    // Upload to storage first (better for processing)
    const key = `invoices/${nanoid()}-${file.name}`;
    const uploadResult = await storageService.upload(
      buffer,
      key,
      'system', // System-level invoice processing
      {
        contentType: file.type,
        metadata: { originalName: file.name },
      }
    );

    let imageUrl: string;
    if (uploadResult.success && uploadResult.url) {
      imageUrl = uploadResult.url;
    } else {
      // Fall back to data URL for direct processing
      const base64 = buffer.toString('base64');
      imageUrl = `data:${file.type};base64,${base64}`;
    }

    // Extract text from invoice using AIService
    const result = await aiService.extractText(imageUrl);

    if (!result.success || !result.text) {
      return NextResponse.json(
        { error: result.error || 'Failed to extract invoice data' },
        { status: 500 }
      );
    }

    // Parse the extracted text into structured data
    const text = result.text;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Simple parsing logic (can be enhanced with AI)
    const parseAmount = (str: string): number => {
      const cleaned = str.replace(/[^0-9.-]/g, '');
      return parseFloat(cleaned) || 0;
    };

    // Extract key information
    let supplierName = 'Unknown Supplier';
    let invoiceNumber = '';
    let invoiceDate = new Date().toISOString().split('T')[0];
    const items: Array<{ name: string; quantity: number; unitPrice: number; total: number }> = [];
    let subtotal = 0;
    let tax = 0;
    let total = 0;

    // Look for common invoice patterns
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (line.includes('invoice') && line.includes('#')) {
        invoiceNumber = lines[i].match(/[#:]?\s*([A-Z0-9-]+)/i)?.[1] || '';
      }
      
      if (line.includes('date') && i + 1 < lines.length) {
        const dateMatch = lines[i + 1].match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
        if (dateMatch) invoiceDate = dateMatch[0];
      }
      
      if ((line.includes('vendor') || line.includes('supplier') || line.includes('from')) && i + 1 < lines.length) {
        supplierName = lines[i + 1];
      }
      
      if (line.includes('total') && !line.includes('subtotal')) {
        const amount = lines[i].match(/[\d,]+\.?\d*/)?.[0];
        if (amount) total = parseAmount(amount);
      }
      
      if (line.includes('subtotal')) {
        const amount = lines[i].match(/[\d,]+\.?\d*/)?.[0];
        if (amount) subtotal = parseAmount(amount);
      }
      
      if (line.includes('tax')) {
        const amount = lines[i].match(/[\d,]+\.?\d*/)?.[0];
        if (amount) tax = parseAmount(amount);
      }
    }

    // Extract line items (simplified - looks for quantity and price patterns)
    const itemPattern = /(\d+)\s+(.+?)\s+\$?([\d,]+\.?\d*)/;
    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        const [, qty, name, price] = match;
        const quantity = parseInt(qty);
        const unitPrice = parseAmount(price);
        items.push({
          name: name.trim(),
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        });
      }
    }

    return NextResponse.json({
      success: true,
      purchaseOrder: {
        supplierName,
        invoiceNumber,
        invoiceDate,
        items,
        subtotal: subtotal || items.reduce((sum, item) => sum + item.total, 0),
        tax,
        total: total || subtotal + tax,
      },
    });
  } catch (error) {
    console.error('[API] Invoice scan failed:', error);
    return NextResponse.json(
      { error: 'Invoice processing failed' },
      { status: 500 }
    );
  }
}
