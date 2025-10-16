# HAI3 Development Roadmap

This roadmap outlines practical, actionable tasks organized by HAI3's 10 core values (V#1-V#10). Each task is designed to be achievable within the current codebase architecture.

---

## V#1 — Human-Configurable UI-Core

**Goal**: Enable AI and human developers to build within a shared layout system without layout drift.

### Layout Configuration
- [ ] Create proper centralized layout configuration
- [ ] Add configurable header height, footer height, sidebar widths to layout config
- [ ] Implement layout presets (compact, standard, spacious) in HAI3Core
- [ ] Add layout configuration UI in Settings screen

### Menu & Navigation
- [ ] Implement menu collapse/expand toggle
- [ ] Implement menu item visibility rules based on configuration
- [ ] Add support for nested menu items (sub-menus)
- [ ] Create menu item ordering/reordering system
- [ ] Add menu item badges/notifications support

### Observability & Diagnostics
- [ ] Create shared logger with configurable log levels
- [ ] Add performance monitoring hooks in HAI3Core
- [ ] Implement screen render time tracking
- [ ] Create diagnostics panel in Settings screen

---

## V#2 — Layout-Safe Screen Generation

**Goal**: Maintain visual integrity across auto-generated and manually crafted screens.

### Repository
- [ ] Define the project repository layout
- [ ] Define the config files layout with default values
- [ ] Prepare the `docs/REPO_STRUCTURE.md`
- [ ] To allow to use UI-core library (as submodule, or installed package) inside a screenset repository
- [ ] The HAI3 submodule/package can be updated independently at any time, screens development is not affected

### Screensets
- [ ] Create a mechanism for screensets registration
- [ ] Ensure the UI-Core part is layout-safe and doesn't have specific screensets of layout dependencies
- [ ] Implement the customizable screenset switcher

### AI-guidelines
- [ ] Define appopriate AI-guidelines for screen generation
- [ ] Implement AI-guidelines validation

---

## V#3 — Component and Style Consistency

**Goal**: Avoid design fragmentation — AI must behave like a trained team member reusing existing UI vocabulary.

### Component Library Expansion
- [ ] Create shared folder for reusable components
- [ ] Move existing UI components from screensets to common/ui
- [ ] Add `Table.tsx` component with sorting, filtering, pagination
- [ ] Add `Form.tsx` component with validation support
- [ ] Add `Tabs.tsx` component
- [ ] Add `Dropdown.tsx` component
- [ ] Add `Toast.tsx` notification component
- [ ] Add `Breadcrumb.tsx` component
- [ ] Add `Chat.tsx` component

### Style System
- [ ] Document all theme tokens in `docs/THEME_TOKENS.md`
- [ ] Create Tailwind plugin for custom HAI3 utilities
- [ ] Add CSS variable fallbacks for all theme tokens
- [ ] Create style guide documentation with examples
- [ ] Implement theme style switcher

---

## V#4 — Modular Screen Architecture with Pluggable UI Elements

**Goal**: Treat UI screens as composable building blocks — easy to swap, version, and evolve.

### Implement micro-frontend placeholders
- [ ] Document all the placeholders in `docs/PLACEHOLDERS.md`
- [ ] Menu placeholders
- [ ] Header placeholders
- [ ] Footer placeholders
- [ ] Sidebar placeholders
- [ ] Action bar placeholders
- [ ] Notification placeholders

### Screen Module System
- [ ] Create micro-frontend registration mechanism
- [ ] Implement lazy loading for micro-frontend modules
- [ ] Add micro-frontend metadata schema (version, author, dependencies)
- [ ] Create micro-frontend validation system

### Micro-frontend Architecture
- [ ] Design UI plugin (micro-frontend) API interface
- [ ] Create micro-frontend lifecycle management
- [ ] Implement micro-frontend sandbox/isolation mechanism
- [ ] Add micro-frontend configuration UI in Settings
- [ ] Create example micro-frontend

### Screen Packaging
- [ ] Create CLI tool for screen packaging
- [ ] Implement screen import/export functionality
- [ ] Add Git submodule support documentation
- [ ] Create screen marketplace manifest format

---

## V#6 — Shared Store and Global State

**Goal**: Provide a consistent global state model for all screens and services.

### State Management
- [ ] Create `src/store/` folder structure
- [ ] Implement `src/store/uiStore.ts` (theme, layout, preferences)
- [ ] Implement `src/store/authStore.ts` (user, session, permissions)
- [ ] Implement `src/store/entitiesStore.ts` (normalized data)
- [ ] Add TypeScript types for all store slices

