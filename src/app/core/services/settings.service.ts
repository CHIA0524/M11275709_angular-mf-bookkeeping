
import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Currency = 'TWD' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'CNY' | 'HKD' | 'AUD' | 'GBP';

export interface UserSettings {
  theme: Theme;
  defaultCurrency: Currency;
  notificationsEnabled: boolean;
}

interface SettingsChangedDetail {
  sourceId: string;
  settings: UserSettings;
}

const SETTINGS_CHANGED_EVENT = 'microfrontends:user-settings-changed';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly storageKey = 'user-settings';
  private readonly sourceId = Math.random().toString(36).slice(2);
  
  settings = signal<UserSettings>(this.loadSettings());

  constructor() {
    window.addEventListener('storage', this.handleStorageChange);
    window.addEventListener(SETTINGS_CHANGED_EVENT, this.handleSettingsChanged as EventListener);
    this.applyTheme(this.settings().theme);
  }

  updateSettings(newSettings: Partial<UserSettings>) {
    this.applySettings({ ...this.settings(), ...newSettings }, true);
  }

  refreshSettings(): void {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return;
    }

    this.syncSettings(stored);
  }

  private loadSettings(): UserSettings {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing settings:', error);
        localStorage.removeItem(this.storageKey);
      }
    }
    return {
      theme: 'light',
      defaultCurrency: 'TWD',
      notificationsEnabled: true
    };
  }

  private broadcastSettings(settings: UserSettings): void {
    window.dispatchEvent(
      new CustomEvent<SettingsChangedDetail>(SETTINGS_CHANGED_EVENT, {
        detail: {
          sourceId: this.sourceId,
          settings
        }
      })
    );
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== this.storageKey || !event.newValue) {
      return;
    }

    this.syncSettings(event.newValue);
  };

  private handleSettingsChanged = (event: Event): void => {
    const customEvent = event as CustomEvent<SettingsChangedDetail>;
    if (!customEvent.detail || customEvent.detail.sourceId === this.sourceId) {
      return;
    }

    this.syncSettings(customEvent.detail.settings);
  };

  private syncSettings(nextSettings: UserSettings | string): void {
    const parsedSettings = typeof nextSettings === 'string'
      ? this.parseSettings(nextSettings)
      : nextSettings;

    if (!parsedSettings) {
      return;
    }

    this.applySettings(parsedSettings, false);
  }

  private applySettings(nextSettings: UserSettings, shouldBroadcast: boolean): void {
    const currentSettings = this.settings();
    const hasChanged =
      currentSettings.theme !== nextSettings.theme ||
      currentSettings.defaultCurrency !== nextSettings.defaultCurrency ||
      currentSettings.notificationsEnabled !== nextSettings.notificationsEnabled;

    if (!hasChanged) {
      return;
    }

    this.settings.set(nextSettings);
    localStorage.setItem(this.storageKey, JSON.stringify(nextSettings));
    this.applyTheme(nextSettings.theme);

    if (shouldBroadcast) {
      this.broadcastSettings(nextSettings);
    }
  }

  private parseSettings(serializedSettings: string): UserSettings | null {
    try {
      return JSON.parse(serializedSettings) as UserSettings;
    } catch (error) {
      console.error('Error parsing settings:', error);
      return null;
    }
  }

  private applyTheme(theme: Theme) {
    const targets = [document.documentElement, document.body];

    if (theme === 'dark') {
      targets.forEach((element) => element.classList.add('dark-theme'));
    } else {
      targets.forEach((element) => element.classList.remove('dark-theme'));
    }
  }
}
