# HAI3 — AI-Optimized UI Development Kit for Modern SaaS Applications

**HAI3** is a **UI development kit** for modern SaaS applications — heavily optimized for **AI-driven UI generation** with minimal human assistance.

It provides a structured, multi-layered framework that enables **AI systems and humans to collaborate** on building, evolving, and refining complex user interfaces — from drafts and mockups to production-ready screens.

## Why HAI3?

Building modern control panels for cloud service providers, corporate software vendors, and SaaS vendors requires solving complex challenges:

- **Multitenancy**: Isolated data, configurations, and branding per customer/organization
- **Role-Based Access Control**: Granular permissions that hide/show/disable UI elements based on user roles
- **White-Label Support**: Per-tenant branding, themes, and feature sets
- **Plugin Ecosystems**: Runtime-composable integrations without core code changes
- **Global Deployment**: Multi-language, RTL/LTR, locale-aware formatting
- **Flexible Delivery**: Web, desktop, on-premise, cloud from a single codebase

HAI3 addresses these challenges while enabling **AI-assisted development** to accelerate UI creation by 10x.

## Target Audience

HAI3 dev kit is designed for:

- **Cloud SaaS Service Providers** requiring multitenant architectures with tenant isolation and customization
- **Service Vendors** developing white-label solutions with per-customer branding and feature sets
- **Corporate Software Vendors** building modern control panels for complex business applications
- **ISVs and System Integrators** creating pluggable control panels with third-party integrations
- **Platform/IT Teams** building internal tools and admin portals with role-based access control

The dev kit addresses the unique challenges of building control panels that must support:
- Multiple tenants/organizations with isolated data and configurations
- Multiple user roles with granular permissions and UI access controls
- Multiple languages and locales with RTL/LTR support
- Multiple integrations and plugins with runtime composition
- Multiple deployment targets (web, desktop, on-premise, cloud)

---

## Overview

The HAI3 Dev Kit introduces a new paradigm in UI development where product management and designers can work with AI to create and polish user interfaces and engineers can take the generated code and turn it into production-ready code.

With HAI3, UI development becomes a **three-layer process** where AI and humans co-create interfaces:
- AI generates **draft** layouts using standardized prompts and patterns.
- Designers and PMs refine **mockups** with lightweight iteration over drafts.
- Engineers finalize **production screens** with reusable components taking the mockups as a starting point.

HAI3 provides the visual structure (menu, header, footer, sidebars, main view), defines source code layout conventions, microfrontend engine, customizable type system, and a screen-set switcher ensuring that generated screens reuse needed components libraries and visual styles. It also provides a structured prompting system and AI generation guide set that enables consistent, parameterized UI generation via LLMs.

This approach enables **multi-repository**, **multi-persona**, and **AI-assisted** workflows — making it ideal for SaaS ecosystems that require rapid iteration, consistent design language, and integration with automated generation tools.

---

## Key HAI3 Use-cases and Values

The HAI3 Dev Kit is built on top of the following key values below allowing it to be used for different usecases starting from a single desktop application to multitenant and mulit-user SaaS  control panel development:

- V#1 - Human-Configurable UI-Core - layout, styles, components
- V#2 - Layout-Safe Screen Generation - AI/Human code separation
- V#3 — Component and Style Consistency - different screens use the same styles
- V#4 — Theming & Branding Preservation - SaaS-friendly theming
- V#5 — Modular Screen Architecture with Pluggable UI Elements - SaaS integraiton friendly
- V#6 – Shared Store and Global State - performance and latency efficiency
- V#7 – Unified API Layer - unified common middleware
- V#8 - Security, Multitenancy & Role-based Access
- V#9 - Internationalization & Localization
- V#10 — Unified Build Targets (web, electron, local/CDN)

---

## Core Architecture

HAI3 is structured around **three main projections**, each addressing a critical dimension of the development lifecycle.

### Projection #I - Assets

| Asset | Description |
|--------|--------------|
| **1. UI Core** | The foundational layer providing the visual structure (menu, header, footer, sidebars, main view). Defines source layout conventions, microfrontend engine, customizable type system, and a screen-set switcher. |
| **2. Prompts & Guidelines** | A structured prompting system and AI generation guide set that enables consistent, parameterized UI generation via LLMs. |
| **3. Build System** | Flexible build pipeline that can produce Web apps or Electron apps, configure included screen-sets, and pull screens from multiple repositories, and also build the mock API servers automatically. |

Each HAI3 project includes these three assets to ensure **repeatable, automatable, and composable** UI generation workflows.

---

### Projection #II - Screen-Set Categories

The UI Core is built to host **three categories of screen-sets**, corresponding to the evolution stages of an interface.

