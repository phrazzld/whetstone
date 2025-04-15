# Testing Strategy

This document outlines our philosophy and strategy for automated testing. Effective testing is critical for ensuring software correctness, preventing regressions, enabling confident refactoring, providing living documentation, and ultimately driving better software design. Our approach aligns directly with our Core Principles, especially *Design for Testability* and *Modularity*.

---

## 1. Guiding Principles: Why and How We Test

Our testing efforts are guided by the following fundamental principles:

* **Purpose:** Tests exist primarily to verify that the software meets its functional requirements reliably, to prevent regressions as the codebase evolves, and to increase our confidence in deploying changes frequently and safely.
* **Simplicity & Clarity:** Test code *is* production code. It must be simple, clear, concise, and maintainable. Overly complex test setups or convoluted assertions often indicate complexity or poor design in the code under test itself.
* **Behavior Over Implementation:** Tests should primarily validate the observable *behavior* of a component through its public interface or API, not its internal implementation details. Testing behavior makes tests more resilient to refactoring and less brittle.
* **Testability is a Design Constraint:** We do not write code and *then* figure out how to test it. Testability is a primary consideration *during* design and implementation. **Crucially: If code proves difficult to test without resorting to extensive mocking of internal collaborators, this is a strong signal that the *code under test* likely needs refactoring (e.g., to improve separation of concerns, clarify interfaces, or reduce coupling) *before* attempting to write complex tests.**

---

## 2. Test Focus and Types: The Testing Landscape

We employ different types of automated tests, strategically focusing our efforts where they provide the most value and confidence relative to their cost (in terms of writing, execution time, and maintenance).

* **Unit Tests:** Highly focused tests verifying small, isolated pieces of logic. (See Section 3).
* **Integration / Workflow Tests:** Verify the collaboration *between* multiple components or modules through their defined interfaces. **These often provide the highest return on investment for ensuring application features work correctly.** (See Section 4).
* **End-to-End (E2E) Tests:** Validate complete user journeys or critical paths through the entire deployed system (e.g., via UI automation or public API calls). Used sparingly due to their higher cost, slower execution, and potential for flakiness.

While the "Testing Pyramid" is a common model, we prioritize *effectiveness*. We favor integration/workflow tests over heavily mocked unit tests when verifying component interactions.

---

## 3. Unit Testing Approach: Verifying Isolated Logic

Unit tests are most valuable for verifying the correctness of specific algorithms, complex calculations, data transformations, or other logic units that can be tested in relative isolation.

* **Scope:** Test a single function, method, or a small, cohesive set of functions/methods (e.g., a small utility class or struct) in isolation from its *internal* collaborators.
* **Dependencies:** **Crucially, do not mock internal collaborators** (other components, classes, structs, functions defined *within* the same application or service). If a piece of code requires extensive internal mocking to be tested, it's a design smell – refactor the code (see Principle 1d and Section 5). Abstracted *external* dependencies may be mocked according to the Mocking Policy (Section 5).
* **Goal:** Verify the logical correctness of the unit under test, including its handling of various inputs, outputs, edge cases, and boundary conditions. Ideal candidates are pure functions.
* **Rationale:** Unit tests provide fast, precise feedback on the correctness of isolated logic blocks. Keeping them truly "unit" (without internal mocks) ensures they are robust and don't hinder refactoring.
* **Implementation:**
    * **Go:** Use the standard `testing` package. Table-driven tests are excellent for covering multiple input/output scenarios concisely. Use standard assertions or libraries like `testify/assert` for clarity.
    * **TypeScript:** Use test runners like Jest or Vitest. Test function inputs/outputs directly. Utilize the framework's assertion matchers for clear and expressive checks.

---

## 4. Integration / Workflow Testing Approach (High Priority): Verifying Collaboration

These tests ensure that distinct parts of our application work together correctly to fulfill a feature requirement or use case. They operate at a higher level than unit tests, focusing on the interactions and contracts *between* components.

* **Scope:** Test the collaboration between two or more components/modules/layers through their public APIs or interfaces. Examples: Testing an HTTP handler's interaction with its underlying service; testing a service's interaction with its repository abstraction; testing a workflow involving multiple services.
* **Dependencies:** Use *real* implementations of internal collaborators whenever practical. Mocking should *only* occur at true external system boundaries as defined by our Mocking Policy (Section 5). For example, when testing `HTTP Handler -> Service -> Repository` flow, use the real `Service` implementation. Mock the `Repository` interface *only if* it represents an external database or API call.
* **Goal:** Verify that components integrate correctly, data flows accurately between them, contracts are honored, side effects occur as expected, and key user/system workflows produce the correct outcomes (including error handling).
* **Rationale:** Provides high confidence that the system works cohesively. Tests behavior closer to real-world usage. Less brittle to internal refactoring compared to heavily mocked unit tests. Directly validates the *Modularity* and *Interface* design.
* **Implementation:**
    * **Go:** Utilize `net/http/httptest` for in-process HTTP handler testing. Invoke exported functions/methods of packages directly to test their integration. For tests requiring external dependencies like databases, prefer using real instances managed via Docker containers (e.g., using `testcontainers-go`) over extensive mocking where feasible.
    * **TypeScript:** Use libraries like `supertest` for testing HTTP endpoints against running application instances (or in-process equivalents). Test service methods directly, providing mock implementations *only* for external dependencies injected via DI. Consider test containers for managing real database instances during tests.

