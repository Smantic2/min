## ADDED Requirements

### Requirement: Settings page section

The system SHALL provide a section in Min's settings to view and manage site permissions.

#### Scenario: Navigate to permissions

- **WHEN** the user opens Min settings
- **THEN** there SHALL be a "Site Permissions" or "Permissions" section accessible

#### Scenario: View permissions by site

- **WHEN** the user opens the permissions settings
- **THEN** they SHALL see a list of sites that have stored permission decisions

#### Scenario: View permissions by type

- **WHEN** the user views permissions for a specific site
- **THEN** they SHALL see which permissions are granted, denied, or set to prompt

### Requirement: Display permission details

The settings SHALL display meaningful information about stored permissions.

#### Scenario: Show site origin

- **GIVEN** permissions exist for "github.com"
- **WHEN** viewing the permissions list
- **THEN** "github.com" SHALL be displayed as the site identifier

#### Scenario: Show permission type

- **GIVEN** "github.com" has clipboard permission granted
- **WHEN** viewing permissions for "github.com"
- **THEN** "Clipboard" or "clipboard-read" SHALL be listed with status "Granted"

#### Scenario: Show permission status

- **GIVEN** a stored permission exists
- **WHEN** viewing permissions
- **THEN** each permission SHALL display its current status (Granted/Denied)

### Requirement: Revoke permissions

The user SHALL be able to revoke previously granted or denied permissions.

#### Scenario: Revoke single permission

- **GIVEN** "github.com" has clipboard permission granted
- **WHEN** the user clicks "Remove" or "Revoke" for that permission
- **THEN** the permission SHALL be deleted from storage
- **AND** the next request SHALL show the permission dialog again

#### Scenario: Revoke all site permissions

- **GIVEN** "github.com" has multiple permissions stored
- **WHEN** the user clicks "Remove all permissions for this site"
- **THEN** all permissions for "github.com" SHALL be deleted

#### Scenario: Revoke all permissions globally

- **GIVEN** permissions exist for multiple sites
- **WHEN** the user clicks "Clear all permissions"
- **THEN** all stored permission decisions SHALL be deleted

### Requirement: Empty state

The settings SHALL display an appropriate message when no permissions are stored.

#### Scenario: No permissions stored

- **GIVEN** no permission decisions have been stored
- **WHEN** the user opens permissions settings
- **THEN** a message SHALL display: "No site permissions stored. Permissions will appear here when you grant or deny access to websites."

### Requirement: Search/filter permissions

The settings MAY provide search or filter functionality for sites with many permissions.

#### Scenario: Search sites

- **GIVEN** permissions exist for multiple sites
- **WHEN** the user types in a search box
- **THEN** the site list SHALL filter to matching origins

### Requirement: Permission explanations

The settings SHOULD provide brief explanations of what each permission allows.

#### Scenario: Clipboard explanation

- **WHEN** viewing clipboard permission details
- **THEN** explanatory text MAY display: "Allows the site to read from or write to your clipboard"

#### Scenario: Geolocation explanation

- **WHEN** viewing geolocation permission details
- **THEN** explanatory text MAY display: "Allows the site to access your physical location"
