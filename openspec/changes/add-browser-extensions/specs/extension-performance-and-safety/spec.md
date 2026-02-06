## ADDED Requirements

### Requirement: Keep extension runtime disabled by default

The system SHALL keep extension runtime initialization disabled unless extensions are installed and enabled.

#### Scenario: No extension overhead when unused

- **GIVEN** no extensions are enabled
- **WHEN** Min starts
- **THEN** extension runtime paths SHALL remain inactive

#### Scenario: Runtime activates only when needed

- **GIVEN** at least one extension is enabled
- **WHEN** Min starts
- **THEN** extension runtime initialization SHALL occur for eligible sessions only

### Requirement: Enforce extension safety boundaries

The system SHALL isolate extension behavior from privileged browser UI control paths.

#### Scenario: Extension cannot escalate through generic IPC

- **WHEN** extension-driven events are processed
- **THEN** privileged operations SHALL require explicit validated handlers

#### Scenario: Extension failure does not crash browser shell

- **GIVEN** an extension throws a runtime error
- **WHEN** error handling executes
- **THEN** browser shell functionality SHALL continue operating

### Requirement: Define precedence with existing policy layers

The system SHALL define and consistently apply precedence rules between extension behavior and existing Min filtering, permission, and request handling policies.

#### Scenario: Deterministic request handling order

- **WHEN** a network request is processed with both Min policy handlers and extension hooks active
- **THEN** the system SHALL apply the documented precedence order deterministically

#### Scenario: Min safety policy remains enforceable

- **GIVEN** a conflict between extension behavior and Min safety policy
- **WHEN** conflict resolution occurs
- **THEN** the system SHALL enforce Min's safety policy outcome

### Requirement: Track extension performance impact

The system SHALL collect extension performance telemetry sufficient to detect regressions.

#### Scenario: Telemetry records startup and memory impact

- **WHEN** extensions are enabled
- **THEN** telemetry SHALL include startup overhead and memory impact metrics attributable to extension runtime

#### Scenario: Telemetry records request and IPC overhead

- **WHEN** extensions are active during browsing
- **THEN** telemetry SHALL include request interception and IPC overhead metrics

### Requirement: Surface extension performance status

The system SHALL surface extension-related performance health for user and developer diagnostics.

#### Scenario: Performance warning on threshold breach

- **GIVEN** extension runtime exceeds configured performance thresholds
- **WHEN** thresholds are evaluated
- **THEN** the system SHALL record a warning state linked to the relevant extension(s)
