## Context

The permission dialog system in Min browser was implemented to handle web permission requests (geolocation, camera, microphone, etc.) with a modal UI. During development, the system was tested and debugged extensively, but a critical bug remained: the code incorrectly accessed `tabState.tabs.getSelected()` instead of using the global `tabs.getSelected()`.

**Current state**:

- Main process (`permissionManager.js`) correctly sends IPC messages to renderer
- Renderer receives the IPC message (confirmed via logs)
- Modal fails to show due to `TypeError: Cannot read properties of undefined (reading 'getSelected')`
- Debug logs clutter the console in both main and renderer processes

**Constraints**:

- Must follow Min's existing patterns (globals for `tabs`, `tasks`, `ipc`)
- StandardJS style (no semicolons)
- Build system concatenates main process files (no real module system)
- Renderer uses Browserify but relies on window globals for state

## Goals / Non-Goals

**Goals:**

- Fix the permission dialog so it displays correctly when a site requests permissions
- Clean up all debug logging added during troubleshooting
- Add defensive coding to prevent similar issues
- Improve code documentation with JSDoc comments
- Follow Min's established coding patterns

**Non-Goals:**

- Refactoring the overall permission system architecture
- Adding new permission types
- Changing how permissions are stored/persisted
- Modifying the UI/UX of the permission modal

## Decisions

### 1. Use global `tabs` instead of importing `tabState`

**Decision**: Access `tabs.getSelected()` directly as a global variable.

**Rationale**:

- `tabState.js` only exports `{ initialize }`, not `tabs`
- `tabs` is set on `window.tabs` during initialization
- This is the pattern used by ALL other modules in the codebase (verified: `findinpage.js`, `browserUI.js`, `webviews.js`, etc.)

**Alternatives considered**:

- Modify `tabState.js` to export `tabs` → Would break existing pattern and require changes across codebase

### 2. Remove debug logs entirely (not make them conditional)

**Decision**: Remove all `console.log` statements added during debugging.

**Rationale**:

- Min doesn't have a logging framework with log levels
- Debug logs in production hurt performance and clutter output
- The issues are now understood and documented

**Alternatives considered**:

- Add conditional logging with `isDevelopmentMode` flag → Adds complexity, Min doesn't do this elsewhere
- Keep some logs as warnings → Only for actual warning conditions (kept in `permissionManager.js`)

### 3. Add defensive null check for `tabs`

**Decision**: Check if `tabs` exists and has `getSelected` before calling.

**Rationale**:

- `tabs` is set asynchronously during app initialization
- If permission request arrives before full init, `tabs` could be undefined
- Defensive coding prevents cryptic errors

**Implementation**:

```javascript
// Get selected tab safely
var selectedTabId =
  typeof tabs !== "undefined" && tabs.getSelected ? tabs.getSelected() : null;
```

## Risks / Trade-offs

| Risk                                        | Mitigation                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------- |
| `tabs` undefined at permission request time | Added null check; permission dialog will still work, just won't hide the webview |
| Removing logs makes future debugging harder | Bug is now documented in this design doc; can re-add logs if needed              |
| Missing a debug log somewhere               | Grep search performed; all instances identified                                  |

## Open Questions

(none - all technical decisions are clear)
