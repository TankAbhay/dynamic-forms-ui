// Production environment configuration (Oracle Cloud VM / Nginx / IIS)
export const environment = {
  production: true,
  get apiUrl(): string {
    if (typeof window !== 'undefined' && window.location) {
      const port = window.location.port;
      const hostname = window.location.hostname;
      // If served from local IIS port 8086 or dev port 4200, use backend API on port 8084
      if (port === '8086' || port === '4200' || hostname === 'localhost') {
        return `${window.location.protocol}//${hostname}:8084/api`;
      }
      return '/api';
    }
    return '/api';
  },
  googleClientId: '839822014183-koq6vtppk00qpl4deq4c0hhn1vgh1ka9.apps.googleusercontent.com'
};
