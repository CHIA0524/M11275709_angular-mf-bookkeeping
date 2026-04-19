import { Injectable } from '@angular/core';
import { Observable, switchMap, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService, ApiResponse } from './api.service';

export interface MonthlyTransaction {
  month: string;
  income: number;
  expense: number;
}

export interface AssetTrend {
  date: string;
  totalAssets: number;
  cash: number;
  investment: number;
  property: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface DashboardData {
  totalAssets: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netWorth: number;
  assetTrends: AssetTrend[];
  expenseBreakdown: ExpenseCategory[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  /**
   * 取得 Dashboard 資料 (從 JSON 讀取)
   */
  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.http.get<ApiResponse<DashboardData>>('assets/mock/dashboard/data.json').pipe(
      switchMap(apiResponse => {
        // 直接返回 API 格式的回應（已包含 rtnCode, rtnMsg, data）
        if (apiResponse.rtnCode === '000000' && apiResponse.data) {
          return of(apiResponse);
        } else {
          return this.apiService.mockRequest<DashboardData>(false, undefined, 1000);
        }
      })
    );
  }

  /**
   * 生成資產趨勢資料（12個月）
   */
  private generateAssetTrends(): AssetTrend[] {
    const trends: AssetTrend[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      
      // 模擬資產增長
      const baseAsset = 2500000;
      const growth = i * 30000;
      const fluctuation = Math.random() * 50000 - 25000;
      const totalAssets = baseAsset + growth + fluctuation;

      trends.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        totalAssets: Math.round(totalAssets),
        cash: Math.round(totalAssets * 0.3),
        investment: Math.round(totalAssets * 0.45),
        property: Math.round(totalAssets * 0.25)
      });
    }

    return trends;
  }

  /**
   * 生成支出分類資料
   */
  private generateExpenseBreakdown(): ExpenseCategory[] {
    const categories = [
      { category: '飲食', amount: 12500 },
      { category: '交通', amount: 5500 },
      { category: '娛樂', amount: 8000 },
      { category: '購物', amount: 6500 },
      { category: '醫療', amount: 3000 },
      { category: '教育', amount: 4000 },
      { category: '其他', amount: 3000 }
    ];

    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
    
    return categories.map(cat => ({
      ...cat,
      percentage: Math.round((cat.amount / total) * 100 * 100) / 100
    }));
  }

  /**
   * 取得月度交易資料
   */
  getMonthlyTransactions(): Observable<ApiResponse<MonthlyTransaction[]>> {
    const mockData: MonthlyTransaction[] = [
      { month: '01月', income: 85000, expense: 42500 },
      { month: '02月', income: 88000, expense: 45200 },
      { month: '03月', income: 85000, expense: 41800 },
      { month: '04月', income: 92000, expense: 48300 },
      { month: '05月', income: 85000, expense: 43100 },
      { month: '06月', income: 89000, expense: 46500 }
    ];

    return this.apiService.mockRequest(true, mockData, 600);
  }
}
