import '../app/core/config/app-config.model';

// GitHub Pages deployment environment configuration
export const environment = {
  production: true,
  get apiUrl(): string {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.apiUrl) {
      return window.__APP_CONFIG__.apiUrl;
    }
    return 'https://dynamic-forms.duckdns.org/api';
  },
  get googleClientId(): string {
    if (typeof window !== 'undefined' && window.__APP_CONFIG__?.googleClientId) {
      return window.__APP_CONFIG__.googleClientId;
    }
    return '';
  }
};
