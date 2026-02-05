## 1. Traffic Light Controls - HTML Structure

- [x] 1.1 Create unified traffic light button container in index.html replacing `.windows-caption-buttons` and `#linux-control-buttons`
- [x] 1.2 Add three circular button elements: close (red), minimize (yellow), maximize (green) with appropriate IDs/classes
- [x] 1.3 Remove or conditionally hide old Windows SVG caption buttons markup
- [x] 1.4 Remove or conditionally hide old Linux SVG control buttons markup
- [x] 1.5 Ensure traffic light container is positioned in the navbar drag area (top-left)

## 2. Traffic Light Controls - CSS Styling

- [x] 2.1 Create new CSS rules for `.traffic-light-buttons` container with flexbox layout and proper spacing
- [x] 2.2 Style circular buttons with 12px diameter, appropriate colors (#FF5F57, #FFBD2E, #28C840)
- [x] 2.3 Add hover states with brightness/glow effect
- [x] 2.4 Add optional icons (×, −, +) that appear on button group hover
- [x] 2.5 Update `--control-space-left` to accommodate traffic lights on all platforms
- [x] 2.6 Add rules to hide traffic lights when `.fullscreen` or `.separate-titlebar` body classes present
- [x] 2.7 Clean up or remove old Windows/Linux button CSS that's no longer needed

## 3. Traffic Light Controls - JavaScript

- [x] 3.1 Update `js/windowControls.js` to bind click handlers to new traffic light buttons
- [x] 3.2 Ensure close button triggers `ipc.send('close')`
- [x] 3.3 Ensure minimize button triggers `ipc.send('minimize')`
- [x] 3.4 Ensure maximize button triggers `ipc.send('maximize')` with toggle behavior
- [x] 3.5 Test IPC handlers in `main/remoteActions.js` work with new button structure

## 4. Navbar Color Customization - Settings UI

- [x] 4.1 Add "Appearance" section HTML to `pages/settings/index.html` after dark mode section
- [x] 4.2 Create color preset swatches (8-10 colors: soft blue, sage green, lavender, warm rose, etc.)
- [x] 4.3 Add custom color picker input (`<input type="color">`)
- [x] 4.4 Add opacity slider (`<input type="range" min="0" max="100">`) with label showing percentage
- [x] 4.5 Add "Reset to default" button
- [x] 4.6 Style the new Appearance section in `pages/settings/settings.css`

## 5. Navbar Color Customization - Settings Logic

- [x] 5.1 Add settings handlers in `pages/settings/settings.js` for `navbarColor` setting
- [x] 5.2 Add settings handlers for `navbarOpacity` setting
- [x] 5.3 Implement preset swatch click handlers that set `navbarColor`
- [x] 5.4 Implement color picker change handler
- [x] 5.5 Implement opacity slider change handler with live preview
- [x] 5.6 Implement reset button that clears both settings

## 6. Navbar Color Customization - Runtime Application

- [x] 6.1 Create listener in main UI that applies `navbarColor` and `navbarOpacity` to CSS variables
- [x] 6.2 Update `css/tabBar.css` to use `color-mix()` or rgba fallback for navbar background
- [x] 6.3 Modify `js/navbar/tabColor.js` to skip site color extraction when custom color is set
- [x] 6.4 Ensure private browsing tabs override custom color with purple theme
- [x] 6.5 Apply color settings on browser startup (before first paint if possible)

## 7. GitHub Actions - Windows Build CI

- [x] 7.1 Create NEW `.github/workflows/build-windows.yml` for automated Windows builds on push
- [x] 7.2 Add `paths-ignore` filter for `**.md`, `docs/**`, `openspec/**`, `.opencode/**`
- [x] 7.3 Ensure original `build-packages.yml` remains unchanged for manual multi-platform builds
- [x] 7.4 Configure artifact upload for Windows packages (.exe and .zip)
- [x] 7.5 Use correct build command `npm run buildWindows` as per README

## 8. Testing & Polish

- [ ] 8.1 Test traffic light buttons on Windows (if available) - visual appearance and functionality
- [ ] 8.2 Test traffic light buttons on Linux - visual appearance and functionality
- [ ] 8.3 Test traffic light buttons hide correctly in fullscreen and with separate titlebar
- [ ] 8.4 Test color presets apply correctly to navbar
- [ ] 8.5 Test custom color picker works
- [ ] 8.6 Test opacity slider provides smooth transparency gradient
- [ ] 8.7 Test color settings persist after browser restart
- [ ] 8.8 Test private tabs override custom color with purple theme
- [ ] 8.9 Test site theme colors work when custom color is reset to default
