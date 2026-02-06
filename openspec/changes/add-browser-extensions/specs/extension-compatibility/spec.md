## ADDED Requirements

### Requirement: Classify extension compatibility at install and update time

The system SHALL evaluate each extension manifest and declared capabilities, then classify compatibility as `supported`, `partial`, or `unsupported`.

#### Scenario: Supported extension classification

- **GIVEN** an extension only requires capabilities supported by Min
- **WHEN** the extension is evaluated
- **THEN** the system SHALL classify it as `supported`

#### Scenario: Partial extension classification

- **GIVEN** an extension requires a mix of supported and unsupported capabilities
- **WHEN** the extension is evaluated
- **THEN** the system SHALL classify it as `partial`

#### Scenario: Unsupported extension classification

- **GIVEN** an extension depends on critical unsupported capabilities
- **WHEN** the extension is evaluated
- **THEN** the system SHALL classify it as `unsupported`

### Requirement: Explain compatibility results to users

The system SHALL provide user-visible reasons for compatibility classification.

#### Scenario: Partial support explanation shown

- **GIVEN** an extension is classified as `partial`
- **WHEN** the user views extension details
- **THEN** the system SHALL display which capabilities are unsupported or limited

#### Scenario: Unsupported explanation shown

- **GIVEN** an extension is classified as `unsupported`
- **WHEN** installation or enablement is attempted
- **THEN** the system SHALL display the blocking compatibility reasons

### Requirement: Re-evaluate compatibility when extension metadata changes

The system SHALL re-run compatibility checks when an installed extension version or manifest changes.

#### Scenario: Compatibility re-check on update

- **GIVEN** an installed extension receives updated metadata
- **WHEN** the extension is reloaded
- **THEN** the system SHALL recompute compatibility status

#### Scenario: Status transition is reflected

- **GIVEN** an extension compatibility changes from `supported` to `partial`
- **WHEN** re-evaluation completes
- **THEN** the new status SHALL be stored and shown in extension management UI

### Requirement: Enforce compatibility policy during activation

The system SHALL apply activation rules based on compatibility status.

#### Scenario: Supported extension can be enabled

- **GIVEN** an extension is `supported`
- **WHEN** the user enables it
- **THEN** activation SHALL succeed

#### Scenario: Unsupported extension activation is blocked

- **GIVEN** an extension is `unsupported`
- **WHEN** the user attempts to enable it
- **THEN** activation SHALL be blocked
- **AND** the user SHALL receive the compatibility reason
