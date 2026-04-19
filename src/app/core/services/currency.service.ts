import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ExchangeRates {
  base: string;
  date: string;
  rates: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // 這裡使用一個公開的免費 API (Frankfurter)
  // 也可以切換成使用本地 mock 資料
  private readonly apiUrl = 'https://api.frankfurter.app/latest';
  private readonly mockUrl = 'assets/mock/currency/rates.json';

  constructor(private http: HttpClient) {}

  getRates(base: string = 'TWD'): Observable<ExchangeRates> {
    // 優先嘗試連線外部 API，失敗則使用本地 Mock 資料
    return this.http.get<ExchangeRates>(`${this.apiUrl}?from=${base}`).pipe(
      catchError(() => {
        console.warn('Failed to fetch from API, using mock data');
        return this.http.get<ExchangeRates>(this.mockUrl); 
      })
    );
  }
}

