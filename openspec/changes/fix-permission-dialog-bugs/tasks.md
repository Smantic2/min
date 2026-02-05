## 1. Fix Critical Bug in permissionDialog.js

- [x] 1.1 Remove `var tabState = require("tabState.js")` import (line 10)
- [x] 1.2 Replace `tabState.tabs.getSelected()` with `tabs.getSelected()` (line 178)
- [x] 1.3 Add defensive null check for `tabs` before calling `getSelected()`

## 2. Clean Debug Logs from permissionDialog.js

- [x] 2.1 Remove console.log from `initialize()` function
- [x] 2.2 Remove console.log from `setupIPC()` function
- [x] 2.3 Remove console.log from `showModal()` function
- [x] 2.4 Add JSDoc comments to `initialize`, `showModal`, `hideModal`, `handleAllow`, `handleDeny`

## 3. Clean Debug Code from default.js

- [x] 3.1 Remove `console.log("[default.js] Renderer started...")`
- [x] 3.2 Remove `console.log("[default.js] Testing IPC listener...")`
- [x] 3.3 Remove test IPC listener for `showPermissionDialog`

## 4. Clean Debug Logs from main/main.js

- [x] 4.1 Remove all `console.log("[sendIPCToWindow]...")` statements from `sendIPCToWindow()`
- [x] 4.2 Remove all `console.log("[getWindowWebContents]...")` statements from `getWindowWebContents()`
- [x] 4.3 Restore original clean versions of both functions

## 5. Clean Verbose Logs from main/permissionManager.js

- [x] 5.1 Remove verbose debug logs (keep only warnings/errors)
- [x] 5.2 Keep `console.warn` for "Could not find window for webContents"
- [x] 5.3 Keep `console.warn` for "Invalid URL in permission request/check"
- [x] 5.4 Keep `console.error` for "Error requesting permission"

## 6. Build and Verify

- [x] 6.1 Run `npm run build` and verify no errors
- [ ] 6.2 Run `npm run start` and test permission request on waze.com
- [ ] 6.3 Verify permission modal appears correctly
- [ ] 6.4 Verify no debug logs in console (only warnings if applicable)
