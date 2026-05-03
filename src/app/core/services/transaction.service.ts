import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string; // 新增幣別欄位
  date: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  private readonly storageKey = 'transactions';

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    // 每次重新整理或進入應用程式時，先嘗試從 LocalStorage 讀取
    const storedTransactions = localStorage.getItem(this.storageKey);
    
    if (storedTransactions) {
      try {
        const parsed = JSON.parse(storedTransactions);
        // 如果 LocalStorage 有資料且不為空，直接使用
        if (parsed.length > 0) {
          this.transactionsSubject.next(parsed);
          return;
        }
      } catch (error) {
        console.error('Error parsing stored transactions:', error);
        // 如果解析失敗，清除無效資料並繼續載入 Mock
        localStorage.removeItem(this.storageKey);
      }
    }

    // 如果 LocalStorage 沒資料或為空，則 Call API (讀取 Mock)
    this.loadMockData();
  }

  private loadMockData(): void {
    this.http.get<Transaction[]>('assets/mock/transaction/transactions.json')
      .subscribe({
        next: (data) => {
          this.saveToLocalStorage(data);
        },
        error: (err) => console.error('Failed to load mock data', err)
      });
  }

  private saveToLocalStorage(transactions: Transaction[]): void {
    // 確保存入時每筆交易都有 currency 欄位，若沒有則補上 'TWD'
    const transactionsWithCurrency = transactions.map(t => ({
      ...t,
      currency: t.currency || 'TWD'
    }));
    localStorage.setItem(this.storageKey, JSON.stringify(transactionsWithCurrency));
    this.transactionsSubject.next(transactionsWithCurrency);
  }

  getTransactions(): Observable<Transaction[]> {
    // 讀取時也做一次防呆，確保舊資料有 currency
    return this.transactionsSubject.asObservable().pipe(
      map(transactions => transactions.map(t => ({
        ...t,
        currency: t.currency || 'TWD'
      })))
    );
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return this.getTransactions().pipe(
      map(transactions => transactions.find(t => t.id === id))
    );
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const currentTransactions = this.transactionsSubject.getValue();
    const newTransaction: Transaction = {
      ...transaction,
      id: new Date().getTime().toString() // Simple unique ID
    };
    const updatedTransactions = [...currentTransactions, newTransaction];
    this.saveToLocalStorage(updatedTransactions);
  }

  replaceTransactions(transactions: Transaction[]): void {
    this.saveToLocalStorage(transactions);
  }

  updateTransaction(updatedTransaction: Transaction): void {
    const currentTransactions = this.transactionsSubject.getValue();
    const index = currentTransactions.findIndex(t => t.id === updatedTransaction.id);
    if (index > -1) {
      const updatedTransactions = [...currentTransactions];
      updatedTransactions[index] = updatedTransaction;
      this.saveToLocalStorage(updatedTransactions);
    }
  }

  deleteTransaction(id: string): void {
    const currentTransactions = this.transactionsSubject.getValue();
    const updatedTransactions = currentTransactions.filter(t => t.id !== id);
    this.saveToLocalStorage(updatedTransactions);
  }
}
