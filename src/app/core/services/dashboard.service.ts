import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface MonthlyTransaction {
  month: string;
  income: number;
  expense: number;
}

export interface AssetTrend {
  date: string;
  totalAssets: number;
  monthlyIncome?: number;
  monthlyExpense?: number;
  netWorth?: number;
  cash: number;
  investment: number;
  property: number;
  expenseBreakdown?: ExpenseCategory[];
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
  private readonly mockDashboardData = this.createMockDashboardData();
  private readonly mockMonthlyTransactions = this.createMockMonthlyTransactions(this.mockDashboardData.assetTrends);

  constructor(private apiService: ApiService) { }

  /**
   * 取得 Dashboard 資料（固定使用假資料）
   */
  getDashboardData(): Observable<ApiResponse<DashboardData>> {
    return this.apiService.mockRequest(true, this.mockDashboardData, 450);
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
      const fluctuation = ((i % 4) - 1.5) * 12000;
      const totalAssets = baseAsset + growth + fluctuation;
      const monthlyIncome = Math.round(90000 + i * 1200 + (i % 3) * 1800 - 1200);
      const monthlyExpense = Math.round(42000 + i * 650 + (i % 4) * 900 - 1200);
      const netWorth = Math.round(totalAssets * 0.73);
      const expenseBreakdown = this.generateExpenseBreakdown(i);

      trends.push({
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        totalAssets: Math.round(totalAssets),
        monthlyIncome,
        monthlyExpense,
        netWorth,
        cash: Math.round(totalAssets * 0.3),
        investment: Math.round(totalAssets * 0.45),
        property: Math.round(totalAssets * 0.25),
        expenseBreakdown
      });
    }

    return trends;
  }

  private createMockDashboardData(): DashboardData {
    const assetTrends = this.generateAssetTrends();
    const latestTrend = assetTrends.at(-1);
    const expenseBreakdown = latestTrend?.expenseBreakdown?.length
      ? latestTrend.expenseBreakdown
      : this.generateExpenseBreakdown();

    return {
      totalAssets: latestTrend?.totalAssets ?? 3150000,
      monthlyIncome: latestTrend?.monthlyIncome ?? 96000,
      monthlyExpense: latestTrend?.monthlyExpense ?? 46800,
      netWorth: latestTrend?.netWorth ?? 2290000,
      assetTrends,
      expenseBreakdown
    };
  }

  private createMockMonthlyTransactions(assetTrends: AssetTrend[]): MonthlyTransaction[] {
    return assetTrends
      .slice(-6)
      .map(item => ({
        month: item.date,
        income: item.monthlyIncome ?? 0,
        expense: item.monthlyExpense ?? 0
      }));
  }

  /**
   * 生成支出分類資料
   */
  private generateExpenseBreakdown(seed: number = 0): ExpenseCategory[] {
    const categories = [
      { category: '飲食', amount: 11800 + seed * 90 },
      { category: '交通', amount: 5200 + seed * 45 },
      { category: '娛樂', amount: 7600 + (seed % 3) * 320 },
      { category: '購物', amount: 6100 + (seed % 4) * 270 },
      { category: '醫療', amount: 2800 + (seed % 2) * 260 },
      { category: '教育', amount: 3900 + seed * 30 },
      { category: '其他', amount: 3200 + (seed % 5) * 180 }
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
    return this.apiService.mockRequest(true, this.mockMonthlyTransactions, 600);
  }
}
