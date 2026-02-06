## 1. Extension Runtime Foundation

- [x] 1.1 Create a main-process `extensionManager` module and register it in the main build/boot pipeline.
- [x] 1.2 Add extension state storage (installed metadata, enable state, last error) using Min's settings infrastructure.
- [x] 1.3 Implement startup loading for enabled extensions in the regular tab session (`persist:webcontent`).
- [x] 1.4 Implement safe error handling so extension load failures are captured without blocking normal browsing.

## 2. Session and Lifecycle Integration

- [x] 2.1 Integrate extension runtime initialization with app/session lifecycle hooks used by tab WebContentsViews.
- [x] 2.2 Implement runtime enable/disable and unload/reload flows without requiring browser reinstall.
- [x] 2.3 Implement deterministic policy for private tabs (disabled in v1) and enforce it for private partitions.
- [x] 2.4 Ensure extension state is reapplied correctly after restart and across multi-window usage.

## 3. Compatibility Classification

- [x] 3.1 Implement manifest and permission parser for extension capability detection.
- [x] 3.2 Implement compatibility classifier statuses (`supported`, `partial`, `unsupported`) with machine-readable reasons.
- [x] 3.3 Enforce compatibility gating during enable/activation (block unsupported, allow supported, conditionally allow partial).
- [x] 3.4 Re-run compatibility checks on extension metadata/version changes and persist status transitions.

## 4. Policy Ordering and Safety Controls

- [x] 4.1 Define and implement precedence rules between extension behavior and existing filtering/permission/request handlers.
- [x] 4.2 Add input validation and explicit IPC route handling for extension-related actions (no generic privileged pass-through).
- [x] 4.3 Add conflict/fallback behavior to preserve Min safety policy outcomes under extension-policy collisions.
- [x] 4.4 Add regression checks for download/header and permission flows when extensions are enabled.

## 5. Settings UI and Management Workflows

- [x] 5.1 Add an Extensions section to settings for listing installed extensions and current status.
- [x] 5.2 Implement unpacked-extension install flow from local directory with clear validation errors.
- [x] 5.3 Implement per-extension enable/disable and remove actions with immediate state updates.
- [x] 5.4 Show extension metadata and diagnostics (ID, source path, version, last error, compatibility state).

## 6. Localization and User Messaging

- [x] 6.1 Add localization keys for extensions settings UI, compatibility labels, and error messages.
- [x] 6.2 Add user-facing explanations for partial/unsupported compatibility states.
- [x] 6.3 Add clear private-mode policy messaging explaining extension behavior in private tabs.

## 7. Performance Instrumentation and Budgets

- [x] 7.1 Add telemetry for extension startup overhead, memory impact, request interception overhead, and IPC overhead.
- [x] 7.2 Ensure extension runtime remains inactive when no extensions are enabled.
- [x] 7.3 Implement performance warning state when configured thresholds are exceeded.
- [x] 7.4 Add diagnostics surfaced in extension details for performance and error triage.

## 8. Validation, Documentation, and Rollout

- [x] 8.1 Create integration tests for runtime loading, compatibility gating, settings actions, and restart persistence.
- [x] 8.2 Create regression tests for policy precedence with filtering, permission handling, and downloads.
- [x] 8.3 Document supported/partial/unsupported extension capabilities and known limitations.
- [x] 8.4 Add staged rollout controls (feature flag/default-off) and define rollback steps.
