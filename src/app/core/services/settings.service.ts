import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Currency = 'TWD' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'CNY' | 'HKD' | 'AUD' | 'GBP';

export interface AppearancePalette {
  background: string;
  surface: string;
  toolbar: string;
  sidebar: string;
  accent: string;
  textPrimary: string;
}

export interface WorkspacePreferences {
  emailDigest: boolean;
  weeklyReviewDay: string;
  defaultLandingPage: string;
  compactMode: boolean;
  appearancePreset: string;
  palette: AppearancePalette;
}

export interface ColorPreset {
  id: string;
  label: string;
  description: string;
  palette: AppearancePalette;
}

export interface UserSettings {
  theme: Theme;
  defaultCurrency: Currency;
  notificationsEnabled: boolean;
  workspacePreferences: WorkspacePreferences;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly storageKey = 'user-settings';
  private readonly colorPresets: ColorPreset[] = [
    {
      id: 'ocean-balance',
      label: 'Ocean Balance',
      description: '冷藍工作台，適合 dashboard 與長時間閱讀。',
      palette: {
        background: '#F4F7FB',
        surface: '#FFFFFF',
        toolbar: '#2F5D7C',
        sidebar: '#17324D',
        accent: '#4C9F70',
        textPrimary: '#16202A'
      }
    },
    {
      id: 'sunset-ledger',
      label: 'Sunset Ledger',
      description: '暖色對比高，讓 bookkeeping 與提醒操作更明顯。',
      palette: {
        background: '#FFF8F1',
        surface: '#FFFFFF',
        toolbar: '#9A3412',
        sidebar: '#7C2D12',
        accent: '#E76F51',
        textPrimary: '#3F2415'
      }
    },
    {
      id: 'forest-ops',
      label: 'Forest Ops',
      description: '偏深綠與石墨灰，適合多頁面切換與分析場景。',
      palette: {
        background: '#F3F7F4',
        surface: '#FCFDFB',
        toolbar: '#315B4C',
        sidebar: '#243B33',
        accent: '#7AA874',
        textPrimary: '#16211C'
      }
    },
    {
      id: 'graphite-signal',
      label: 'Graphite Signal',
      description: '中性灰配高亮 accent，適合偏深色操作風格。',
      palette: {
        background: '#EEF2F6',
        surface: '#FFFFFF',
        toolbar: '#364152',
        sidebar: '#1F2937',
        accent: '#D97706',
        textPrimary: '#111827'
      }
    }
  ];
  private readonly defaultSettings: UserSettings = {
    theme: 'light',
    defaultCurrency: 'TWD',
    notificationsEnabled: true,
    workspacePreferences: {
      emailDigest: true,
      weeklyReviewDay: 'Friday',
      defaultLandingPage: 'dashboard',
      compactMode: false,
      appearancePreset: 'ocean-balance',
      palette: {
        background: '#F4F7FB',
        surface: '#FFFFFF',
        toolbar: '#2F5D7C',
        sidebar: '#17324D',
        accent: '#4C9F70',
        textPrimary: '#16202A'
      }
    }
  };
  
  // 使用 Angular Signals 管理狀態
  settings = signal<UserSettings>(this.loadSettings());

  constructor() {
    this.applyTheme(this.settings().theme); // 確保初始化時應用主題
    this.applyPalette(this.settings().workspacePreferences.palette);

    // 當設定變更時自動儲存並應用效果
    effect(() => {
      const currentSettings = this.settings();
      localStorage.setItem(this.storageKey, JSON.stringify(currentSettings));
      this.applyTheme(currentSettings.theme);
      this.applyPalette(currentSettings.workspacePreferences.palette);
    });
  }

  updateSettings(newSettings: Partial<UserSettings>) {
    this.settings.update(current => ({ ...current, ...newSettings }));
  }

  getColorPresets(): ColorPreset[] {
    return this.colorPresets;
  }

