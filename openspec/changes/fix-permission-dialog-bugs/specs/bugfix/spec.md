## ADDED Requirements

### Requirement: Permission dialog accesses tabs correctly

The permission dialog module SHALL access the global `tabs` variable directly instead of through `tabState.tabs`, following Min's established patterns for global state access.

#### Scenario: Tab access on permission request

- **WHEN** a site requests a permission and the dialog needs to hide the current tab
- **THEN** the system accesses `tabs.getSelected()` directly (not `tabState.tabs.getSelected()`)

#### Scenario: Tabs not yet initialized

- **WHEN** a permission request arrives before `tabs` is initialized
- **THEN** the system handles the undefined case gracefully without throwing errors

### Requirement: Debug logging is removed for production

The codebase SHALL NOT contain verbose debug logging statements added during development troubleshooting. Only warning and error logs for exceptional conditions are permitted.

#### Scenario: Normal permission flow

- **WHEN** a user triggers a permission request flow
- **THEN** no debug console.log statements are output to the console

#### Scenario: Error conditions

- **WHEN** an error occurs in the permission system (e.g., window not found)
- **THEN** the system logs a warning/error message to aid debugging

### Requirement: Code follows Min conventions

All modified code SHALL follow Min browser's established conventions:

- StandardJS style (no semicolons)
- Global variables for shared state (`tabs`, `tasks`, `ipc`)
- JSDoc comments on public functions
- Defensive null checks for async-initialized globals

#### Scenario: Code style compliance

- **WHEN** the code is linted with StandardJS
- **THEN** no style errors are reported

#### Scenario: Documentation present

- **WHEN** a developer reads a public function
- **THEN** JSDoc comments explain the function's purpose, parameters, and return value
