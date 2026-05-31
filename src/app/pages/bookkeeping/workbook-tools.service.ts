import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Transaction } from '../../core/services/transaction.service';

export interface WorkbookPreview {
  fileName: string;
  sheetNames: string[];
  rowCount: number;
  previewRows: Array<Record<string, string | number | boolean | null>>;
}

export interface TransactionWorkbookImport {
  preview: WorkbookPreview;
  transactions: Transaction[];
}

@Injectable({ providedIn: 'root' })
export class WorkbookToolsService {
  exportWorkbook(fileName: string, sheets: Record<string, unknown[]>): void {
    const workbook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, rows]) => {
      const normalizedRows = rows.length > 0 ? rows : [{ note: 'No data available' }];
      const worksheet = XLSX.utils.json_to_sheet(normalizedRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
    });

    XLSX.writeFile(workbook, fileName);
  }

  async parseWorkbook(file: File): Promise<WorkbookPreview> {
    const rows = await this.readFirstSheet(file);

    return {
      fileName: file.name,
      sheetNames: rows.sheetNames,
      rowCount: rows.data.length,
      previewRows: rows.data.slice(0, 5).map(row => this.normalizeRow(row))
    };
  }

  async parseTransactionWorkbook(file: File): Promise<TransactionWorkbookImport> {
    const rows = await this.readFirstSheet(file);
    const transactions = rows.data
      .map((row, index) => this.toTransaction(row, index))
      .filter((transaction): transaction is Transaction => transaction !== null);

    const buffer = await file.arrayBuffer();
    return {
      preview: {
        fileName: file.name,
        sheetNames: rows.sheetNames,
        rowCount: rows.data.length,
        previewRows: rows.data.slice(0, 5).map(row => this.normalizeRow(row))
      },
      transactions
    };
  }

  private async readFirstSheet(file: File): Promise<{ sheetNames: string[]; data: Record<string, unknown>[] }> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

    return {
      sheetNames: workbook.SheetNames,
      data: firstSheet
        ? XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })
        : []
    };
  }

  private toTransaction(row: Record<string, unknown>, index: number): Transaction | null {
    const type = this.readString(row, ['type', '類型', 'transactionType']).toLowerCase();
    const normalizedType = type === 'income' || type === '收入'
      ? 'income'
      : type === 'expense' || type === '支出'
        ? 'expense'
        : null;

    const category = this.readString(row, ['category', '分類', '類別']);
    const amount = this.readNumber(row, ['amount', '金額']);
    const date = this.readString(row, ['date', '日期']);

    if (!normalizedType || !category || amount === null || !date) {
      return null;
    }

    return {
      id: this.readString(row, ['id', '編號']) || `imported-${Date.now()}-${index}`,
      type: normalizedType,
      category,
      amount,
      currency: this.readString(row, ['currency', '幣別']) || 'TWD',
      date,
      notes: this.readString(row, ['notes', '備註']) || undefined
    };
  }

  private readString(row: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
    }

    return '';
  }

  private readNumber(row: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }
    }

    return null;
  }

  private normalizeRow(row: Record<string, unknown>): Record<string, string | number | boolean | null> {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
          return [key, value];
        }

        if (value instanceof Date) {
          return [key, value.toISOString()];
        }

        return [key, JSON.stringify(value)];
      })
    );
  }
}