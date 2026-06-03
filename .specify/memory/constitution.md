<!--
## Sync Impact Report

**Version change**: N/A (initial template) → 1.0.0
**Modified principles**: N/A — initial ratification from template
**Added sections**:
  - Core Principles: I. MVP Architecture, II. Testing Discipline, III. UI/UX Standards, IV. Code Standards
  - Development Workflow
  - Governance
**Removed sections**: Template placeholder sections replaced
**Templates requiring updates**:
  - ✅ spec-template.md — No changes required; already technology-agnostic
  - ✅ plan-template.md — Constitution Check section will enforce testing + MVP scope gates
  - ✅ tasks-template.md — Tests are REQUIRED per Testing Discipline principle; "optional" note updated
**Follow-up TODOs**: None — all placeholders resolved
-->

# Medical Appointments Constitution

## Core Principles

### I. MVP Architecture

This project is a Minimum Viable Product consisting of a frontend web application backed
by an in-memory data store. No external database, backend server, or persistent storage
is required for this MVP phase. All data persists only within the current browser session.

The MVP scope is intentional and fixed. Expansion beyond frontend + in-memory storage
MUST require a formal amendment to this constitution.

### II. Testing Discipline (NON-NEGOTIABLE)

All features MUST be validated by both unit tests and integration tests. Tests MUST cover
user-facing functionality and complete feature flows — testing isolated functions alone
is insufficient.

- Unit tests MUST cover individual components and business logic
- Integration tests MUST cover complete user scenarios end-to-end
- Tests MUST be written before or alongside implementation, never after
- A feature is not considered complete until all tests pass

**Rationale**: Isolated function tests have historically missed integration failures.
This project requires confidence at the user-journey level.

### III. UI/UX Standards

The user interface MUST be intuitive for scheduling and appointment assignment tasks
without requiring user training.

- Actions (add, edit, delete) MUST be discoverable without documentation
- Calendar navigation MUST require no more than 2 interactions to reach any date
- User feedback on actions (success, errors) MUST be visible and unambiguous
- Visual hierarchy MUST clearly separate calendar view, navigation, and action controls

**Rationale**: The core value of this application is usability. A technically correct
but confusing UI fails the product's primary purpose.

### IV. Code Standards

All code, comments, identifiers, and documentation MUST be written in English.
The project MUST follow established coding standards for its chosen language and
framework:

- Consistent naming conventions: camelCase for variables/functions, PascalCase for
  components and classes
- No dead code or commented-out blocks in committed code
- Files and modules MUST have clear, descriptive English names
- All public interfaces MUST have concise inline documentation

**Rationale**: English ensures consistent communication across contributors and tools.
Coding standards ensure maintainability as the MVP evolves toward production.

## Development Workflow

- Features follow the Specify workflow: spec → plan → tasks → implement
- Each user story MUST be independently testable before the next story begins
- All changes MUST be made on feature branches; direct commits to main are not permitted
- Tests MUST fail before implementation begins (Red-Green cycle)

## Governance

This constitution governs all technical and design decisions for the Medical Appointments
project. It supersedes informal conventions and ad-hoc decisions.

Amendments require:
1. A clear description of the change and its rationale
2. A version bump following semantic versioning (MAJOR/MINOR/PATCH):
   - MAJOR: Removal or redefinition of a principle
   - MINOR: New principle or section added
   - PATCH: Clarification or wording fix
3. Propagation to affected templates and documentation

All feature plans MUST include a Constitution Check verifying compliance with the
principles above. Violations MUST be justified in the Complexity Tracking section
of the implementation plan.

**Version**: 1.0.0 | **Ratified**: 2026-06-03 | **Last Amended**: 2026-06-03
