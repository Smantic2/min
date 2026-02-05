## ADDED Requirements

### Requirement: Display modal for permission requests

The system SHALL display a modal dialog when a site requests a permission and no stored decision exists.

#### Scenario: Modal appears on permission request

- **GIVEN** a site requests a permission with no stored decision
- **WHEN** the permission system triggers the dialog
- **THEN** a modal SHALL appear centered in the browser window

#### Scenario: Modal shows site origin

- **GIVEN** "https://github.com" requests clipboard permission
- **WHEN** the modal displays
- **THEN** it SHALL prominently display "github.com" or "GitHub"

#### Scenario: Modal shows permission type

- **GIVEN** a site requests geolocation permission
- **WHEN** the modal displays
- **THEN** it SHALL display text explaining the permission (e.g., "wants to access your location")

### Requirement: Apple-style aesthetic

The modal SHALL follow Apple macOS design language with specific visual characteristics.

#### Scenario: Rounded corners

- **WHEN** the modal renders
- **THEN** it SHALL have rounded corners with 10px radius

#### Scenario: Backdrop blur

- **WHEN** the modal is visible
- **THEN** the background SHALL have a blur effect (backdrop-filter: blur)

#### Scenario: Subtle shadow

- **WHEN** the modal renders
- **THEN** it SHALL have a subtle drop shadow

#### Scenario: Clean typography

- **WHEN** the modal displays text
- **THEN** it SHALL use system fonts with appropriate hierarchy and spacing

### Requirement: Modal action buttons

The modal SHALL provide "Allow" and "Don't Allow" buttons for user action.

#### Scenario: Allow button

- **WHEN** the user clicks the "Allow" button
- **THEN** the modal SHALL close and the permission SHALL be granted

#### Scenario: Don't Allow button

- **WHEN** the user clicks the "Don't Allow" button
- **THEN** the modal SHALL close and the permission SHALL be denied

#### Scenario: Primary button styling

- **WHEN** the modal displays buttons
- **THEN** the "Allow" button SHALL have primary button styling (accent color)

#### Scenario: Secondary button styling

- **WHEN** the modal displays buttons
- **THEN** the "Don't Allow" button SHALL have secondary/neutral styling

### Requirement: Remember decision option

The modal SHALL include a checkbox to remember the user's decision for this site.

#### Scenario: Remember checkbox present

- **WHEN** the modal displays
- **THEN** it SHALL include a checkbox labeled "Remember my decision for this site" or similar

#### Scenario: Remember checked by default

- **WHEN** the modal initially displays
- **THEN** the remember checkbox SHALL be checked by default

#### Scenario: Remember unchecked

- **GIVEN** the user unchecks the remember checkbox
- **WHEN** they click Allow
- **THEN** the decision SHALL NOT be stored for future visits

### Requirement: Modal dismissal

The modal SHALL handle dismissal and cancellation appropriately.

#### Scenario: Escape key dismisses

- **WHEN** the user presses the Escape key
- **THEN** the modal SHALL close and the permission SHALL be denied

#### Scenario: Click outside dismisses

- **WHEN** the user clicks outside the modal on the backdrop
- **THEN** the modal SHALL close and the permission SHALL be denied

#### Scenario: Only one modal at a time

- **GIVEN** a modal is currently displayed for one permission request
- **WHEN** another permission request occurs
- **THEN** the second request SHALL be queued until the first modal closes

### Requirement: Permission icons

The modal SHOULD display an icon representing the permission type when possible.

#### Scenario: Clipboard icon

- **WHEN** clipboard permission is requested
- **THEN** the modal MAY display a clipboard icon

#### Scenario: Location icon

- **WHEN** geolocation permission is requested
- **THEN** the modal MAY display a location pin icon

#### Scenario: Notification icon

- **WHEN** notification permission is requested
- **THEN** the modal MAY display a bell icon
