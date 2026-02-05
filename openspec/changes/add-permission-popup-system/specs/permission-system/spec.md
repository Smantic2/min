## ADDED Requirements

### Requirement: Intercept web permission requests

The system SHALL intercept all web permission requests from webview content before they reach the browser's default handler.

#### Scenario: Clipboard permission requested

- **WHEN** a webpage invokes `navigator.clipboard.readText()` or `navigator.clipboard.writeText()`
- **THEN** the system SHALL intercept the request instead of auto-denying

#### Scenario: Geolocation permission requested

- **WHEN** a webpage invokes `navigator.geolocation.getCurrentPosition()` or `watchPosition()`
- **THEN** the system SHALL intercept the request

#### Scenario: Notification permission requested

- **WHEN** a webpage invokes `Notification.requestPermission()`
- **THEN** the system SHALL intercept the request

#### Scenario: Media permissions requested

- **WHEN** a webpage invokes `getUserMedia()` for audio or video
- **THEN** the system SHALL intercept the request

### Requirement: Check stored permissions before prompting

The system SHALL check the permission store before displaying any UI to the user.

#### Scenario: Previously granted permission

- **GIVEN** the user has previously granted clipboard permission for "github.com"
- **WHEN** "github.com" requests clipboard access
- **THEN** the system SHALL automatically grant the request without showing UI

#### Scenario: Previously denied permission

- **GIVEN** the user has previously denied geolocation permission for "google.com"
- **WHEN** "google.com" requests geolocation access
- **THEN** the system SHALL automatically deny the request without showing UI

#### Scenario: No previous decision

- **GIVEN** no stored decision exists for "example.com" camera permission
- **WHEN** "example.com" requests camera access
- **THEN** the system SHALL trigger the permission dialog flow

### Requirement: Store permission decisions

The system SHALL persistently store user permission decisions keyed by site origin and permission type.

#### Scenario: Store granted permission

- **WHEN** the user grants clipboard permission for "vscode.dev" with "remember" checked
- **THEN** the system SHALL store `{ "vscode.dev": { "clipboard-read": "granted" } }`

#### Scenario: Store denied permission

- **WHEN** the user denies geolocation permission for "maps.google.com" with "remember" checked
- **THEN** the system SHALL store `{ "maps.google.com": { "geolocation": "denied" } }`

#### Scenario: Do not store when remember is unchecked

- **WHEN** the user grants notification permission for "twitter.com" with "remember" unchecked
- **THEN** the system SHALL NOT persist the decision

### Requirement: Respond to permission requests

The system SHALL respond to the webview with the user's decision after permission handling completes.

#### Scenario: Respond with granted

- **WHEN** the user grants a permission request
- **THEN** the system SHALL resolve the web permission promise with "granted" or allowed access

#### Scenario: Respond with denied

- **WHEN** the user denies a permission request
- **THEN** the system SHALL reject the web permission promise or resolve with "denied"

### Requirement: Support permission types

The system SHALL support at minimum these permission types: clipboard-read, clipboard-write, geolocation, notifications, camera, microphone.

#### Scenario: Clipboard read permission

- **WHEN** the system detects a clipboard-read permission request
- **THEN** it SHALL handle it as type "clipboard-read"

#### Scenario: Camera permission

- **WHEN** the system detects a getUserMedia video request
- **THEN** it SHALL handle it as type "camera"

#### Scenario: Microphone permission

- **WHEN** the system detects a getUserMedia audio request
- **THEN** it SHALL handle it as type "microphone"
