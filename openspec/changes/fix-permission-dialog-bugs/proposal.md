## Why

The permission dialog system was implemented but contains critical bugs that prevent it from functioning. The main issue is an incorrect module import pattern: `tabState.tabs.getSelected()` fails because `tabState` only exports `{ initialize }`, while `tabs` is a global variable (`window.tabs`). Additionally, excessive debug logging was added during troubleshooting that needs cleanup for production readiness.

## What Changes

- **Fix critical bug**: Replace `tabState.tabs.getSelected()` with `tabs.getSelected()` (global) in `permissionDialog.js`
- **Remove unused import**: Remove `require("tabState.js")` which isn't needed
- **Clean debug logs**: Remove verbose console.log statements added during debugging from:
  - `js/permissionDialog.js`
  - `js/default.js` (test listener and logs)
  - `main/main.js` (sendIPCToWindow and getWindowWebContents logs)
  - `main/permissionManager.js` (keep only warnings/errors)
- **Add defensive coding**: Add null checks before accessing `tabs` global
- **Improve documentation**: Add JSDoc comments to public functions

## Capabilities

### New Capabilities

(none - this is a bugfix)

### Modified Capabilities

(none - no spec-level behavior changes, only implementation fixes)

## Impact

- **Files modified**:
  - `js/permissionDialog.js` - Bug fix and cleanup
  - `js/default.js` - Remove debug code
  - `main/main.js` - Remove debug logs
  - `main/permissionManager.js` - Clean up verbose logs
- **Risk**: Low - these are targeted fixes to existing code
- **Testing**: Manual testing required - trigger permission request from a site (e.g., geolocation on maps.google.com)
