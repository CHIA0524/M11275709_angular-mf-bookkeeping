import { Pipe, PipeTransform, inject } from '@angular/core';

import { LanguageService, TranslationKey } from '../../core/services/language.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly languageService = inject(LanguageService);

  transform(value: TranslationKey | null | undefined): string {
    if (!value) {
      return '';
    }

    this.languageService.currentLanguage();
    return this.languageService.translate(value);
  }
}