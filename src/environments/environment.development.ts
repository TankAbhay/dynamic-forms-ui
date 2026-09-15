import '../app/core/config/app-config.model';

// Development environment configuration
export const environment = {
  production: false,
  get apiUrl(): string {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiUrl) {
      return window.__APP_CONFIG__.apiUrl;
    }
    return '/api';
  },
  get googleClientId(): string {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.googleClientId) {
      return window.__APP_CONFIG__.googleClientId;
    }
    return '';
  }
};
