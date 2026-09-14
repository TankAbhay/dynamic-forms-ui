import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);

    // Detect dynamic chunk import failures (e.g. after a new build/deployment)
    const isChunkFailure =
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Loading chunk') ||
      message.includes('MIME type of "text/html"');

    if (isChunkFailure && typeof window !== 'undefined') {
      const storageKey = 'df_last_chunk_reload';
      const lastReload = sessionStorage.getItem(storageKey);
      const now = Date.now();

      // Reload only once within 10 seconds to prevent infinite reload loops
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(storageKey, now.toString());
        console.warn('[Deployment Sync] Stale chunk detected, refreshing application...', message);
        window.location.reload();
        return;
      }
    }

    console.error('[Application Error]', error);
  }
}
