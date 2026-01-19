/**
 * AWS Textract Service
 * 
 * Provides document processing capabilities:
 * - Invoice/receipt OCR
 * - Form data extraction
 * - Table extraction from documents
 */

import {
  TextractClient,
  AnalyzeDocumentCommand,
  AnalyzeExpenseCommand,
  DetectDocumentTextCommand,
  FeatureType,
} from '@aws-sdk/client-textract';

const AWS_REGION = process.env.AWS_TEXTRACT_REGION || process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'indigo-media-assets';

let textractClient: TextractClient | null = null;

function getTextractClient(): TextractClient {
  if (!textractClient) {
    textractClient = new TextractClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return textractClient;
}

export interface TextExtractionResult {
  success: boolean;
  text?: string;
  lines?: Array<{ text: string; confidence: number }>;
  error?: string;
}

export interface InvoiceData {
  success: boolean;
  vendorName?: string;
  vendorAddress?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  subtotal?: string;
  tax?: string;
  total?: string;
  currency?: string;
  lineItems?: Array<{
    description: string;
    quantity?: string;
    unitPrice?: string;
    amount?: string;
  }>;
  error?: string;
}

export interface FormData {
  success: boolean;
  fields: Record<string, string>;
  tables?: Array<{
    rows: string[][];
  }>;
  error?: string;
}

/**
 * Extract text from a document
 */
export async function extractText(
  documentSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<TextExtractionResult> {
  if (!process.env.AWS_TEXTRACT_ENABLED) {
    return { success: false, error: 'AWS Textract is not enabled' };
  }

  const client = getTextractClient();
  const documentParam = 's3Key' in documentSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: documentSource.s3Key } }
    : { Bytes: documentSource.bytes };

  try {
    const response = await client.send(new DetectDocumentTextCommand({
      Document: documentParam,
    }));

    const lines = (response.Blocks || [])
      .filter(block => block.BlockType === 'LINE')
      .map(block => ({
        text: block.Text || '',
        confidence: block.Confidence || 0,
      }));

    const fullText = lines.map(l => l.text).join('\n');

    return {
      success: true,
      text: fullText,
      lines,
    };
  } catch (error) {
    console.error('[AWS Textract] Text extraction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Text extraction failed',
    };
  }
}

/**
 * Analyze an invoice or receipt
 */
