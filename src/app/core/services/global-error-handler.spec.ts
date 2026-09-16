import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    handler = new GlobalErrorHandler();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    };
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should log regular application errors', () => {
    const error = new Error('Test application crash');
    handler.handleError(error);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[Application Error]', error);
  });

  it('should log non-Error instances correctly', () => {
    handler.handleError('Direct string failure');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[Application Error]', 'Direct string failure');
  });

  it('should detect chunk loading errors and attempt reload guard', () => {
    const reloadMock = vi.fn();
    (globalThis as any).window = {
      location: { reload: reloadMock }
    };

    const chunkError = new Error('Failed to fetch dynamically imported module: chunk-123.js');
    handler.handleError(chunkError);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Deployment Sync] Stale chunk detected'),
      chunkError.message
    );
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(mockStorage['df_last_chunk_reload']).toBeDefined();
  });
});