  updateWorkspacePreferences(preferences: Partial<WorkspacePreferences>) {
    this.settings.update(current => ({
      ...current,
      workspacePreferences: {
        ...current.workspacePreferences,
        ...preferences,
        palette: {
          ...current.workspacePreferences.palette,
          ...(preferences.palette ?? {})
        }
      }
    }));
  }

  applyColorPreset(presetId: string): void {
    const preset = this.colorPresets.find(item => item.id === presetId);
    if (!preset) {
      return;
    }

    this.updateWorkspacePreferences({
      appearancePreset: preset.id,
      palette: preset.palette
    });
  }

  private loadSettings(): UserSettings {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<UserSettings>;
        return {
          ...this.defaultSettings,
          ...parsed,
          workspacePreferences: {
            ...this.defaultSettings.workspacePreferences,
            ...(parsed.workspacePreferences ?? {}),
            palette: {
              ...this.defaultSettings.workspacePreferences.palette,
              ...(parsed.workspacePreferences?.palette ?? {})
            }
          }
        };
      } catch (error) {
        console.error('Error parsing settings:', error);
        localStorage.removeItem(this.storageKey);
      }
    }
    return this.defaultSettings;
  }

  private applyTheme(theme: Theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  private applyPalette(palette: AppearancePalette): void {
    const normalized = {
      background: this.normalizeHex(palette.background),
      surface: this.normalizeHex(palette.surface),
      toolbar: this.normalizeHex(palette.toolbar),
      sidebar: this.normalizeHex(palette.sidebar),
      accent: this.normalizeHex(palette.accent),
      textPrimary: this.normalizeHex(palette.textPrimary)
    };
    const root = document.documentElement;

    root.style.setProperty('--workspace-bg-color', normalized.background);
    root.style.setProperty('--workspace-surface-color', normalized.surface);
    root.style.setProperty('--workspace-toolbar-color', normalized.toolbar);
    root.style.setProperty('--workspace-sidebar-color', normalized.sidebar);
    root.style.setProperty('--workspace-accent-color', normalized.accent);
    root.style.setProperty('--workspace-text-color', normalized.textPrimary);
    root.style.setProperty('--workspace-text-muted', this.toRgba(normalized.textPrimary, 0.68));
    root.style.setProperty('--workspace-border-color', this.mixColors(normalized.textPrimary, normalized.background, 0.82));
    root.style.setProperty('--workspace-accent-soft', this.toRgba(normalized.accent, 0.14));
    root.style.setProperty('--workspace-toolbar-contrast', this.getContrastColor(normalized.toolbar));
    root.style.setProperty('--workspace-sidebar-contrast', this.getContrastColor(normalized.sidebar));
    root.style.setProperty('--workspace-surface-contrast', this.getContrastColor(normalized.surface));
  }

  private normalizeHex(value: string): string {
    const normalized = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
      return normalized.toUpperCase();
    }
    return '#000000';
  }

  private toRgba(hex: string, alpha: number): string {
    const { red, green, blue } = this.hexToRgb(hex);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private mixColors(foreground: string, background: string, ratio: number): string {
    const left = this.hexToRgb(foreground);
    const right = this.hexToRgb(background);
    const clamp = Math.max(0, Math.min(1, ratio));
    const blend = (source: number, target: number) => Math.round(source * (1 - clamp) + target * clamp);
    return `rgb(${blend(left.red, right.red)}, ${blend(left.green, right.green)}, ${blend(left.blue, right.blue)})`;
  }

  private getContrastColor(hex: string): string {
    const { red, green, blue } = this.hexToRgb(hex);
    const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
    return luminance >= 160 ? '#0F172A' : '#F8FAFC';
  }

  private hexToRgb(hex: string): { red: number; green: number; blue: number } {
    const value = hex.replace('#', '');
    return {
      red: parseInt(value.slice(0, 2), 16),
      green: parseInt(value.slice(2, 4), 16),
      blue: parseInt(value.slice(4, 6), 16)
    };
  }
}
