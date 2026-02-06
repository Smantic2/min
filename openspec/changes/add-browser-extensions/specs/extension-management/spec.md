## ADDED Requirements

### Requirement: Provide extension management in Settings

The system SHALL provide an Extensions section in Settings where users can view and manage installed extensions.

#### Scenario: Extensions section is discoverable

- **WHEN** the user opens Settings
- **THEN** an Extensions management section SHALL be available

#### Scenario: Installed extensions are listed

- **GIVEN** one or more extensions are installed
- **WHEN** the user opens the Extensions section
- **THEN** the system SHALL list each extension with its name and status

### Requirement: Support installing unpacked extensions

The system SHALL allow users to install unpacked extensions from a local directory.

#### Scenario: Successful unpacked install

- **GIVEN** a valid extension directory is selected
- **WHEN** the user confirms installation
- **THEN** the extension SHALL be added to the installed extension list

#### Scenario: Invalid unpacked install is rejected

- **GIVEN** a selected directory is not a valid extension package
- **WHEN** installation is attempted
- **THEN** installation SHALL fail with a clear error message

### Requirement: Support enable and disable controls

The system SHALL allow users to enable or disable each installed extension.

#### Scenario: Disable from settings list

- **GIVEN** an extension is enabled
- **WHEN** the user toggles it off
- **THEN** its status SHALL update to disabled

#### Scenario: Enable from settings list

- **GIVEN** an extension is disabled and compatible
- **WHEN** the user toggles it on
- **THEN** its status SHALL update to enabled

### Requirement: Support removing installed extensions

The system SHALL allow users to remove installed extensions.

#### Scenario: Remove extension

- **GIVEN** an extension is installed
- **WHEN** the user confirms removal
- **THEN** the extension SHALL be removed from managed extension state

#### Scenario: Remove preserves other extensions

- **GIVEN** multiple extensions are installed
- **WHEN** one extension is removed
- **THEN** remaining extensions SHALL keep their prior states

### Requirement: Show extension metadata and diagnostics

The system SHALL expose extension metadata relevant to trust and troubleshooting.

#### Scenario: Metadata includes source and identifier

- **WHEN** the user opens extension details
- **THEN** the system SHALL display extension ID, source path, and version

#### Scenario: Error state is visible

- **GIVEN** an extension has a load or runtime error
- **WHEN** the user views extension details
- **THEN** the system SHALL display an actionable error summary
