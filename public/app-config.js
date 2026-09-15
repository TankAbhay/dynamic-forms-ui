// Dynamic Forms - Runtime Environment Configuration
// Automatically resolves to the API on port 8084 based on the host/domain accessed in the browser
(function () {
  var protocol = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : 'http:';
  var hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';

  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {
    apiUrl: protocol + '//' + hostname + ':8084/api',
    googleClientId: '839822014183-koq6vtppk00qpl4deq4c0hhn1vgh1ka9.apps.googleusercontent.com'
  };
})();