| Category | Purpose | Description |
|-----------|----------|-------------|
| **1. Drafts** | AI-generated layouts | Automatically created by AI agents using HAI3 prompt sets, rules and conventions. Multiple draft sets can coexist (e.g., per PM or feature group). |
| **2. Mockups** | Semi-refined screens | Converted from drafts when human designers or PMs start refining visual and interaction details. |
| **3. Production Screens** | Finalized versions | Human-polished mockups integrated into production builds. |

Each category lives in its own folder and is accessible via the **screen-set switcher** — allowing instant preview or live toggling across versions directly in the UI.

---

### Projection #III - UI Core Layers

HAI3’s **UI Core** consists of three architectural layers designed for composability and reuse.

| Layer | Description |
|--------|-------------|
| **1. Presentation Layer** | Component library including buttons, grids, menus, modals, typography, and TailwindCSS-based style sets. |
| **2. Layout Layer** | Defines the visual structure — menu, header, footer, right sidebar, popup window system, and screen containers. |
| **3. Libraries Layer** | Includes shared utilities: HTTP store, event system, plugin host, and microfrontend integration engine. |

The combination of these layers allows developers to **compose UI experiences** from modular parts, shared repos, and AI-generated code.

---

## AI + Human Collaboration Model

HAI3 defines a **three-stage development workflow** that maximizes AI efficiency while maintaining code quality:

![pipeline.drawio.png](docs/pipeline.drawio.png)

### Stage 1: Drafts (AI-Driven)

- AI generates initial screen layouts from prompts and requirements
- Multiple draft variants can be generated and compared
- Drafts live in isolated folders and don't affect production code
- **Typical time**: Minutes to hours (vs. days for manual development)

### Stage 2: Mockups (AI-Assisted, Human-Refined)

- Designers and Product Managers refine drafts with visual and interaction details
- AI assists with component selection and style consistency
- Mockups can be previewed in-app via a screen-set switcher
- **Typical time**: Hours to days (vs. weeks for manual development)

### Stage 3: Production (Human-Polished)

- Engineers integrate mockups with business logic and APIs
- Code review, cleanup, testing, and optimization
- Production screens inherit all UI-Core capabilities (theming, i18n, RBAC, etc.)
- **Typical time**: Days (vs. weeks for manual development)

**Result**: 10x faster UI development with maintainable, enterprise-grade code.

## Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/HAI3org/HAI3-poc.git
cd HAI3-poc

# Install dependencies
npm install
npm build
npm start -- starts the web version
```

Building an Electron app:

```bash
npm run build:electron
npm run electron
```

### Project Structure

```
HAI3-poc/
├── src/
│   ├── components/
│   │   ├── common/          # Shared UI-Core components
│   │   │   ├── HAI3Core.tsx   # Main layout engine
│   │   │   └── Modal.tsx      # Reusable modal component
│   │   ├── screensets/      # Screen-set variants
│   │   │   ├── _baseline/   # Minimal example
│   │   │   ├── drafts/      # AI-generated drafts
│   │   │   ├── mockups/     # Designer-refined mockups
│   │   │   └── fullmix/     # Production screens
│   │   ├── screensetConfig.ts  # Screen-set registry
│   │   └── themeConfig.ts      # Theme system
│   ├── styles/
│   │   └── themes.css       # Theme tokens (CSS variables)
│   └── types/
│       └── global.d.ts      # TypeScript definitions
├── docs/
│   ├── GUIDELINES.md     # AI generation guidelines
│   └── pipeline.drawio.png  # Workflow diagram
├── MANIFEST.md          # Core values and principles
└── README.md            # This file
```

### Creating a New Screen-Set

1. Create a new folder in `src/components/screensets/`
2. Add screens in `screens/` subfolder (each screen = one folder)
3. Register the screen-set in `screensetConfig.ts`
4. Switch to the new screen-set via the UI selector

See [GUIDELINES.md](docs/GUIDELINES.md) for detailed development guidelines.

### Building a Plugin/Integration

1. Create a new screen in your screen-set
2. Add UI components in the screen's folder
3. Define API contracts in `api.ts`
4. Simulate data in `data.ts`
5. Register the screen in `screensetConfig.ts`

**Example**: See `src/components/screensets/fullmix/screens/githelpers/` for a complete integration example.

## Documentation

- **[ROADMAP.md](docs/ROADMAP.md)**: Project roadmap
- **[MANIFEST.md](docs/MANIFEST.md)**: Core philosophy, principles, and values
- **[GUIDELINES.md](docs/GUIDELINES.md)**: Development guidelines for AI and humans
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: How to contribute to the project

## Community & Support

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Architecture questions and best practices [discord](https://discord.com/channels/1364665811125670018/1428468824130191410)
- **Examples**: See `src/components/screensets/` for working examples


## License

HAI3 is available under the [Apache License 2.0](LICENSE).

## Credits

Built with:
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling system
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [Lucide](https://lucide.dev/) - Icon library
