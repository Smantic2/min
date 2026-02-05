## ADDED Requirements

### Requirement: Appearance section in Settings

The Settings page SHALL include an "Appearance" section that groups visual customization options.

- The section SHALL appear after the "Dark Mode" settings
- The section SHALL contain navbar color customization controls

#### Scenario: Appearance section visible in settings

- **WHEN** user opens the Settings page
- **THEN** an "Appearance" section is visible with color customization options

### Requirement: Navbar color presets

The Appearance settings SHALL provide preset color options for the navbar.

- At least 8 preset colors SHALL be available
- Presets SHALL include subtle, attractive tones (e.g., soft blue, sage green, warm rose, lavender)
- Each preset SHALL be displayed as a clickable color swatch
- Clicking a preset SHALL immediately apply that color to the navbar

#### Scenario: Select color preset

- **WHEN** user clicks on a blue color preset swatch
- **THEN** the navbar background changes to that blue color
- **AND** the setting is persisted

#### Scenario: Presets display as swatches

- **WHEN** user views the Appearance section
- **THEN** color presets are displayed as circular or rounded color swatches

### Requirement: Custom color picker

The Appearance settings SHALL provide a custom color picker for users who want colors beyond the presets.

- A color picker input SHALL allow selection of any color
- Selected custom color SHALL be applied to the navbar immediately

#### Scenario: Pick custom color

- **WHEN** user selects a custom color using the color picker
- **THEN** the navbar background changes to that color
- **AND** the setting is persisted

### Requirement: Navbar opacity/transparency control

The Appearance settings SHALL provide an opacity slider for the navbar color.

- Slider SHALL range from 0% (fully transparent) to 100% (fully opaque)
- Default opacity SHALL be 100%
- Changes to opacity SHALL apply immediately without restart
- The opacity affects the custom/preset color, not the entire navbar

#### Scenario: Reduce navbar opacity

- **WHEN** user moves the opacity slider to 50%
- **THEN** the navbar background becomes semi-transparent
- **AND** content behind the navbar is partially visible

#### Scenario: Full opacity by default

- **WHEN** user has not customized opacity
- **THEN** the navbar opacity is 100% (fully opaque)

### Requirement: Reset to default appearance

The Appearance settings SHALL provide a way to reset colors to default.

- A "Reset to default" button or option SHALL be available
- Resetting SHALL clear custom color and opacity settings
- After reset, navbar follows the default theme behavior (site theme or dark mode colors)

#### Scenario: Reset clears customization

- **WHEN** user clicks "Reset to default"
- **THEN** custom navbar color is cleared
- **AND** opacity returns to 100%
- **AND** navbar uses default theme colors

### Requirement: Custom color persists across sessions

The selected navbar color and opacity SHALL persist when the browser is closed and reopened.

- Settings SHALL be stored in the user's settings file
- On browser launch, custom color SHALL be applied before first paint if possible

#### Scenario: Color persists after restart

- **WHEN** user sets a custom navbar color and restarts the browser
- **THEN** the navbar displays with the previously selected color

### Requirement: Site theme interaction

When the user has both custom navbar color AND site theme enabled, the custom color SHALL take precedence.

- Custom navbar color overrides site-extracted colors
- If custom color is cleared (default), site theme colors apply again

#### Scenario: Custom color overrides site theme

- **WHEN** user has set a custom navbar color
- **AND** user navigates to a site with a theme color
- **THEN** the navbar uses the custom color, not the site's theme color

#### Scenario: Default allows site theme

- **WHEN** user has NOT set a custom navbar color (using default)
- **AND** site theme setting is enabled
- **THEN** the navbar uses colors extracted from the current site

### Requirement: Private browsing color override

Private browsing tabs SHALL always display the private browsing theme color, regardless of custom navbar settings.

- Private tabs use the distinctive purple color for visual distinction
- This ensures users always know when they're in private mode

#### Scenario: Private tab ignores custom color

- **WHEN** user has set a custom navbar color
- **AND** user opens a private browsing tab
- **THEN** the navbar displays the private browsing purple color, not the custom color
