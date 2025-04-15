# Architecture Guidelines

This document translates our Core Principles—particularly Simplicity, Modularity, and Testability—into actionable guidelines for structuring our software applications. Architecture is not about rigid dogma, but about making conscious design choices that lead to systems that are maintainable, adaptable, testable, and easy to reason about. These guidelines provide a default approach optimized for building focused, composable, and robust applications primarily in Go and TypeScript.

---

## 1. Embrace the Unix Philosophy: Build Focused, Composable Units

**Guideline:** Design components (services, libraries, modules, functions, CLIs) to "do one thing and do it well." Aim for minimal, well-defined responsibilities, clear inputs, and predictable outputs for each unit. Prefer building larger systems by composing these smaller, specialized units rather than creating expansive, monolithic entities that attempt to do too much.

**Rationale:** Directly embodies *Simplicity* and *Modularity*. Focused components are significantly easier to understand, develop, test independently, deploy, scale, and even replace entirely. Composition provides flexibility and encourages reuse, leading to more resilient and adaptable systems.

**Implementation:** Think in terms of clear data flows: inputs -> transformation -> outputs. Resist the temptation to add unrelated responsibilities to an existing component; create a new, focused one instead. Define clear boundaries and contracts between composed units.

---

## 2. Strict Separation of Concerns: Isolate the Core

**Guideline:** Ruthlessly separate the application's core business logic and domain knowledge from its infrastructure concerns. Infrastructure includes anything related to external interactions: UI, database access, network calls (HTTP clients/servers), file system operations, CLI argument parsing, third-party API integrations, etc. The core logic should remain "pure," unaware of the specific mechanisms used for I/O or external communication.

**Rationale:** This is paramount for *Modularity* and *Design for Testability*. The core business rules—the most valuable part of the application—can be developed and tested in complete isolation, without needing slow or complex setups (like databases or web servers). It allows infrastructure details to be changed or replaced (e.g., swapping a REST API for gRPC, changing database vendors) with minimal impact on the stable core logic.

**Implementation:** Employ architectural patterns that enforce this separation, such as Hexagonal Architecture (Ports & Adapters), Clean Architecture, or even a well-defined Layered Architecture. The key is defining clear boundaries, typically using interfaces:
* **Go:** Core logic packages (e.g., `/internal/domain`, `/internal/app`) define `interface{}` types representing necessary collaborations (e.g., `UserRepository`, `OrderNotifier`). Infrastructure packages (e.g., `/internal/platform/database`, `/internal/platform/httpadapter`) implement these interfaces.
* **TypeScript:** Core logic modules (`src/core/`, `src/domain/`) define `interface` types or rely on constructor parameters typed with interfaces. Infrastructure modules (`src/infrastructure/`, `src/platform/`) provide concrete classes that implement these interfaces.

---

## 3. Dependency Inversion Principle: Point Dependencies Inward

**Guideline:** Ensure that high-level policy (core application/business logic) does not depend directly on low-level details (infrastructure). Instead, both should depend on abstractions (interfaces defined by the core). Consequently, source code dependencies must always point *inwards*, from outer layers (infrastructure) towards the central core logic. Infrastructure code implements interfaces defined *in* the core.

**Rationale:** This principle is the mechanism that enables effective *Separation of Concerns* and *Testability*. It decouples the stable, high-value core logic from volatile, low-level implementation details. This makes the system more flexible, maintainable, and robust against changes in external technologies or libraries.

**Implementation:**
* **Go:** Core packages define `interface{}` types. Infrastructure packages `import` core packages solely to implement those interfaces or use core data types. Crucially, core packages **never** import infrastructure packages. Dependencies are typically "injected" (passed as interface values) into core components during application initialization (e.g., in `main.go` or a setup function).
* **TypeScript:** Core modules define `interface` or `abstract class` contracts. Use Dependency Injection (constructor injection is preferred for its explicitness) to provide concrete infrastructure implementations (classes implementing the core interfaces) to the core logic components. Avoid `new DatabaseClient()` or similar infrastructure instantiation *within* core business logic files.

---

## 4. Package/Module Structure: Organize by Feature, Not Type

**Guideline:** Structure your codebase primarily around business features, domains, or capabilities, rather than grouping files by their technical type or layer. For instance, prefer `src/orders/` (containing order-related domain logic, data access, handlers, etc.) over separate `src/controllers/`, `src/services/`, `src/repositories/` directories containing fragments from many different features.

**Rationale:** Enhances *Modularity* and *Maintainability*. Co-locating all code related to a specific feature makes it significantly easier to find, understand, and modify that feature's functionality. It improves cohesion within feature modules and reduces coupling between unrelated features. This structure also simplifies tasks like refactoring or even removing a feature entirely.