### Persistence Layer
- [ ] Create `src/lib/storage.ts` with multi-tier storage (memory/session/IndexedDB)
- [ ] Implement automatic state persistence
- [ ] Add state migration system for version upgrades
- [ ] Implement state export/import for debugging

### Event System
- [ ] Create `src/lib/eventBus.ts` for inter-screen communication
- [ ] Document event naming conventions
- [ ] Add event debugging tools in diagnostics panel

---

## V#7 — Unified API Layer

**Goal**: Provide a consistent API access layer for all screens and services.

### API Client
- [ ] Create `src/lib/apiClient.ts` with retry logic and error handling
- [ ] Implement request/response interceptors
- [ ] Add ETag support for caching
- [ ] Implement request deduplication
- [ ] Add request cancellation support

### Type Safety
- [ ] Create `src/types/api.d.ts` for API contracts
- [ ] Add Zod schemas for runtime validation
- [ ] Generate TypeScript types from OpenAPI specs (tooling)
- [ ] Add API response mocking utilities

### Observability
- [ ] Add API call logging and tracing
- [ ] Implement API performance metrics
- [ ] Create API debugging panel in Settings

---

## V#8 — Security, Multitenancy & Role-based Access

**Goal**: Provide a consistent security layer for all screens and services. Built-in multitenancy and RBAC.

### Authentication
- [ ] Create `auth` folder and config file
- [ ] Implement OAuth2/OIDC client
- [ ] Add session management with token rotation
- [ ] Implement idle timeout detection
- [ ] Add "Remember Me" functionality

### Authorization & RBAC
- [ ] Implement role-based UI guards (hide/show/disable)
- [ ] Add permission checking utilities
- [ ] Create permission configuration UI in Settings
- [ ] Define permission model in the `docs/PERMISSIONS.md`

### Multitenancy
- [ ] Implement tenant-specific configuration storage
- [ ] Add tenant isolation in state management
- [ ] Create tenant switcher/impersonation UI component

### Security Features
- [ ] Implement Content-Security-Policy headers
- [ ] Add IndexedDB encryption for sensitive data
- [ ] Create audit logging system in `src/lib/audit.ts`
- [ ] Add privacy mode toggle (disable telemetry)

---

## V#9 — Internationalization & Localization

**Goal**: Ensure every screen is accessible, inclusive, and fully localizable across languages and regions.

### i18n Infrastructure
- [ ] Set up i18next or similar i18n library
- [ ] Create `locales/` folder structure
- [ ] Implement locale detection and switching
- [ ] Add language selector in Settings

### Translation Management
- [ ] Create translation keys for all UI text in HAI3Core
- [ ] Implement lazy loading for locale packs
- [ ] Add missing translation warnings in dev mode
- [ ] Create translation extraction tool

### Locale-Aware Formatting
- [ ] Create `src/lib/formatters.ts` for date/number/currency formatting
- [ ] Implement RTL layout support in themes.css
- [ ] Add locale-aware sorting utilities
- [ ] Test all screens with RTL languages

### Accessibility
- [ ] Run WCAG 2.1 AA audit on all components
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard navigation for all screens
- [ ] Add screen reader testing documentation

---

## V#10 — Unified Build Targets

**Goal**: Maintain one source of truth for multiple delivery environments.

### Build System
- [ ] Create build configuration for CDN vs local deployment
- [ ] Implement environment-specific builds (dev/staging/prod)
- [ ] Add screen-set inclusion/exclusion in build config
- [ ] Optimize bundle size with code splitting

### Electron Enhancements
- [ ] Add auto-update functionality for Electron app
- [ ] Implement native menu bar for desktop app
- [ ] Add system tray integration
- [ ] Create installer scripts for Windows/Mac/Linux

### Progressive Web App (PWA)
- [ ] Add service worker for offline support
- [ ] Create PWA manifest file
- [ ] Implement background sync for offline actions
- [ ] Add install prompt for PWA

### Deployment Options
- [ ] Create Docker configuration for containerized deployment
- [ ] Add Kubernetes deployment manifests
- [ ] Document on-premise installation process
- [ ] Create air-gapped deployment package

---

## Cross-Cutting Concerns

### Documentation
- [ ] Create component documentation with Storybook
- [ ] Write API documentation for all public interfaces
- [ ] Create video tutorials for common tasks
- [ ] Document AI prompt templates for screen generation

### Testing
- [ ] Set up Jest for unit testing
- [ ] Add Playwright for E2E testing
- [ ] Create visual regression testing setup
- [ ] Achieve 80% code coverage

### Developer Experience
- [ ] Create VS Code extension for HAI3 development
- [ ] Add hot module replacement for faster development
- [ ] Create debugging guide documentation
- [ ] Set up pre-commit hooks with linting
