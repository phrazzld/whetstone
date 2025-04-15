# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands
- Start dev server: `yarn start`
- Run on iOS: `yarn ios`
- Run tests: `yarn test`
- Run single test: `yarn test -t "test name pattern"`
- Run e2e tests: `detox test -c ios.sim`

## Code Style Guidelines
- **TypeScript**: Use strict typing (no `any` types if possible)
- **Component structure**: Functional components with typed props, React hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **File Structure**: Component files export single component matching filename
- **Imports**: Group imports (React, external libs, internal components/utils)
- **Error handling**: Use try/catch with meaningful error messages
- **Theme**: Use themed components from components/Themed.tsx
- **Firebase**: Use hooks for data fetching, follow Firestore collection patterns
- **Tests**: Component tests use react-test-renderer, e2e tests use Detox
- **Style**: Use StyleSheet for component-specific styles, constants/Colors for palette