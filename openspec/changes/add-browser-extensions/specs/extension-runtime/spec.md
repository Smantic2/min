## ADDED Requirements

### Requirement: Load extensions in the regular tab session

The system SHALL load enabled extensions into the same persistent session used by regular tab web contents.

#### Scenario: Enabled extension is available in regular tab

- **GIVEN** an extension is installed and enabled
- **WHEN** a user opens a regular tab
- **THEN** extension functionality SHALL be available in that tab session

#### Scenario: Session mismatch is prevented

- **WHEN** extension runtime initialization occurs
- **THEN** the system SHALL target the regular tab session and MUST NOT rely only on unrelated sessions

### Requirement: Persist extension install state across restarts

The system SHALL persist extension metadata and enabled/disabled state across browser restarts.

#### Scenario: Enabled extension remains enabled

- **GIVEN** an extension is enabled
- **WHEN** the browser is restarted
- **THEN** the extension SHALL be loaded again as enabled

#### Scenario: Disabled extension remains disabled

- **GIVEN** an extension is disabled
- **WHEN** the browser is restarted
- **THEN** the extension SHALL NOT be loaded automatically

### Requirement: Support runtime lifecycle controls

The system SHALL support loading, unloading, enabling, and disabling extensions without requiring a full browser reinstall.

#### Scenario: Disable extension at runtime

- **GIVEN** an extension is currently enabled
- **WHEN** the user disables the extension
- **THEN** the extension SHALL stop applying to newly loaded pages in regular tabs

#### Scenario: Re-enable extension at runtime

- **GIVEN** an extension is currently disabled
- **WHEN** the user enables the extension
- **THEN** the extension SHALL be restored for newly loaded pages in regular tabs

### Requirement: Define private browsing behavior

The system SHALL define a strict policy for extensions in private tabs and apply it consistently.

#### Scenario: Private tab extension policy applied

- **WHEN** a private tab is created
- **THEN** the system SHALL apply the configured private-mode extension policy deterministically

#### Scenario: Initial private policy is disabled

- **GIVEN** initial extension release settings
- **WHEN** a private tab session is active
- **THEN** extension execution SHALL be disabled in private tabs

### Requirement: Fail safely when extension load errors occur

The system SHALL isolate extension load failures and preserve normal browsing behavior.

#### Scenario: Extension load failure does not block browsing

- **GIVEN** an extension fails to load during startup
- **WHEN** the browser initializes sessions
- **THEN** regular browsing SHALL continue
- **AND** the failed extension SHALL be marked with an error state
