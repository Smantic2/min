## Why

Min browser currently has a functional but platform-inconsistent visual appearance. The window controls (close, minimize, maximize) use different styles on each platform - native traffic lights on macOS, rectangular SVG icons on Windows, and circular outline buttons on Linux. Additionally, the navbar lacks customization options for users who want to personalize their browsing experience.

This change modernizes the browser's visual identity by introducing macOS-style window controls across all platforms (the iconic red/yellow/green traffic light buttons) and adding a navbar color customization feature with transparency support. This creates a more polished, unified aesthetic while giving users control over their browser's appearance. Additionally, a GitHub Action will enable automated Windows builds on push, improving the development workflow.

## What Changes

- **macOS-style window controls on all platforms**: Replace the current rectangular Windows caption buttons and Linux control buttons with circular traffic light buttons (close=red, minimize=yellow, maximize=green) that work consistently across Windows, Linux, and macOS
- **Navbar color customization in Settings**: Add a new "Appearance" section in preferences allowing users to select a custom navbar accent color with adjustable transparency/opacity for a subtle, non-invasive look
- **Color presets**: Provide attractive preset color options (subtle blues, greens, purples, warm tones) alongside a custom color picker
- **GitHub Action for Windows builds**: Add a workflow that triggers on push to automatically build Windows packages, complementing the existing manual workflow_dispatch trigger

## Capabilities

### New Capabilities

- `traffic-light-controls`: Cross-platform macOS-style window control buttons (red/yellow/green circles) replacing platform-specific implementations
- `navbar-color-customization`: User preference for navbar accent color with transparency slider, including preset themes and custom color picker
- `windows-build-ci`: GitHub Actions workflow for automated Windows builds on push events

### Modified Capabilities

<!-- No existing specs to modify - this is a new codebase without prior specs -->

## Impact

### Code Changes

- **css/windowControls.css**: Complete redesign of window control button styles from rectangular/outline to circular traffic lights
- **index.html**: Update Windows caption buttons and Linux control buttons HTML structure to support new circular design
- **js/windowControls.js**: May need updates for hover/active states on new button design
- **pages/settings/index.html**: Add new "Appearance" section with color picker and transparency slider
- **pages/settings/settings.js**: Add handlers for navbar color and transparency settings
- **pages/settings/settings.css**: Style the new appearance settings UI
- **css/tabBar.css**: Support dynamic navbar background color with transparency via CSS variables
- **js/navbar/tabColor.js**: Integrate custom color preference with existing site-theme logic
- **.github/workflows/**: New or modified workflow for Windows CI builds

### Settings Schema

- New setting: `navbarColor` (string, hex color or null for default)
- New setting: `navbarOpacity` (number, 0-100, default 100)

### Dependencies

- No new external dependencies required
- Leverages existing CSS custom properties system (`--theme-background-color`)
- Uses existing settings infrastructure (`settings.get/set/listen`)

### Platforms Affected

- Windows: Major visual change (rectangular buttons -> traffic lights)
- Linux: Major visual change (outline circles -> filled traffic lights)
- macOS: Minor change (uses same consistent style, currently native)
