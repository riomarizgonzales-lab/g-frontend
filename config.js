// config.js - runtime API URL configuration
// This file sets `window.API_URL` for the frontend scripts. It must be plain JS
// (no surrounding <script> tags) so it can be loaded with `<script src="config.js"></script>`.

(function () {
  // If another script already set API_URL, keep it
  if (window.API_URL) return;

  // Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.API_URL = 'http://localhost:5000';
  } else {
    // Production: explicit Render backend URL to avoid CORS/origin mismatch
    window.API_URL = 'https://g-backend-b31r.onrender.com';
  }

  // Helpful debugging log when site loads
  try { console.info('API_URL set to', window.API_URL); } catch (e) {}
})();
