# HAI3 dev kit Manifest

The purpose of this document is to define the core philosophy, principles, and values behind the HAI3 dev kit — a framework that merges AI-assisted UI generation with human craftsmanship, ensuring maintainable, scalable, and visually consistent applications for SaaS multitenant and multi-user control panels.

## Key Principles

### The HAI3 mission

The main **HAI3 UI-Core objective** is to achieve the **max possible efficiency** of the application screens generation by **AI**, while maintaining the **code quality** and the **code structure** for future application logic scale.

1. **HAI3 UI-core**: Human-driven development, AI-assisted, well structured and polished.

2. **Application business screens**: AI-driven development with help of HAI3 UI-core, Human-assisted.

The HAI3 dev kit follows the Human-in-the-Loop Workflow philosophy:

- HAI3 defines a predictable AI→human handoff that preserves structure and quality.
- Three-stage flow: Draft → Mockup → Production
- AI generates initial drafts based on user input, layout and schema metadata
- AI tooling highlights policy and component violations
- Humans review, optimize, and merge into screen-sets

> Human involvement is still required for code review, code quality analysis, logic deduplication, and other critical tasks. Normally it is expected that human intervention happens at the end of the AI-driven development process, when initial screen `drafts` and `mockups` are polished and optimized.


## The HAI3 UI-Core Values

### V#1 — Human-Configurable UI-Core

HAI3 provides a unified UI-Core structure for all generated screens and allows developers to customize the layout, content, styles and observability settings according to specific UI application/control panel needs:

- Configurable layout - menu structure, header, footer, and sidebar
- Adaptable screen layouts (grid, form, dashboard, flow, etc.)
- Consistent navigation and placement rules
- Configurable observability and diagnostics (logging, tracing)

**Goal:** Enable AI and human developers to build within a shared layout system without layout drift.

### V#2 — Layout-Safe Screen Generation

HAI3 ensures all generated screens fit into the defined panel layout.

- UI-core library can be updated independently from the HAI3 repo at any time, screens development is not affected
- Generated screens inherit layout templates
- Generated screens do not break or overlap existing panels
- Layout safety validated during build or lint phase

**Goal:** Maintain visual integrity across auto-generated and manually crafted screens.

### V#3 — Component and Style Consistency

All generated UI elements must align with existing UI-Core controls and styles.

- Use of standardized UI components (grids, buttons, modals, forms, etc.)
- Auto-enforcement of existing CSS/Tailwind tokens and naming conventions
- Lint rules ensure AI outputs conform to reusable design system components
- White-label support (logos, palettes, typography)
- Support for color palettes, fonts, and logos
- Theme inheritance across AI-generated and human screens
- AI-generated code must respect theme tokens and constraints

**Goal:** Avoid design fragmentation — AI must behave like a trained team member reusing existing UI vocabulary maintaining consistent brand identity across all auto-generated screens.

### V#4 — Modular Screen Architecture with Pluggable UI Elements

Every screen is a self-contained folder that can be shared, reused, or replaced.

- A screen = one folder with its logic, layout, and metadata
- Screens can be imported via Git submodules or copied manually
- Developers can fork or duplicate screens to experiment with AI variants
- Screen-sets can be switched at runtime for A/B testing or feature flags

HAI3 provides a pluggable UI architecture that allows developers to reuse existing UI elements and components across different screens.

- Predefined placeholders and slots for UI customization: menu/header/footer/sidebar/action bars
- Runtime plugging of declarative UI elements - forms, grids, etc.
- Per-screenset UI component libraries for consistent design systems
- Dynamic screen registration and lazy loading for performance

**Goal:** Treat UI screens as composable building blocks — easy to swap, version, and evolve. Enables vendors to build marketplace-style plugin ecosystems where third-party developers can contribute screens and integrations without touching core code.

### V#6 – Shared Store and Global State

Maintain a predictable global state model across all screens.

- Namespaces: ui, auth, entities, jobs, queries
- Normalized entities with typed selectors
- Persistence layers (memory → session → IndexedDB)
- Event bus for inter-screen communication
- Response caching strategies
- Offline, Drafts & Background Sync support

**Goal:** Provide a consistent global state model for all screens and services.

### V#7 – Unified API Layer

Provide a typed, reusable SDK that abstracts backend APIs through consistent contracts.

- Typed inputs/outputs contracts (OpenAPI / JSON Schema / Zod)
- Unified API client with retries, ETags, and error normalization
- Runtime input/output validation and observability

**Goal:** Provide a consistent API access layer for all screens and services.

### V#8 - Security, Multitenancy & Role-based Access

Security is first-class and configurable per organization/tenant or project.

- OAuth2/OIDC with PKCE and token rotation for enterprise SSO integration
- Session expiration and idle timeout policies configurable per tenant/project
- Scoped capabilities and user role-based UI access guards
- Fine-grained permissions: hide/show/disable UI elements based on user roles
- Tenant isolation: data, configuration, and UI customization per tenant
- Encrypted IndexedDB and strict Content-Security-Policy
- Privacy modes: air-gapped, restricted telemetry, or full cloud
- Audit logging for compliance (SOC2, HIPAA, GDPR)

**Goal:** Provide a consistent security layer for all screens and services. Built-in multitenancy and RBAC reduce time-to-market for SaaS vendors. Tenant isolation and audit logging satisfy enterprise compliance requirements out of the box.

### V#9 - Internationalization & Localization

HAI3 ensures that all AI-generated and human-refined screens meet accessibility standards and support localization by design.

- WCAG 2.1 AA compliance baked into component library
- Automatic accessibility linting and testing for AI-generated screens
- i18n namespaces per screen with lazy-loaded locale packs
- Built-in RTL/LTR layout handling through tokenized CSS and Tailwind utilities
- Locale-aware date, number, and time formatting helpers for AI-generated UI
- Per-tenant language preferences with runtime locale switching
- Translation management integration for professional localization workflows

**Goal:** Ensure every screen produced by HAI3 is accessible, inclusive, and fully localizable across languages and regions. Global enterprises can deploy a single codebase to multiple regions with full localization support. Accessibility compliance reduces legal risk and expands market reach.

### V#10 — Unified Build Targets

HAI3 supports unified builds for both Web and Electron environments. The Web version has dual build with/without CDN

- Shared UI-Core between browser and desktop builds
- Shared configuration for screen inclusion/exclusion
- Ability to switch screen sets and themes at build time
- Ability to build CDN or local server hosted version from the same source code
- Support for on-premise deployments with air-gapped environments
- Progressive Web App (PWA) support for offline-first scenarios

**Goal:** Maintain one source of truth for multiple delivery environments. Service providers can offer flexible deployment options (cloud SaaS, on-premise, hybrid) from a single codebase. Desktop apps provide offline capabilities for field workers and secure environments.
