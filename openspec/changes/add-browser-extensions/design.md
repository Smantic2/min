## Context

Min currently runs web content in dedicated `WebContentsView` instances and uses a persistent partition (`persist:webcontent`) for normal tabs, while private tabs use in-memory partitions. This architecture is favorable for extension support because extension loading can be session-scoped, but it also creates a strict requirement: extension runtime setup must target the same sessions used by tab views.

Min already has cross-cutting request and permission infrastructure (filtering, permission manager, downloads, UA switching) and a lightweight extensibility model via userscripts. Extension support must fit this existing model without adding persistent overhead to users who do not enable extensions.

Key constraints:

- Performance-first product goals: no measurable startup or tab-switch regressions for users with extensions disabled.
- Security boundaries: keep extension execution isolated from Min browser UI process responsibilities.
- Electron compatibility limits: support is a Chromium extension subset, not full Chrome parity.
- Maintainability: align with Min's module layout (`main/`, `js/`, settings/localization flow) and OpenSpec artifact process.

## Goals / Non-Goals

**Goals:**

- Add a robust extension runtime for Min's regular browsing session.
- Provide a clear compatibility model for supported, partial, and unsupported extension capabilities.
- Add an extension management interface in Settings for install, enable/disable, remove, and inspection.
- Integrate extension behavior with existing Min policies (permissions, request filtering, download handling).
- Protect baseline performance with lazy initialization, feature flags, and telemetry.

**Non-Goals:**

- Guarantee compatibility with all Chrome Web Store extensions.
- Implement a direct Chrome Web Store install flow in v1.
- Enable extensions in private tabs in the initial release.
- Rebuild Min around full Chromium browser-extension UI paradigms.

## Decisions

### Decision 1: Session-scoped Extension Runtime for `persist:webcontent`

**Choice:** Load extensions only into the persistent session used by normal tabs and initialize runtime hooks during app/session bootstrap.

**Rationale:**

- Ensures extension APIs and content scripts are available in the same session where tab views run.
- Preserves private tab isolation by default.
- Fits Min's existing session-created architecture and avoids per-tab bootstrap overhead.

**Alternatives considered:**

- Loading only in `defaultSession` (insufficient for Min tabs).
- Per-tab ad hoc loading (high overhead and brittle lifecycle behavior).

### Decision 2: Add a Main-process `extensionManager` Module

**Choice:** Introduce a dedicated extension manager in `main/` responsible for discovery, install metadata, lifecycle, and policy integration.

**Rationale:**

- Extension lifecycle is process-wide and session-sensitive, matching main-process responsibilities.
- Centralized control simplifies auditing, diagnostics, and policy enforcement.
- Avoids coupling extension state transitions to renderer UI code.

**Alternatives considered:**

- Managing extension lifecycle directly from renderer settings page (weaker security and harder session control).
- Splitting lifecycle logic across existing modules (`viewManager`, `main`, `settingsMain`) (higher complexity and unclear ownership).

### Decision 3: Capability-first Compatibility Classification

**Choice:** Parse extension manifest + declared permissions and classify each extension as `supported`, `partial`, or `unsupported`, with an explanation.

**Rationale:**

- Electron does not provide full Chrome API compatibility; users need explicit expectations.
- Prevents opaque failures where extensions appear installed but silently do nothing.
- Creates a scalable contract for future API coverage expansion.

**Alternatives considered:**

- Best-effort installation with no compatibility signal (poor UX and higher support burden).
- Hard deny unless fully supported (too restrictive, limits practical utility).

### Decision 4: Policy Ordering with Explicit Precedence Rules

**Choice:** Keep Min's security/privacy pipeline authoritative by default, then allow extension hooks where safe and supported, with documented precedence for request/permission flows.

**Rationale:**

- Min already enforces user-facing privacy behavior through existing handlers.
- Deterministic ordering prevents regressions in blocking, header handling, and permission behavior.
- Makes conflict handling testable and debuggable.

**Alternatives considered:**

- Let extension hooks run first (risk of bypassing Min policies).
- Intermix policies without fixed precedence (non-deterministic behavior).

### Decision 5: Settings-driven Management UI with No Persistent Toolbar Chrome

**Choice:** Provide extension management primarily through Settings, with minimal contextual affordances and no always-visible extension toolbar in v1.

**Rationale:**

- Preserves Min's minimal interface philosophy.
- Reuses existing settings architecture and localization patterns.
- Keeps extension system discoverable while avoiding permanent UI complexity.

**Alternatives considered:**

- Chrome-like persistent extension action bar (visual and performance cost).
- Command-only management with no UI (too hidden for mainstream users).

### Decision 6: Performance Budget Enforcement and Lazy Activation

**Choice:** Add runtime telemetry and budget checks for extension impact (startup, memory, request interception, IPC), and initialize expensive paths only when extensions are enabled.

**Rationale:**

- Preserves default Min performance for users who never enable extensions.
- Enables controlled rollout using objective thresholds.
- Supports long-term scalability as extension feature surface grows.

**Alternatives considered:**

- Always-on extension runtime at startup (unnecessary cost for most users).
- No telemetry budgets (cannot prove performance safety).

## Risks / Trade-offs

- [Risk] Electron API subset causes user expectation mismatch for some popular extensions. -> Mitigation: capability classification, install-time warnings, and clear unsupported-reason messaging.
- [Risk] Extension hooks interact unpredictably with existing filtering and permission handlers. -> Mitigation: explicit precedence matrix, integration tests per flow, and defensive fallback to Min defaults.
- [Risk] Extension memory overhead increases with tab count and long sessions. -> Mitigation: lazy runtime setup, extension disable controls, and tracked memory budgets in telemetry.
- [Risk] Private browsing semantics become ambiguous if users expect extensions there. -> Mitigation: explicit v1 policy (disabled in private), visible explanation in Settings, revisit after validation.
- [Risk] Security regressions through new IPC/control surfaces. -> Mitigation: centralize privileged operations in main-process manager, strict input validation, and avoid exposing generic privileged IPC routes.

## Migration Plan

1. Implement core extension manager and startup/session integration behind a feature flag.
2. Add manifest compatibility classifier and metadata persistence for installed extensions.
3. Add Settings UI for management and compatibility visibility.
4. Integrate policy ordering with filtering/permissions/download layers and finalize precedence docs.
5. Add telemetry counters/timers and performance regression gates.
6. Enable staged rollout defaults (off by default initially), then expand based on perf and compatibility outcomes.

Rollback strategy:

- Disable extension feature flag and skip runtime load path during startup.
- Keep installed extension metadata inert for future re-enable without affecting normal browsing.
- Preserve existing userscripts and core browsing behavior unchanged.

## Open Questions

1. Which extension APIs should be considered in-scope for initial `supported` classification versus `partial`?
2. Should v1 allow only unpacked local extensions, or also packaged sideload formats with signature checks?
3. What minimum telemetry thresholds should block rollout (startup regression %, memory delta per hour, IPC latency budget)?
4. How should extension-origin permission prompts be presented to avoid confusion with site-origin prompts?
