export interface AppConfig {
  apiUrl: string;
  googleClientId: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<AppConfig>;
  }
}
