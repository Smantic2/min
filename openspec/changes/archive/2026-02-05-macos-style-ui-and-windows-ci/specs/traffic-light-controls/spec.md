## ADDED Requirements

### Requirement: Window controls display as traffic light buttons

The browser SHALL display window control buttons (close, minimize, maximize) as circular "traffic light" style buttons on all platforms (Windows, Linux, macOS).

- Close button SHALL be red (#FF5F57)
- Minimize button SHALL be yellow (#FFBD2E)
- Maximize button SHALL be green (#28C840)
- Buttons SHALL be circular with consistent 12px diameter
- Buttons SHALL be positioned in the top-left corner of the window

#### Scenario: Traffic lights visible on Windows

- **WHEN** the browser launches on Windows without separate titlebar
- **THEN** three circular buttons (red, yellow, green) appear in the top-left of the navbar

#### Scenario: Traffic lights visible on Linux

- **WHEN** the browser launches on Linux without separate titlebar
- **THEN** three circular buttons (red, yellow, green) appear in the top-left of the navbar

#### Scenario: Traffic lights visible on macOS

- **WHEN** the browser launches on macOS without separate titlebar
- **THEN** three circular buttons (red, yellow, green) appear in the top-left of the navbar

### Requirement: Traffic light buttons have hover states

The window control buttons SHALL provide visual feedback on hover to indicate interactivity.

- On hover, buttons SHALL slightly brighten or show a subtle glow effect
- Close button hover MAY show an "×" icon inside the circle
- Minimize button hover MAY show a "−" icon inside the circle
- Maximize button hover MAY show a "+" or expand icon inside the circle

#### Scenario: Hover feedback on close button

- **WHEN** user hovers over the red close button
- **THEN** the button visually changes to indicate it is interactive

#### Scenario: Hover feedback on minimize button

- **WHEN** user hovers over the yellow minimize button
- **THEN** the button visually changes to indicate it is interactive

### Requirement: Traffic light buttons perform window actions

Each traffic light button SHALL perform its corresponding window action when clicked.

- Close button SHALL close the current window
- Minimize button SHALL minimize the window to taskbar/dock
- Maximize button SHALL toggle between maximized and restored window state

#### Scenario: Close button closes window

- **WHEN** user clicks the red close button
- **THEN** the browser window closes

#### Scenario: Minimize button minimizes window

- **WHEN** user clicks the yellow minimize button
- **THEN** the browser window minimizes to the taskbar/dock

#### Scenario: Maximize button toggles maximize

- **WHEN** user clicks the green maximize button on a non-maximized window
- **THEN** the window maximizes to fill the screen

#### Scenario: Maximize button restores window

- **WHEN** user clicks the green maximize button on a maximized window
- **THEN** the window restores to its previous size and position

### Requirement: Traffic lights hidden in fullscreen mode

The traffic light buttons SHALL NOT be visible when the browser is in fullscreen mode.

#### Scenario: Fullscreen hides traffic lights

- **WHEN** the browser enters fullscreen mode
- **THEN** the traffic light buttons are hidden

#### Scenario: Exit fullscreen shows traffic lights

- **WHEN** the browser exits fullscreen mode
- **THEN** the traffic light buttons become visible again

### Requirement: Traffic lights hidden with separate titlebar

The traffic light buttons SHALL NOT be visible when the user has enabled the "Use separate titlebar" setting, as the native titlebar provides window controls.

#### Scenario: Separate titlebar hides custom controls

- **WHEN** the "Use separate titlebar" setting is enabled
- **THEN** the traffic light buttons are hidden
- **AND** the native window titlebar controls are used instead
