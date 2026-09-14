// Base environment configuration
export const environment = {
  production: false,
  get apiUrl(): string {
    if (typeof window !== 'undefined' && window.location) {
      const port = window.location.port;
      const hostname = window.location.hostname;
      if (port === '8086' || port === '4200' || hostname === 'localhost') {
        return `${window.location.protocol}//${hostname}:8084/api`;
      }
      return 'http://localhost:8084/api';
    }
    return 'http://localhost:8084/api';
  },
  googleClientId: '839822014183-koq6vtppk00qpl4deq4c0hhn1vgh1ka9.apps.googleusercontent.com'
};
