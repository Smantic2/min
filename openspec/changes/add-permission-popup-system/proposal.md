## Why

Min browser lacks a permission handling system for web APIs. When websites request permissions (clipboard, geolocation, notifications, etc.), users have no way to grant or deny them. This breaks functionality in web apps like VSCode Cloud that require clipboard access. The solution must maintain Min's minimal aesthetic without adding icons to the top bar.

## What Changes

- Add a permission system that intercepts web permission requests
- Create a native-styled modal popup for permission prompts (Apple macOS design aesthetic)
- Handle standard web permissions: clipboard-read, clipboard-write, geolocation, notifications, camera, microphone
- Store user decisions with per-site granularity
- Add settings UI to view and revoke granted permissions

## Capabilities

### New Capabilities

- `permission-system`: Core permission interception and decision storage
- `permission-dialog`: Modal UI for permission prompts with Apple-style design
- `permission-settings`: Settings page to manage site permissions

### Modified Capabilities

- None (new feature, no existing specs modified)

## Impact

- Affects webview permission handling (electron/chromium integration)
- New UI components for modal dialogs
- Local storage for permission decisions
- Settings page extension
- No breaking changes to existing APIs
