import { Injectable, signal } from '@angular/core';

export type SupportedLanguage = 'zh-TW' | 'en-US' | 'ja-JP';
export type TranslationKey = string;

export interface LanguageOption {
  code: SupportedLanguage;
  nativeLabel: string;
  englishLabel: string;
}

interface LanguageChangedDetail {
  sourceId: string;
  language: SupportedLanguage;
}

const translations: Record<SupportedLanguage, Record<string, string>> = {
  'zh-TW': {
    '帳目列表': '帳目列表',
    '查看、編輯或刪除您所有的記帳紀錄': '查看、編輯或刪除您所有的記帳紀錄',
    '分析頁': '分析頁',
    '重複交易': '重複交易',
    '審核頁': '審核頁',
    '對帳頁': '對帳頁',
    '資料來源': '資料來源',
    '本機交易服務': '本機交易服務',
    '檢查模式': '檢查模式',
    '支援審核與對帳': '支援審核與對帳',
    '匯入能力': '匯入能力',
    '可搭配 XLSX 流程': '可搭配 XLSX 流程',
    '收入': '收入',
    '支出': '支出',
    '筆數': '筆數',
    '來源': '來源',
    '延遲': '延遲',
    '淨值': '淨值',
    '日期': '日期',
    '類型': '類型',
    '分類': '分類',
    '金額': '金額',
    '幣別': '幣別',
    '備註': '備註',
    '還沒有任何記帳紀錄。': '還沒有任何記帳紀錄。',
    '關鍵字': '關鍵字',
    '全部': '全部',
    '最低金額': '最低金額',
    '排序欄位': '排序欄位',
    '排序方向': '排序方向',
    '由大到小 / 由新到舊': '由大到小 / 由新到舊',
    '由小到大 / 由舊到新': '由小到大 / 由舊到新',
    '分組方式': '分組方式',
    '月份': '月份',
    '清除條件': '清除條件',
    '您確定要刪除這筆帳目嗎?': '您確定要刪除這筆帳目嗎?'
  },
  'en-US': {
    '帳目列表': 'Transaction list',
    '查看、編輯或刪除您所有的記帳紀錄': 'Review, edit, or remove all of your transaction records',
    '分析頁': 'Analytics',
    '重複交易': 'Recurring',
    '審核頁': 'Review',
    '對帳頁': 'Reconciliation',
    '資料來源': 'Data source',
    '本機交易服務': 'Local transaction service',
    '檢查模式': 'Inspection mode',
    '支援審核與對帳': 'Supports review and reconciliation',
    '匯入能力': 'Import capability',
    '可搭配 XLSX 流程': 'Works with the XLSX workflow',
    '收入': 'Income',
    '支出': 'Expense',
    '筆數': 'Records',
    '來源': 'Source',
    '延遲': 'Latency',
    '淨值': 'Net worth',
    '日期': 'Date',
    '類型': 'Type',
    '分類': 'Category',
    '金額': 'Amount',
    '幣別': 'Currency',
    '備註': 'Notes',
    '還沒有任何記帳紀錄。': 'No transactions yet.',
    '關鍵字': 'Keyword',
    '全部': 'All',
    '最低金額': 'Minimum amount',
    '排序欄位': 'Sort field',
    '排序方向': 'Sort direction',
    '由大到小 / 由新到舊': 'Descending / newest first',
    '由小到大 / 由舊到新': 'Ascending / oldest first',
    '分組方式': 'Group by',
    '月份': 'Month',
    '清除條件': 'Reset filters',
    '您確定要刪除這筆帳目嗎?': 'Are you sure you want to delete this transaction?'
  },
  'ja-JP': {
    '帳目列表': '取引一覧',
    '查看、編輯或刪除您所有的記帳紀錄': 'すべての取引記録を確認、編集、削除できます',
    '分析頁': '分析',
    '重複交易': '定期取引',
    '審核頁': 'レビュー',
    '對帳頁': '照合',
    '資料來源': 'データソース',
    '本機交易服務': 'ローカル取引サービス',
    '檢查模式': 'チェックモード',
    '支援審核與對帳': 'レビューと照合に対応',
    '匯入能力': 'インポート機能',
    '可搭配 XLSX 流程': 'XLSX ワークフローと連携可能',
    '收入': '収入',
    '支出': '支出',
    '筆數': '件数',
    '來源': 'ソース',
    '延遲': '遅延',
    '淨值': '純資産',
    '日期': '日付',
    '類型': '種類',
    '分類': 'カテゴリ',
    '金額': '金額',
    '幣別': '通貨',
    '備註': 'メモ',
    '還沒有任何記帳紀錄。': 'まだ取引記録はありません。',
    '關鍵字': 'キーワード',
    '全部': 'すべて',
    '最低金額': '最低金額',
    '排序欄位': '並び替え項目',
    '排序方向': '並び順',
    '由大到小 / 由新到舊': '降順 / 新しい順',
    '由小到大 / 由舊到新': '昇順 / 古い順',
    '分組方式': 'グループ化',
    '月份': '月',
    '清除條件': '条件をリセット',
    '您確定要刪除這筆帳目嗎?': 'この取引を削除してもよろしいですか?'
  }
};

const supportedLanguages: LanguageOption[] = [
  { code: 'zh-TW', nativeLabel: '繁體中文', englishLabel: 'Traditional Chinese' },
  { code: 'en-US', nativeLabel: 'English', englishLabel: 'English' },
  { code: 'ja-JP', nativeLabel: '日本語', englishLabel: 'Japanese' }
];

const storageKey = 'workspace.language';
const languageChangedEvent = 'microfrontends:language-changed';

const isSupportedLanguage = (value: string | null | undefined): value is SupportedLanguage =>
  value === 'zh-TW' || value === 'en-US' || value === 'ja-JP';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly supportedLanguages = supportedLanguages;
  readonly currentLanguage = signal<SupportedLanguage>(this.resolveInitialLanguage());
  private readonly sourceId = Math.random().toString(36).slice(2);

  constructor() {
    this.applyLanguage(this.currentLanguage(), false);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
      window.addEventListener(languageChangedEvent, this.handleLanguageChanged as EventListener);
    }
  }

  translate(key: TranslationKey): string {
    return translations[this.currentLanguage()][key] ?? translations['zh-TW'][key] ?? key;
  }

  setLanguage(language: SupportedLanguage): void {
    this.applyLanguage(language, true);
  }

  private resolveInitialLanguage(): SupportedLanguage {
    if (typeof localStorage !== 'undefined') {
      const storedLanguage = localStorage.getItem(storageKey);
      if (isSupportedLanguage(storedLanguage)) {
        return storedLanguage;
      }
    }

    return 'zh-TW';
  }

  private applyLanguage(language: SupportedLanguage, shouldBroadcast: boolean): void {
    this.currentLanguage.set(language);

    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, language);
    }

    if (shouldBroadcast && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<LanguageChangedDetail>(languageChangedEvent, {
          detail: {
            sourceId: this.sourceId,
            language
          }
        })
      );
    }
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== storageKey || !isSupportedLanguage(event.newValue)) {
      return;
    }

    this.applyLanguage(event.newValue, false);
  };

  private handleLanguageChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<LanguageChangedDetail>;

    if (!customEvent.detail || customEvent.detail.sourceId === this.sourceId) {
      return;
    }

    this.applyLanguage(customEvent.detail.language, false);
  };
}