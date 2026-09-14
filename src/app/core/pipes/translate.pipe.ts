import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Allows instant template updates when currentLang signal changes
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string, paramsOrFallback?: Record<string, string | number> | string, fallback?: string): string {
    if (!key) return '';
    if (typeof paramsOrFallback === 'string') {
      return this.translationService.t(key, undefined, paramsOrFallback);
    }
    return this.translationService.t(key, paramsOrFallback, fallback);
  }
}
