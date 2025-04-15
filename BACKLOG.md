# BACKLOG

This file tracks the planned improvements and refactoring efforts for the Whetstone project.

## 🧹 Housekeeping & DX Boosts

* [ ] **Update Dependencies:**
    * Upgrade Expo to the most recent stable version
    * Upgrade all dependencies to their most recent stable versions
* [ ] **Add Useful Precommit Hooks:**
    * Implement pre-commit hooks (e.g., using Husky) to enforce linting (`eslint`) and formatting (`prettier`) automatically before commits. Ensure hooks cannot be bypassed (`--no-verify` forbidden).
* [ ] **Enforce Strictness:**
    * Ensure TypeScript `strict: true` is enabled and utilized consistently.
    * Forbid `any` types where possible.
    * Configure ESLint with strict rules and relevant plugins (TypeScript, React Native, accessibility).
    * Eliminate linter/type-checker suppression directives (`@ts-ignore`, `eslint-disable`) by fixing root causes.

## 🧪 Testing Strategy Enhancement

* [ ] **Enhance Testing Strategy:**
    * Assess current test coverage.
    * Prioritize adding integration/workflow tests verifying component collaboration (e.g., add/edit flows, Firebase interactions), mocking only at true external boundaries as per `TESTING_STRATEGY.md`.
    * Expand Detox E2E tests to cover core user flows beyond sign-up.
    * Ensure tests follow FIRST principles (Fast, Independent, Repeatable, Self-Validating, Timely/Thorough).

## 🔧 Refactoring & Philosophy Alignment

* [ ] **Aggressively Refactor:**
    * Continuously refactor code for simplicity, readability, maintainability, and testability, adhering strictly to `DEVELOPMENT_PHILOSOPHY.md`.
    * Break down large components/files (e.g., `Note.tsx`) into smaller, focused modules with clear responsibilities (Modularity principle).
    * Ensure clear separation of concerns (Core vs. Infrastructure) and adherence to Dependency Inversion.
    * Optimize for human understanding over premature performance optimization.
    * Prefer pure functions and immutability where practical.

## ✨ UI/UX & Feature Polish

* [ ] **UI Library Review:**
    * Evaluate the current UI libraries (`react-native-paper`, `@rneui/themed`) against project needs and modern alternatives.
    * Consider migrating to a single, consistent UI library if beneficial for DX and aesthetics.
* [ ] **Theme Overhaul:**
    * Refine light/dark themes (`Colors.ts`) for better contrast, accessibility, and modern aesthetics.
* [ ] **Navigation Refinement:**
    * Review and potentially refactor the navigation structure (`navigation/index.tsx`) for clarity and intuitiveness, especially for add/edit flows.
* [ ] **Empty State Improvements:**
    * Redesign "No books yet" and "No notes yet" screens to be more engaging and guide user actions.
* [ ] **Image Handling:**
    * Improve the `ImagePicker` component.
    * Add better loading/error states and placeholders for images (book covers, note images).
    * Enhance image upload progress feedback and reliability.
* [ ] **Micro-interactions:**
    * Introduce subtle animations and transitions (e.g., for swipe actions, tab changes, button presses) to enhance perceived responsiveness and UI polish.

## 📱 Platform Expansion

* [ ] **Android Support:**
    * Add Android platform configuration in app.json
    * Test and fix UI components for Android compatibility
    * Set up Android build pipeline and publishing workflow
    * Ensure feature parity between iOS and Android versions
