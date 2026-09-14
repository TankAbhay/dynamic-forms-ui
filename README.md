# Dynamic Forms UI

Modern, responsive Angular 22 Single Page Application for the Dynamic Forms Platform.

## Features
- Dynamic Form Builder with Drag & Drop Palette
- Form Submissions Viewer with Keyset Pagination & CSV Export
- Google OAuth2 Single Sign-On + Email/Password Authentication
- Dual-Hosting Architecture: Deployable to GitHub Pages and Production Reverse Proxies (Nginx / IIS)

## Development
```bash
npm install
npm start
```

## Build
```bash
# Production Build (Base Href /)
npm run build:prod

# GitHub Pages Build (Base Href /dynamic-forms-ui/)
npm run build:gh-pages
```

## Automated Deployment
Connected to GitHub Actions via `.github/workflows/deploy-pages.yml` to automatically build and deploy to GitHub Pages on push to `main`.
