// Dynamic Forms - Runtime Environment Configuration
// Automatically resolves the API URL based on the host/domain accessed in the browser.
// - GitHub Pages  -> uses the external production API domain (no IP/port exposed)
// - Local / LAN   -> uses the same host with the configured API port
(function () {
  var loc = (typeof window !== 'undefined' && window.location) ? window.location : null;
  var protocol = loc ? loc.protocol : 'http:';
  var hostname = loc ? loc.hostname : 'localhost';

  var apiUrl;
  if (hostname.endsWith('.github.io') || hostname === 'tankabhay.github.io') {
    // GitHub Pages: route to the public-facing production API domain
    apiUrl = 'https://dynamic-forms.duckdns.org/api';
  } else {
    // Local IIS / LAN / nip.io: auto-resolve API on port 8084 on the same host
    apiUrl = protocol + '//' + hostname + ':8084/api';
  }

  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
    apiUrl: apiUrl,
    googleClientId: '839822014183-koq6vtppk00qpl4deq4c0hhn1vgh1ka9.apps.googleusercontent.com'
  };
})();

