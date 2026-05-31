import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../pipes/translate.pipe';

export interface FeatureActionItem {
  label: string;
  routerLink: string | string[];
  icon?: string;
  exact?: boolean;
  tone?: 'neutral' | 'accent';
}

@Component({
  selector: 'app-feature-action-strip',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <div class="action-strip">
      @for (action of actions; track action.label) {
      <a
        mat-stroked-button
        class="action-link"
        [class.action-link-accent]="action.tone === 'accent'"
        [routerLink]="action.routerLink"
        routerLinkActive="is-active"
        [routerLinkActiveOptions]="{ exact: action.exact ?? true }"
      >
        @if (action.icon) {
        <mat-icon>{{ action.icon }}</mat-icon>
        }
        <span>{{ action.label | t }}</span>
      </a>
      }
    </div>
  `,
  styles: [`
    .action-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 1rem;
    }

    .action-link {
      border-radius: 999px;
      padding-inline: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-color: rgba(63, 81, 181, 0.22);
      background: rgba(63, 81, 181, 0.04);
    }

    .action-link-accent,
    .action-link.is-active {
      background: rgba(63, 81, 181, 0.12);
      border-color: rgba(63, 81, 181, 0.36);
    }

    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class FeatureActionStripComponent {
  @Input({ required: true }) actions: FeatureActionItem[] = [];
}