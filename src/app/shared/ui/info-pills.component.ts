import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../pipes/translate.pipe';

export interface InfoPillItem {
  label: string;
  value: string;
  icon?: string;
  tone?: 'neutral' | 'accent' | 'success' | 'warning';
}

@Component({
  selector: 'app-info-pills',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="pill-grid">
      @for (item of items; track item.label) {
      <div class="pill" [class]="item.tone ? 'pill tone-' + item.tone : 'pill'">
        @if (item.icon) {
        <mat-icon>{{ item.icon }}</mat-icon>
        }
        <div>
          <div class="pill-label">{{ item.label | t }}</div>
          <div class="pill-value">{{ item.value | t }}</div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [`
    .pill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 1rem;
    }

    .pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: linear-gradient(135deg, rgba(248, 250, 252, 0.98), rgba(241, 245, 249, 0.88));
    }

    .pill-label {
      font-size: 0.78rem;
      color: rgba(15, 23, 42, 0.62);
      margin-bottom: 2px;
    }

    .pill-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
    }

    .tone-accent {
      background: linear-gradient(135deg, rgba(224, 231, 255, 0.95), rgba(238, 242, 255, 0.88));
    }

    .tone-success {
      background: linear-gradient(135deg, rgba(220, 252, 231, 0.95), rgba(240, 253, 244, 0.88));
    }

    .tone-warning {
      background: linear-gradient(135deg, rgba(255, 237, 213, 0.96), rgba(255, 247, 237, 0.88));
    }

    mat-icon {
      color: #475569;
    }
  `]
})
export class InfoPillsComponent {
  @Input({ required: true }) items: InfoPillItem[] = [];
}