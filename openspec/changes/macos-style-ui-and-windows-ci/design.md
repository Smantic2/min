## Context

Min browser currently implements window controls (close, minimize, maximize) differently on each platform:

- **macOS**: Native traffic light buttons via `titleBarStyle: 'hidden'`, reserving 75px on the left
- **Windows**: Custom SVG icons in rectangular containers with hover states (`.windows-caption-buttons`)
- **Linux**: Custom SVG circles with outline styling (`#linux-control-buttons`)

The navbar uses CSS custom properties (`--theme-background-color`, `--theme-foreground-color`) for dynamic theming, primarily driven by `tabColor.js` which extracts colors from page content. Settings are managed via `settings.get/set/listen` with JSON persistence.

The existing GitHub Actions workflow (`build-packages.yml`) supports all platforms but only triggers on `workflow_dispatch` (manual).

**Constraints:**

- Must work in Electron's frameless window mode
- Must maintain drag regions for window movement
- Must not break existing keyboard shortcuts or accessibility
- Settings changes should apply without restart when possible

## Goals / Non-Goals

**Goals:**

- Unified visual identity with macOS-style traffic light buttons on all platforms
- User-customizable navbar color with transparency for subtle theming
- Automated Windows builds on push for faster iteration
- Maintainable, documented code following existing patterns

**Non-Goals:**

- Custom window control positioning (always top-left on all platforms)
- Full theme engine or CSS variable exposure to users
- macOS notch support or dynamic island integration
- Build automation for Linux/macOS (only Windows in this change)
- Custom icons for traffic lights (standard circles only)

## Decisions

### Decision 1: Unified Traffic Light Implementation via CSS

**Choice**: Implement traffic lights as pure CSS circles with consistent HTML structure across platforms, replacing SVG icons.

**Rationale**:

- SVGs add complexity; circles are trivially CSS (`border-radius: 50%`)
- Easier to animate hover/active states
- Single code path reduces platform-specific bugs

**Alternatives Considered**:

- Keep SVG-based approach: More flexible for custom icons, but unnecessary complexity for simple circles
- Use platform-specific native controls: Impossible for Windows/Linux, defeats unification goal

### Decision 2: Button Placement - Left Side on All Platforms

**Choice**: Move window controls to top-left on all platforms, matching macOS convention.

**Rationale**:

- Consistency with the macOS aesthetic being adopted
- Users familiar with macOS will feel at home
- Single CSS layout logic

**Alternatives Considered**:

- Keep right-side on Windows: Breaks visual unity, confusing mental model
- Make position configurable: Added complexity for v1, can add later if requested

**Trade-off**: Windows users may initially be surprised by left-side buttons.

### Decision 3: Color Customization via CSS Custom Properties

**Choice**: Extend existing `--theme-background-color` system with new `--navbar-custom-color` and `--navbar-opacity` properties.

**Rationale**:

- Builds on established pattern in `tabColor.js`
- CSS variables cascade naturally, easy to override
- No JavaScript color manipulation needed at runtime

**Implementation**:

```css
#navbar {
  background-color: color-mix(
    in srgb,
    var(--navbar-custom-color, var(--theme-background-color)) var(
        --navbar-opacity,
        100%
      ),
    transparent
  );
}
```

### Decision 4: Settings UI in New "Appearance" Section

**Choice**: Create a new collapsible section in Settings page, positioned after "Dark Mode" setting.

**Rationale**:

- Groups visual customization together
- Doesn't clutter existing sections
- Room for future appearance settings

**Components**:

- Color preset buttons (8-10 curated colors)
- Custom color picker input (native `<input type="color">`)
- Opacity slider (`<input type="range">` 0-100%)
- Reset to default button

### Decision 5: GitHub Action Strategy - Separate Workflow

**Choice**: Create a NEW separate workflow file `build-windows.yml` specifically for automated Windows builds on push, keeping the existing `build-packages.yml` unchanged.

**Rationale**:

- Clear separation of concerns: automated CI vs manual release builds
- Existing workflow remains untouched (no risk of breaking it)
- Simpler configuration per workflow
- Follows single-responsibility principle

**Implementation**:

```yaml
# .github/workflows/build-windows.yml
name: Build Windows Package
on:
  push:
    branches: [main, develop]
    paths-ignore:
      - "**.md"
      - "docs/**"
      - "openspec/**"
      - ".opencode/**"

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 25
      - run: npm install --omit=optional
      - run: npm run buildWindows
```

**Alternatives Considered**:

- Modify existing `build-packages.yml`: Higher risk, more complex conditional logic
- Build all platforms on push: Too expensive for every push

## Risks / Trade-offs

### Risk 1: Windows Users Disoriented by Left-Side Buttons

**Mitigation**: Clear visual design makes buttons obviously clickable. Could add tooltip on first use or setting to move back to right (future enhancement).

### Risk 2: Color-Mix CSS Not Supported in Older Electron

**Mitigation**: Electron 25+ supports `color-mix()`. Min already requires recent Electron. Add fallback for opacity using `rgba()` if needed.

### Risk 3: Traffic Light Colors Clash with Custom Navbar Color

**Mitigation**: Traffic light buttons have fixed colors (red/yellow/green) that work on most backgrounds. Add subtle shadow/border for contrast on problematic backgrounds.

### Risk 4: GitHub Action Costs Increase

**Mitigation**: Only Windows builds on push, path filtering excludes docs. Monitor usage and adjust if needed.

### Risk 5: Settings Not Applied Without Restart

**Mitigation**: Use `settings.listen()` to apply changes in real-time. Only window control position requires restart (if we add that option later).

## Open Questions

1. **Icon behavior on hover**: Should icons appear inside traffic lights on hover (like macOS) or keep them clean?

   - **Proposed**: Start clean, add icons later if user feedback requests it

2. **Private browsing color override**: Should custom navbar color apply in private tabs, or always use the purple private theme?

   - **Proposed**: Private tabs override custom color to maintain visual distinction

3. **RTL language support**: Current macOS reserves space on right for RTL. Should traffic lights also flip?
   - **Proposed**: Keep left-side for consistency, RTL users get same experience
