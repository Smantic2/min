# Extensions in Min (Experimental)

Min supports loading unpacked Chromium-compatible extensions with a compatibility model designed to keep baseline browser performance predictable.

## Installation Model

- Only unpacked extensions are supported in the initial release.
- Install extensions from the Settings page under `Extensions`.
- Min stores extension metadata and enable state across restarts.

## Compatibility Status

Each extension is classified as one of:

- `Supported`: Required capabilities match Min's current support surface.
- `Partial`: Some capabilities are supported, but others may be limited.
- `Unsupported`: Required capabilities are not available and activation is blocked.

Compatibility reasons are shown in the extension details.

## Supported vs. Limited Capabilities

Current supported permission set focuses on common extension workflows:

- `activeTab`
- `storage`
- `tabs`
- `contextMenus`
- `webRequest`
- `webRequestBlocking`
- `notifications`
- `alarms`
- `scripting`

Partial/limited support includes:

- `commands`
- `omnibox`
- `declarativeNetRequest`

Unsupported capability examples include:

- `nativeMessaging`
- `debugger`
- `enterprise.*`
- Manifest fields such as `devtools_page`, `chrome_url_overrides`, and `externally_connectable`

## Private Browsing Policy

Extensions are disabled in private tabs in the initial release.

## Performance and Rollout

- Extension runtime remains inactive unless feature toggle is enabled and at least one extension is active.
- Min tracks extension load timings and records warnings for slow loads.
- Feature rollout should stay default-off until compatibility and performance telemetry stabilize.

## Rollback Plan

- Disable `extensionsFeatureEnabled` in settings to stop extension runtime initialization.
- Installed metadata remains in settings and can be re-enabled later.
- Core browsing behavior remains unaffected.
