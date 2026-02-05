## Context

Min is an Electron-based browser with a minimal UI philosophy. Currently, web permission requests are not handled - the browser doesn't intercept or present UI for clipboard, geolocation, notifications, or other web API permissions. This causes issues with web apps like VSCode Cloud that require user consent to access clipboard or other APIs.

The design must maintain Min's aesthetic: no system tray icons, no permanent UI chrome. The solution should be a transient modal that appears only when needed, styled to match macOS design language (rounded corners, subtle shadows, centered positioning).

## Goals / Non-Goals

**Goals:**

- Intercept all major web permission requests (clipboard, geolocation, notifications, camera, microphone)
- Display a native-looking modal dialog for user consent
- Store user decisions persistently with per-site granularity
- Provide a settings interface to review/revoke permissions
- Match Apple macOS modal design aesthetic
- Support "remember my decision" checkbox

**Non-Goals:**

- System-level permission handling (OS prompts)
- Complex permission inheritance rules
- Permission request queuing (process one at a time)
- Granular permission scopes (e.g., read vs write clipboard handled separately)
- Support for all 50+ web permission types (focus on common ones first)

## Decisions

### Decision 1: Preload Script Interception

**Choice:** Use Electron's `setPermissionRequestHandler` in the main process with context bridge to renderer.

**Rationale:**

- Main process has access to session-wide permission handling
- Context bridge provides secure IPC between main and renderer
- No need to inject scripts into every webview

**Alternatives considered:**

- WebRequest API interception (too low-level, doesn't catch all permission types)
- Content scripts (doesn't work for all permission types, requires injection)

### Decision 2: Modal Implementation Approach

**Choice:** Custom HTML/CSS modal rendered in the main window, not a native dialog.

**Rationale:**

- Full control over styling to match Apple aesthetic
- Can animate and position precisely
- Consistent with Min's custom UI approach
- No dependency on OS dialog styling

**Alternatives considered:**

- `dialog.showMessageBox()` (limited styling, breaks aesthetic consistency)
- System notifications (not appropriate for permission decisions)

### Decision 3: Storage Strategy

**Choice:** Store permissions in Min's existing settings store with site-keyed object structure.

**Rationale:**

- Consistent with existing Min settings
- Easy to expose in settings UI
- Simple backup/sync if Min adds cloud settings

**Schema:**

```javascript
{
  "sitePermissions": {
    "github.com": {
      "clipboard-read": "granted",
      "geolocation": "denied"
    }
  }
}
```

**Values:** `granted`, `denied`, `prompt` (default)

### Decision 4: Permission Modal Design

**Choice:** Centered modal with Apple-style aesthetic:

- Rounded corners (10px radius)
- Subtle backdrop blur
- Clean typography
- Primary and secondary button styling
- Site origin prominently displayed
- "Remember this decision" checkbox

**Rationale:**

- Matches macOS native permission dialogs
- Clear hierarchy of information
- Minimal but informative

### Decision 5: Permission Precedence

**Choice:** Check stored permissions before showing dialog. If `granted` or `denied`, auto-respond without UI.

**Rationale:**

- Reduces user friction
- Respects previous decisions
- Only interrupts when necessary

## Risks / Trade-offs

**[Risk] Permission persistence could be confusing**

- Users might forget they granted a permission
- **Mitigation:** Clear settings UI to review/revoke; visual indicator in task overlay

**[Risk] Too many permission prompts could be annoying**

- Every site requesting clipboard would show modal
- **Mitigation:** Remember decision checkbox enabled by default; can bulk-manage in settings

**[Risk] Security implications of granting permissions**

- Malicious sites could abuse granted permissions
- **Mitigation:** Clear site origin display; easy revocation; defaults to deny

**[Risk] Electron API limitations**

- Some permission types may not be interceptable
- **Mitigation:** Test all major types; document limitations

## Migration Plan

**Phase 1:** Core permission handling

- Implement main process handler
- Create modal component
- Add storage layer

**Phase 2:** Settings integration

- Add permissions section to settings
- Implement revoke functionality

**Phase 3:** Polish

- Animation refinement
- Edge case handling

**Rollback:** Remove permission handler registration - browser returns to current behavior (deny all).

## Open Questions

1. Should we show a visual indicator somewhere (task overlay?) showing which sites have active permissions?
2. Do we need a "block all" option for specific permission types in settings?
3. How to handle permission requests that come in rapid succession (spam)?