---

## 5. Mocking Policy: Use Sparingly, At Boundaries Only (Crucial)

Our stance on mocking is conservative and critical for maintaining effective tests and good design.

* **Minimize Mocking:** Actively strive to design code and tests that require minimal mocking. Test complexity often reflects code complexity.
* **Mock Only True External System Boundaries:** Mocking is permissible *only* for interfaces/abstractions that represent systems or concerns genuinely *external* to the service/application being tested, and which are impractical or undesirable to use directly in automated tests. These typically include:
    * Network I/O (Third-party APIs, other distinct microservices)
    * Databases / External Data Stores (when not using test containers/in-memory fakes)
    * Filesystem Operations
    * System Clock (use injectable clock abstractions)
    * External Message Brokers / Caches
* **Abstract External Dependencies First:** Ensure external dependencies are *always* accessed through interfaces or abstractions defined *within* your own codebase (following the Ports & Adapters / Dependency Inversion principle). Tests should mock *these local abstractions*, not concrete external library clients directly.
* **NO Mocking Internal Collaborators:** **It is an anti-pattern to mock classes, structs, functions, or interfaces that are defined and owned *within* the same application/service solely for the purpose of isolating another internal component.** Feeling the need to do this indicates a design flaw (likely high coupling, poor separation of concerns, or violation of dependency inversion). **The correct action is to refactor the code under test to improve its design and testability.**

**Rationale:** This strict policy ensures tests verify realistic interactions, remain robust against internal refactoring, provide genuine confidence, and act as accurate indicators of design health. Over-mocking hides design problems and leads to tests that verify the mocks, not the actual integrated behavior.

**Implementation:**
* **Go:** Define `interface{}` types for external dependencies in your core logic. Use standard mocking libraries (`gomock`, `testify/mock`) or simple hand-rolled fakes to implement these interfaces in your tests.
* **TypeScript:** Define `interface` or `abstract class` contracts for external dependencies. Use the mocking features of your test framework (e.g., Jest's `jest.fn()`, `jest.spyOn()`, `jest.mock()`) or libraries like Sinon.JS to mock these abstractions, typically provided via Dependency Injection.

---

## 6. Desired Test Characteristics: The FIRST Properties

We aim for tests that embody the FIRST principles, making our test suite trustworthy and effective:

* **Fast:** Tests must run quickly to provide rapid feedback during development and in CI. Slow tests reduce productivity and are run less frequently.
* **Independent / Isolated:** Each test must be runnable independently of others, in any order. Tests should set up their own preconditions and clean up afterward, not relying on shared mutable state or the side effects of other tests.
* **Repeatable / Reliable:** Tests must consistently produce the same pass/fail result each time they are run in the same environment. Eliminate sources of non-determinism (uncontrolled concurrency, reliance on real time/dates, random data without seeding). Flaky tests undermine confidence in the entire suite.
* **Self-Validating:** Tests must explicitly assert their expected outcomes and clearly report pass or fail without requiring manual inspection of output logs.
* **Timely / Thorough:** Tests should ideally be written alongside or slightly before the production code (TDD). They need to provide *thorough* coverage of the intended functionality, including happy paths, error conditions, edge cases, and boundary values relevant to the component's responsibility.

---

## 7. Test Data Management: Realistic and Maintainable

Effective management of test data is crucial for readable and robust tests.

* **Clarity & Intent:** Test data setup should clearly reveal the specific scenario being tested. Use descriptive variable names instead of "magic" values. Make the relationship between inputs and expected outputs obvious.
* **Realism:** Use test data that reasonably approximates real-world data characteristics, especially for integration tests, to uncover issues that might not appear with overly simplistic data.
* **Maintainability:** Avoid duplicating complex object creation logic in multiple tests. Employ patterns like Test Data Builders, Object Mothers, Factories, or simple helper functions to create test fixtures consistently and reduce boilerplate.
* **Isolation:** Ensure data used or created by one test does not persist and interfere with subsequent tests. Clean up database records, reset state, etc., between test executions (test framework hooks or helper functions are useful here).