**Implementation:**
* **Go:** Use clear, feature-oriented package names within `/internal/` (for application-specific code) or `/pkg/` (for reusable library code). The `/cmd/` directory contains the `main` packages for executables. Example: `/internal/inventory/`, `/internal/checkout/`, `/internal/platform/auth/` (for cross-cutting platform concerns).
* **TypeScript:** Use directories within `src/` to delineate features or domains. Example: `src/catalog/`, `src/userProfile/`, `src/shared/` (for truly cross-cutting code). Infrastructure code might live in a dedicated `src/platform/` or `src/infrastructure/` directory, organized internally as needed.

---

## 5. API Design: Define Explicit Contracts

**Guideline:** Whether designing internal APIs between software modules or external APIs exposed by services (REST, gRPC, GraphQL, CLIs), define clear, explicit, and robust contracts. Precisely document expected inputs, outputs, behavior, invariants, and potential error conditions. For external APIs, prioritize stability, adopt a clear versioning strategy early, and consider operational aspects like idempotency for state-changing operations.

**Rationale:** Supports *Modularity* and *Explicit is Better than Implicit*. Well-defined contracts are essential for enabling independent development, testing, and evolution of different system components or services. They reduce integration friction and serve as crucial documentation.

**Implementation:**
* **Internal APIs:** Leverage the type system. Use Go interfaces or TypeScript `interface`/`type` definitions and clear function signatures.
* **External REST APIs:** Use the OpenAPI (Swagger) specification as the source of truth. Keep the specification accurate and versioned. Consider tools for generating server/client code or documentation from the spec.
* **External gRPC APIs:** Define services and messages rigorously using `.proto` files. Use semantic versioning for Protobuf package names.
* **CLIs:** Provide clear help messages (`--help` flag), document arguments and flags, and ensure consistent exit codes.

---

## 6. Configuration Management: Externalize Environment-Specifics

**Guideline:** Never hardcode configuration values—especially those that vary between environments (development, testing, production) or contain sensitive information—directly within the source code. This includes database connection strings, external API endpoints, API keys, ports, feature flags, etc. Externalize all such configuration.

**Rationale:** Crucial for *Maintainability*, deployment flexibility, and security. Externalized configuration allows the same compiled artifact or codebase to run correctly in different environments without modification. It keeps secrets out of version control and simplifies configuration updates.

**Implementation:** Prefer environment variables for deployment flexibility (especially in containerized environments). Use configuration files (e.g., `.env`, YAML, TOML) for local development convenience. Employ libraries (e.g., Viper, koanf in Go; `dotenv`, node-config in TypeScript) to load, parse, and validate configuration from multiple sources. Define strongly-typed configuration objects/structs within the application.

---

## 7. Consistent Error Handling: Fail Predictably and Informatively

**Guideline:** Establish and consistently apply a clear error handling strategy throughout the application. Distinguish between expected, recoverable errors (e.g., invalid user input, resource not found) and unexpected, potentially fatal bugs (e.g., nil pointer dereference, unhandled exceptions). Propagate errors clearly, adding contextual information when helpful, but avoid excessive nesting that obscures the root cause. Define explicit error handling boundaries (e.g., top-level HTTP middleware, message queue consumers, main function) where errors are caught, logged appropriately, and translated into meaningful responses or operational signals (e.g., HTTP status codes, standardized error JSON payloads, process exit codes).

**Rationale:** Supports *Maintainability*, robustness, and operational clarity. Consistent error handling makes debugging significantly easier and application behavior more predictable. Informative error reporting helps consumers (API clients, users, operators) understand failures. Prevents unexpected crashes due to unhandled errors.

**Implementation:**
* **Go:** Embrace the standard `error` interface. Return errors explicitly from functions that can fail. Use `errors.Is` and `errors.As` (introduced in Go 1.13) for inspecting error chains. Avoid `panic` for recoverable error conditions; reserve it for truly exceptional, unrecoverable situations. Define custom error types or use sentinel errors (via `errors.New` or `fmt.Errorf` with `%w`) when specific error semantics need to be communicated programmatically.
* **TypeScript:** Utilize the standard `Error` object and potentially create custom error subclasses (e.g., `ValidationError extends Error`, `NotFoundError extends Error`) for specific failure modes. Handle Promise rejections consistently, typically using `async/await` with `try...catch` blocks. Clearly document potential exceptions or rejections in function/method signatures (e.g., using TSDoc `@throws`). Implement error handling middleware or wrappers at application boundaries to catch unhandled errors, log them, and return appropriate responses.
