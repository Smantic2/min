# Extensions Testing Plan

This document defines integration and regression checks for Min's extension system.

## Integration Tests

### 1) Install Unpacked Extension

- Open `min://app/pages/settings/index.html`.
- Enable `Enable extensions (experimental)`.
- Click `Install unpacked extension` and select a valid extension directory.
- Expected:
  - Extension appears in list with name/version/path.
  - Compatibility status is shown.
  - If supported/partial, extension can be enabled.

### 2) Invalid Extension Install

- Install from a directory without `manifest.json`.
- Expected:
  - Install is rejected.
  - Clear error message is shown.

### 3) Enable/Disable/Remove Lifecycle

- Install an extension, disable it, re-enable it, then remove it.
- Restart Min between operations.
- Expected:
  - State persists across restart.
  - Disable and remove update list immediately.

### 4) Compatibility Gate

- Attempt to enable an extension classified as `unsupported`.
- Expected:
  - Enable is blocked.
  - Compatibility reason remains visible.

## Regression Checks

### A) Filtering + Request Handling

- With extension feature enabled, browse ad-heavy pages.
- Verify content blocking still functions (blocked request counter increases).
- Verify no crashes and no request deadlocks.

### B) Download and Header Flow

- Download a binary file and open a PDF in browser.
- Expected:
  - Downloads still appear in download manager.
  - PDF opens in Min PDF viewer.

### C) Permission Flow

- Visit pages requesting clipboard and geolocation permissions.
- Expected:
  - Permission dialog behavior remains unchanged.
  - Stored site permission decisions still apply.

### D) Performance and Diagnostics

- Install a slow-loading extension (or many extensions).
- Expected:
  - Extension performance warning appears when threshold is exceeded.
  - Extension diagnostics show warning/error details.

## Rollout Smoke Checklist

- Feature toggle off: no extension runtime activity.
- Feature toggle on with no installed extensions: no load errors.
- Feature toggle on with installed extensions: runtime initializes and list updates.
- Private tabs: extensions remain disabled.
