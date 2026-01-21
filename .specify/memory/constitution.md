<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 1.0.0 → 1.1.0 (MINOR - new principle added)

Modified principles: None

Added sections:
  - VI. Git Standards (new principle)

Removed sections: None

Templates requiring updates:
  ✅ plan-template.md - Constitution Check section already supports dynamic gates
  ✅ spec-template.md - Requirements structure aligns with principles
  ✅ tasks-template.md - Phase structure supports security/testing requirements

Follow-up TODOs: None
================================================================================
-->

# Saturnalia Constitution

## Core Principles

### I. Responsive-First Design

All UI components MUST be designed mobile-first and scale gracefully to desktop viewports.

- Every page and component MUST be fully functional on viewports from 320px to 2560px
- Touch targets MUST be minimum 44x44px on mobile; hover states MUST degrade gracefully
- Layout breakpoints MUST be defined in a shared design system (e.g., sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Performance budget: First Contentful Paint < 1.5s on 3G; Largest Contentful Paint < 2.5s
- Images MUST use responsive formats (srcset/picture) with WebP/AVIF fallbacks

**Rationale**: Users access the application across diverse devices; mobile-first ensures baseline usability while progressive enhancement delivers rich desktop experiences.

### II. Security-First API Design

All API endpoints MUST follow OWASP API Security Top 10 guidelines and implement defense-in-depth.

- Authentication MUST use short-lived tokens (JWT < 15min) with secure refresh token rotation
- Authorization MUST be enforced at the API gateway AND service layer (zero-trust)
- All inputs MUST be validated, sanitized, and bounded (max lengths, allowed characters)
- Rate limiting MUST be applied per-endpoint with graduated throttling
- Sensitive data MUST never appear in URLs, logs, or error responses
- CORS policies MUST be explicit allowlists, never wildcards in production
- All endpoints MUST use TLS 1.3; HSTS headers MUST be present

**Rationale**: APIs are the attack surface; security cannot be bolted on later. Every endpoint is assumed hostile until proven otherwise.

### III. UX/UI Design Standards

All interfaces MUST meet WCAG 2.1 AA accessibility standards and follow established design system patterns.

- Color contrast MUST meet 4.5:1 for normal text, 3:1 for large text
- All interactive elements MUST be keyboard-navigable with visible focus indicators
- Form validation MUST provide inline, descriptive error messages (not just color)
- Loading states MUST be communicated visually AND to screen readers
- Navigation MUST be consistent across all pages; critical actions MUST be reachable in ≤3 clicks
- Design tokens (colors, spacing, typography) MUST be sourced from a single design system

**Rationale**: Accessible, consistent design reduces cognitive load, expands user reach, and minimizes support burden.

### IV. Test-Driven Quality

Critical paths MUST have automated test coverage; tests define the contract before implementation.

- API contracts MUST have contract tests validating request/response schemas
- Authentication and authorization flows MUST have integration tests
- UI components MUST have visual regression tests for responsive breakpoints
- Security-sensitive code MUST have explicit test cases for edge cases and abuse scenarios
- Test coverage for critical paths MUST be ≥80%; overall coverage SHOULD be ≥60%

**Rationale**: Tests document intent, prevent regressions, and enable confident refactoring. Security and auth code cannot rely on manual verification.

### V. Simplicity & Maintainability

Prefer simple, obvious solutions over clever abstractions; complexity MUST be justified.

- New dependencies MUST be evaluated for maintenance burden, security posture, and bundle size
- Abstractions MUST solve a demonstrated problem, not a hypothetical one (YAGNI)
- Code MUST be self-documenting; comments explain "why", not "what"
- Configuration MUST use environment variables with secure defaults
- Technical debt MUST be tracked and addressed within 2 sprints of identification

**Rationale**: Complexity compounds; every abstraction layer is a maintenance liability. Simple code is secure code.

### VI. Git Standards

All version control practices MUST follow established Git conventions for clarity, traceability, and collaboration.

- Commits MUST be atomic (one logical change per commit) with descriptive messages
- Commit messages MUST follow conventional format: `type(scope): description` (e.g., `feat(auth): add OAuth2 login`)
- Branches MUST use consistent naming: `feature/`, `fix/`, `hotfix/`, `chore/` prefixes
- Feature branches MUST be rebased on main before merge to maintain linear history
- Force-pushing to shared branches (main, develop) is FORBIDDEN
- PRs MUST reference related issues/tickets; squash merge for feature branches
- Sensitive data (secrets, credentials, PII) MUST never be committed; use `.gitignore` and pre-commit hooks
- Tags MUST follow semantic versioning for releases (e.g., `v1.2.3`)

**Rationale**: Clean Git history enables efficient debugging, code archaeology, and automated changelog generation. Consistent practices reduce friction in code review and collaboration.

## Security Requirements

Security is non-negotiable and MUST be addressed at every layer of the stack.

- **Data Protection**: PII MUST be encrypted at rest (AES-256) and in transit (TLS 1.3)
- **Secret Management**: Credentials MUST never be committed; use environment variables or secret managers
- **Dependency Security**: Automated vulnerability scanning MUST run on every PR; critical CVEs block merge
- **Audit Logging**: Security events (auth, access changes, data exports) MUST be logged immutably
- **Incident Response**: Security incidents MUST be documented and reviewed within 48 hours

## Development Workflow

All changes MUST follow a structured review and verification process.

- **Code Review**: All PRs require at least one approval; security-sensitive changes require security review
- **Quality Gates**: Linting, type checking, and tests MUST pass before merge
- **Deployment**: Staging deployment MUST precede production; rollback procedures MUST be documented
- **Documentation**: API changes MUST update OpenAPI specs; UI changes MUST update component docs

## Governance

This constitution is the authoritative source for development standards. All technical decisions MUST align with these principles.

- **Precedence**: Constitution supersedes conflicting practices, tribal knowledge, or expedient shortcuts
- **Amendments**: Changes require documented rationale, team review, and migration plan for existing code
- **Compliance**: PR reviews MUST verify principle adherence; violations require explicit justification
- **Exceptions**: Temporary exceptions MUST be tracked as tech debt with remediation timeline
- **Versioning**: Constitution follows semantic versioning (MAJOR.MINOR.PATCH)

**Version**: 1.1.0 | **Ratified**: 2026-01-20 | **Last Amended**: 2026-01-20