export async function analyzeInvoice(
  documentSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<InvoiceData> {
  if (!process.env.AWS_TEXTRACT_ENABLED) {
    return { success: false, error: 'AWS Textract is not enabled' };
  }

  const client = getTextractClient();
  const documentParam = 's3Key' in documentSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: documentSource.s3Key } }
    : { Bytes: documentSource.bytes };

  try {
    const response = await client.send(new AnalyzeExpenseCommand({
      Document: documentParam,
    }));

    const result: InvoiceData = { success: true, lineItems: [] };

    // Process expense documents
    for (const doc of response.ExpenseDocuments || []) {
      // Extract summary fields
      for (const field of doc.SummaryFields || []) {
        const fieldType = field.Type?.Text?.toUpperCase();
        const value = field.ValueDetection?.Text;

        if (!value) continue;

        switch (fieldType) {
          case 'VENDOR_NAME':
            result.vendorName = value;
            break;
          case 'VENDOR_ADDRESS':
            result.vendorAddress = value;
            break;
          case 'INVOICE_RECEIPT_ID':
            result.invoiceNumber = value;
            break;
          case 'INVOICE_RECEIPT_DATE':
            result.invoiceDate = value;
            break;
          case 'DUE_DATE':
            result.dueDate = value;
            break;
          case 'SUBTOTAL':
            result.subtotal = value;
            break;
          case 'TAX':
            result.tax = value;
            break;
          case 'TOTAL':
            result.total = value;
            break;
        }
      }

      // Extract line items
      for (const lineItemGroup of doc.LineItemGroups || []) {
        for (const lineItem of lineItemGroup.LineItems || []) {
          const item: { description: string; quantity?: string; unitPrice?: string; amount?: string } = { description: '' };

          for (const field of lineItem.LineItemExpenseFields || []) {
            const fieldType = field.Type?.Text?.toUpperCase();
            const value = field.ValueDetection?.Text;

            if (!value) continue;

            switch (fieldType) {
              case 'ITEM':
              case 'DESCRIPTION':
                item.description = value;
                break;
              case 'QUANTITY':
                item.quantity = value;
                break;
              case 'UNIT_PRICE':
                item.unitPrice = value;
                break;
              case 'PRICE':
              case 'AMOUNT':
                item.amount = value;
                break;
            }
          }

          if (item.description) {
            result.lineItems!.push(item);
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('[AWS Textract] Invoice analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invoice analysis failed',
    };
  }
}

/**
 * Analyze a form document and extract key-value pairs
 */
export async function analyzeForm(
  documentSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<FormData> {
  if (!process.env.AWS_TEXTRACT_ENABLED) {
    return { success: false, fields: {}, error: 'AWS Textract is not enabled' };
  }

  const client = getTextractClient();
  const documentParam = 's3Key' in documentSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: documentSource.s3Key } }
    : { Bytes: documentSource.bytes };

  try {
    const response = await client.send(new AnalyzeDocumentCommand({
      Document: documentParam,
      FeatureTypes: [FeatureType.FORMS, FeatureType.TABLES],
    }));

    const blocks = response.Blocks || [];
    const blockMap = new Map<string, typeof blocks[0]>();
    for (const b of blocks) {
      if (b.Id) blockMap.set(b.Id, b);
    }
    const fields: Record<string, string> = {};
    const tables: Array<{ rows: string[][] }> = [];

    // Extract key-value pairs
    for (const block of blocks) {
      if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes?.includes('KEY')) {
        const keyText = getTextFromBlock(block, blockMap);
        const valueBlock = blocks.find(
          b => b.BlockType === 'KEY_VALUE_SET' &&
               b.EntityTypes?.includes('VALUE') &&
               block.Relationships?.some(r => r.Type === 'VALUE' && r.Ids?.includes(b.Id || ''))
        );
        
        if (valueBlock) {
          const valueText = getTextFromBlock(valueBlock, blockMap);
          if (keyText && valueText) {
            fields[keyText] = valueText;
          }
        }
      }
    }

    // Extract tables
    for (const block of blocks) {
      if (block.BlockType === 'TABLE') {
        const table = extractTable(block, blockMap);
        if (table.rows.length > 0) {
          tables.push(table);
        }
      }
    }

    return {
      success: true,
      fields,
      tables: tables.length > 0 ? tables : undefined,
    };
  } catch (error) {
    console.error('[AWS Textract] Form analysis failed:', error);
    return {
      success: false,
      fields: {},
      error: error instanceof Error ? error.message : 'Form analysis failed',
    };
  }
}

/**
 * Process a supplier invoice and create purchase order data
 */
export async function processSupplierInvoice(s3Key: string): Promise<{
  success: boolean;
  purchaseOrder?: {
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
  };
  error?: string;
}> {
  const invoiceData = await analyzeInvoice({ s3Key });

  if (!invoiceData.success) {
    return { success: false, error: invoiceData.error };
  }

  // Parse numeric values
  const parseAmount = (str?: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const items = (invoiceData.lineItems || []).map(item => ({
    name: item.description,
    quantity: parseAmount(item.quantity) || 1,
    unitPrice: parseAmount(item.unitPrice),
    total: parseAmount(item.amount),
  }));

  return {
    success: true,
    purchaseOrder: {
      supplierName: invoiceData.vendorName || 'Unknown Supplier',
      invoiceNumber: invoiceData.invoiceNumber || '',
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString(),
      items,
      subtotal: parseAmount(invoiceData.subtotal),
      tax: parseAmount(invoiceData.tax),
      total: parseAmount(invoiceData.total),
    },
  };
}

/**
 * Check if AWS Textract is available
 */
export async function isTextractAvailable(): Promise<boolean> {
  if (!process.env.AWS_TEXTRACT_ENABLED) {
    return false;
  }

  try {
    // Simple check - we can't really test without a document
    getTextractClient();
    return true;
  } catch {
    return false;
  }
}

// Helper functions
function getTextFromBlock<T extends { Relationships?: Array<{ Type?: string; Ids?: string[] }> }>(
  block: T,
  blockMap: Map<string, { BlockType?: string; Text?: string; Relationships?: Array<{ Type?: string; Ids?: string[] }> }>
): string {
  const childIds = block.Relationships?.find(r => r.Type === 'CHILD')?.Ids || [];
  return childIds
    .map(id => blockMap.get(id))
    .filter(b => b?.BlockType === 'WORD')
    .map(b => b?.Text || '')
    .join(' ');
}

function extractTable<T extends { Relationships?: Array<{ Type?: string; Ids?: string[] }> }>(
  tableBlock: T,
  blockMap: Map<string, { BlockType?: string; RowIndex?: number; ColumnIndex?: number; Relationships?: Array<{ Type?: string; Ids?: string[] }> }>
): { rows: string[][] } {
  const cellIds = tableBlock.Relationships?.find(r => r.Type === 'CHILD')?.Ids || [];
  const cells = cellIds.map(id => blockMap.get(id)).filter((c): c is NonNullable<typeof c> => c !== undefined);
  
  const maxRow = Math.max(0, ...cells.map(c => c.RowIndex || 0));
  const maxCol = Math.max(0, ...cells.map(c => c.ColumnIndex || 0));
  
  if (maxRow === 0 || maxCol === 0) {
    return { rows: [] };
  }
  
  const rows: string[][] = Array.from({ length: maxRow }, () => 
    Array.from({ length: maxCol }, () => '')
  );

  for (const cell of cells) {
    if (cell.RowIndex && cell.ColumnIndex) {
      const text = getTextFromBlock(cell, blockMap);
      rows[cell.RowIndex - 1][cell.ColumnIndex - 1] = text;
    }
  }

  return { rows };
}
