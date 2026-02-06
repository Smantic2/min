## Why

Min currently has no browser extension system, which limits compatibility with modern web workflows and forces built-in feature growth that can hurt performance over time. Adding extension support now lets Min stay lightweight by moving optional functionality into user-managed extensions while preserving fast default behavior.

## What Changes

- Add a first-party extension platform for Min that can load, enable, disable, and remove unpacked Chromium-compatible extensions.
- Add extension session integration for Min tab web contents, with explicit behavior for regular and private browsing sessions.
- Add an extension compatibility model that clearly reports supported, partially supported, and unsupported capabilities.
- Add extension management in Settings, including install source visibility, permissions summary, and per-extension controls.
- Add performance and safety controls for extension execution, including policy ordering with existing filtering and permission systems.

## Capabilities

### New Capabilities

- `extension-runtime`: Load and run supported Chromium extensions in Min tab sessions with controlled lifecycle and startup behavior.
- `extension-compatibility`: Evaluate extension manifests and APIs against Min support, and expose compatibility status to users.
- `extension-management`: Provide extension management UX for install, enable/disable, remove, and inspection of extension metadata.
- `extension-performance-and-safety`: Enforce performance budgets, telemetry, and security boundaries for extension activity.

### Modified Capabilities

- None.

## Impact

- Affected code: main process session/bootstrap flow, tab view/session handling, preload and IPC boundaries, settings UI, localization, and menu integration.
- Affected systems: permission handling, request filtering, download/header handling, and existing userscript extensibility paths.
- Dependencies: Electron extension APIs for unpacked extensions and supported Chrome extension API subset behavior.
- Product impact: introduces optional functionality without changing core default browsing behavior; private mode policy may initially restrict extension execution.
