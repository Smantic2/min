---
name: min-browser-methodology
description: Reference guide for the Min browser codebase methodology and patterns. Use when working with any code in the Min browser project, implementing features, fixing bugs, or modifying existing functionality. This skill provides architectural context, coding conventions, and OpenSpec workflow integration specific to the Min browser project.
---

# Min Browser - Project Methodology & Code Patterns

This skill provides comprehensive context for working with the Min browser codebase. **Always review this before implementing changes.**

---

## Project Overview

Min is a fast, minimal browser built with Electron that protects user privacy. It's designed with a distraction-free interface and includes features like full-text search, ad/tracker blocking, reader view, tasks (tab groups), and password manager integration.

### Tech Stack

- **Framework**: Electron (Node.js + Chromium)
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Module System**: CommonJS (`require`/`module.exports`)
- **Styling**: Plain CSS (no preprocessors)
- **Build Tools**: Browserify, custom build scripts
- **Process Model**: Main process + Renderer process with WebContentsView

---

## Architecture Overview

### Directory Structure

```
/workspaces/min/
├── main/                    # Main process (Node.js/Electron backend)
│   ├── main.js             # Entry point, window creation, app lifecycle
│   ├── viewManager.js      # WebContentsView management
│   ├── menu.js             # Application menus
│   └── ...                 # Other main process modules
│
├── js/                     # Renderer process (browser UI)
│   ├── browserUI.js        # Core UI actions (tabs, tasks)
│   ├── webviews.js         # Webview management
│   ├── navbar/             # Navigation bar components
│   ├── searchbar/          # Search/autocomplete components
│   ├── util/               # Utility modules
│   └── ...                 # Other UI modules
│
├── pages/                  # Internal pages (settings, error, etc.)
│   ├── settings/           # Settings page
│   ├── error/              # Error page
│   └── ...
│
├── css/                    # Stylesheets
├── localization/           # i18n files
├── scripts/                # Build scripts
└── openspec/              # OpenSpec configuration and changes
```

### Process Architecture

```
┌─────────────────────────────────────────┐
│           MAIN PROCESS                  │
│  (Node.js - system access, native APIs) │
├─────────────────────────────────────────┤
│  • Window management                    │
│  • Protocol handling                    │
│  • File system access                   │
│  • Session management                   │
│  • Menu bar                             │
└─────────────┬───────────────────────────┘
              │ IPC
┌─────────────▼───────────────────────────┐
│         RENDERER PROCESS                │
│   (Chromium - UI, web content)          │
├─────────────────────────────────────────┤
│  Main View: Browser UI                  │
│  • Tab bar, navbar, searchbar           │
│  • Task management                      │
│  • Settings pages                       │
├─────────────────────────────────────────┤
│  WebContentsViews: Web content          │
│  • One per tab                          │
│  • Isolated from main UI                │
│  • Communicate via IPC                  │
└─────────────────────────────────────────┘
```

---

## Code Conventions & Style

### JavaScript Style (StandardJS)

**Min uses StandardJS** - no semicolons, 2-space indentation, single quotes.

```javascript
// ✓ CORRECT - StandardJS style
const electron = require("electron");
const fs = require("fs");

function createWindow(bounds) {
  const newWin = new BaseWindow({
    width: bounds.width,
    height: bounds.height,
  });
  return newWin;
}

// ✗ WRONG - Other styles
function createWindow(bounds) {
  // space before params
  const newWin = new BaseWindow({
    width: bounds.width, // trailing commas
  });
  return newWin; // semicolons
}
```

### Module Pattern

**Always use CommonJS modules:**

```javascript
// At the TOP of the file - imports
const webviews = require("webviews.js");
const settings = require("util/settings/settings.js");
const EventEmitter = require("events");

// Module definition
const myModule = {
  // Properties
  selectedId: null,
  events: new EventEmitter(),

  // Methods
  initialize: function () {
    // Implementation
  },

  getSomething: function (id) {
    return this.selectedId === id;
  },
};

// Event listeners at the BOTTOM
window.addEventListener("resize", myModule.handleResize);
settings.listen("someSetting", myModule.handleSetting);

// Export at the VERY END
module.exports = myModule;
```

### Variable Declarations

```javascript
// Use 'const' for values that don't change
const EventEmitter = require("events");
const webviews = require("webviews.js");

// Use 'let' for values that will be reassigned
let currentTab = null;
let isLoading = false;

// Use 'var' only when necessary (legacy compatibility)
var lastTabDeletion = 0; // TODO: migrate to let/const
```

### Function Patterns

```javascript
// Object methods (preferred for modules)
const myModule = {
  doSomething: function (arg) {
    return arg + 1;
  },

  // Default parameters
  createTab: function (tabId = tabs.add(), options = {}) {
    // Implementation
  },
};

// Arrow functions for callbacks (when appropriate)
tabs.get().forEach(function (tab) {
  // Use regular function for callbacks that need 'this'
});

// Arrow functions for simple callbacks
tabs.get().forEach((tab) => {
  // Use arrow for simple, one-line callbacks
});
```

### Error Handling

```javascript
// Check for errors explicitly
try {
  var data = fs.readFileSync(path.join(userDataPath, "file.json"), "utf-8");
  bounds = JSON.parse(data);
} catch (e) {
  // Handle error gracefully - don't crash
  bounds = defaultBounds;
}

// Async error handling with callbacks
webviews.callAsync(tabId, "canGoToOffset", -2, function (err, result) {
  if (!err && result === true) {
    webviews.callAsync(tabId, "goToOffset", -2);
  } else {
    webviews.callAsync(tabId, "goBack");
  }
});
```

---

## Component Patterns

### UI Component Structure

```javascript
// Example: A typical UI component (like tabBar.js)

const EventEmitter = require("events");
// 1. Imports at top
const webviews = require("webviews.js");
const settings = require("util/settings/settings.js");

// 2. Module object definition
const myComponent = {
  // DOM element references
  container: document.getElementById("container"),

  // State
  activeId: null,
  elementMap: {},

  // Event emitter for cross-component communication
  events: new EventEmitter(),

  // Public methods
  initialize: function () {
    // Setup code
  },

  createElement: function (data) {
    const el = document.createElement("div");
    el.className = "item-class";
    el.setAttribute("data-id", data.id);

    // Add event listeners
    el.addEventListener("click", function (e) {
      myComponent.events.emit("item-selected", data.id);
    });

    return el;
  },

  updateElement: function (id) {
    const el = this.elementMap[id];
    const data = tabs.get(id);
    // Update DOM based on data
  },
};

// 3. Event bindings at bottom
webviews.bindEvent("some-event", function (tabId) {
  myComponent.updateElement(tabId);
});

// 4. Export
module.exports = myComponent;
```

### State Management Pattern

Min uses a custom state management system (tabState.js, tasks). Components react to state changes via events:

```javascript
// State objects emit events
tasks.on("tab-updated", function (id, key) {
  if (key === "title") {
    tabBar.updateTab(id);
  }
});

// Components update state
tabs.update(tabId, {
  title: newTitle,
  loaded: true,
});
```

### IPC Communication

```javascript
// Renderer to Main
ipc.send("action-name", data);

// Main to Renderer
getWindowWebContents(window).send("action-name", data);

// Main handling renderer messages
ipc.on("action-name", function (e, data) {
  // Handle message
});

// Renderer handling main messages
ipc.on("action-name", function (e, data) {
  // Handle message
});
```

---

## CSS Conventions

### File Organization

- One CSS file per major component
- Use `pagebase.css` as base for internal pages
- Component CSS files in `/css/` directory

### Naming Conventions

```css
/* Use kebab-case for classes */
.tab-item {
}
.tab-icon-area {
}
.navbar-container {
}

/* State classes use 'is-' or 'has-' prefix */
.is-active {
}
.is-loading {
}
.has-error {
}
.is-private {
}

/* Avoid IDs for styling (use for JS only) */
/* ✓ Good: */
.navbar {
}

/* ✗ Bad: */
#navbar {
}
```

### CSS Structure

```css
/* Component container */
.component-name {
  /* Layout properties first */
  display: flex;
  position: relative;

  /* Box model */
  width: 100%;
  height: 36px;
  padding: 0 10px;

  /* Visual */
  background: var(--background-color);
  border-bottom: 1px solid var(--border-color);
}

/* Child elements */
.component-name .child-element {
  /* Styles */
}

/* State modifiers */
.component-name.is-active {
  background: var(--accent-color);
}
```

---

## OpenSpec Workflow Integration

This project uses **OpenSpec** for structured change management. When implementing features or fixes:

### Available OpenSpec Commands

| Command              | Skill                        | Purpose                              |
| -------------------- | ---------------------------- | ------------------------------------ |
| `/opsx-new <name>`   | openspec-new-change          | Create a new change with artifacts   |
| `/opsx-ff <name>`    | openspec-ff-change           | Fast-forward create all artifacts    |
| `/opsx-continue`     | openspec-continue-change     | Continue working on current change   |
| `/opsx-apply`        | openspec-apply-change        | Implement tasks from a change        |
| `/opsx-verify`       | openspec-verify-change       | Verify implementation before archive |
| `/opsx-archive`      | openspec-archive-change      | Archive completed change             |
| `/opsx-sync`         | openspec-sync-specs          | Sync delta specs to main specs       |
| `/opsx-bulk-archive` | openspec-bulk-archive-change | Archive multiple changes             |
| `/opsx-explore`      | openspec-explore             | Explore ideas without implementing   |

### When to Use OpenSpec

**ALWAYS use OpenSpec for:**

- New features
- Significant refactors
- Bug fixes that require design decisions
- Changes affecting multiple components

**Workflow:**

1. `/opsx-new <change-name>` or `/opsx-ff <change-name>` - Create change
2. `/opsx-continue` - Create artifacts (proposal → specs → design → tasks)
3. `/opsx-apply` - Implement tasks
4. `/opsx-verify` - Verify implementation
5. `/opsx-archive` - Archive when complete

### Spec-Driven Schema

The project uses the `spec-driven` schema with this artifact flow:

```
proposal.md → specs/<capability>/spec.md → design.md → tasks.md
```

**Each artifact serves a purpose:**

- **proposal.md**: Why, what changes, capabilities, impact
- **specs/**: Detailed requirements with scenarios (Given/When/Then)
- **design.md**: Technical decisions, architecture, approach
- **tasks.md**: Implementation checklist with checkboxes

---

## Common Patterns & Utilities

### URL Handling

```javascript
const urlParser = require("util/urlParser.js");

// Parse URLs
const parsed = urlParser.parse(url);

// Get domain
const domain = urlParser.getDomain(url);

// Check if internal URL
if (urlParser.isInternalURL(url)) {
  // Handle internal page
}
```

### Settings

```javascript
const settings = require("util/settings/settings.js");

// Get setting
const value = settings.get("settingName");

// Set setting
settings.set("settingName", newValue);

// Listen for changes
settings.listen("settingName", function (newValue) {
  // React to change
});
```

### Webview Operations

```javascript
const webviews = require("webviews.js");

// Bind to webview events
webviews.bindEvent("did-finish-load", function (tabId) {
  // Handle load complete
});

// Call webview methods
webviews.callAsync(tabId, "executeJavaScript", "window.scrollTo(0, 0)");

// Update webview URL
webviews.update(tabId, newUrl);
```

### Tab/Task Operations

```javascript
// Get current tab
const currentTab = tabs.get(tabs.getSelected());

// Update tab data
tabs.update(tabId, { title: "New Title" });

// Get current task
const currentTask = tasks.get(tasks.getSelected());

// Iterate all tabs
tasks.forEach(function (task) {
  task.tabs.forEach(function (tab) {
    // Do something with each tab
  });
});
```

---

## Testing & Verification

### Before Submitting Changes

1. **Verify with `/opsx-verify`** if using OpenSpec
2. **Check code style** - must follow StandardJS
3. **Test in development mode**: `npm run start`
4. **Reload UI** after changes: `Alt+Ctrl+R` (or `Opt+Cmd+R` on Mac)

### Manual Testing Checklist

- [ ] Feature works in development mode
- [ ] No console errors
- [ ] Works with different window sizes
- [ ] Works in both light and dark themes
- [ ] Private tabs work correctly
- [ ] Multiple windows work correctly

---

## Important Implementation Notes

### WebContentsView Architecture

Min uses Electron's `WebContentsView` (not `<webview>` tags). Key implications:

- Webviews are managed in main process, controlled via IPC
- Each tab has its own WebContentsView
- Views are positioned over the UI using bounds calculations
- Placeholder images shown when views are hidden

### Security Considerations

```javascript
// NEVER expose nodeIntegration to web content
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: preloadScriptPath  // Use preload for safe APIs
}

// Validate URLs before navigation
if (urlParser.isInternalURL(url)) {
  // Safe to load
}

// Check permissions for sensitive operations
if (!urlParser.isInternalURL(tabs.get(tabId).url)) {
  throw new Error('Permission denied')
}
```

### Memory Management

```javascript
// Always clean up event listeners
const listener = function () {
  /* ... */
};
webviews.bindEvent("event", listener);
// Later...
webviews.unbindEvent("event", listener);

// Destroy webviews when tabs close
webviews.destroy(tabId);
```

---

## Anti-Patterns to Avoid

### JavaScript

```javascript
// ✗ DON'T: Use var for everything
var x = 1;

// ✓ DO: Use const/let appropriately
const x = 1;
let y = 2;

// ✗ DON'T: Use semicolons
const x = 1;

// ✓ DO: Omit semicolons (StandardJS)
const x = 1;

// ✗ DON'T: Use double quotes
const str = "hello";

// ✓ DO: Use single quotes
const str = "hello";

// ✗ DON'T: Mix module systems
import something from "module";

// ✓ DO: Use CommonJS consistently
const something = require("module");

// ✗ DON'T: Use arrow functions for object methods that need 'this'
const obj = {
  value: 1,
  getValue: () => this.value, // Wrong!
};

// ✓ DO: Use regular functions
const obj = {
  value: 1,
  getValue: function () {
    return this.value;
  },
};
```

### Architecture

```javascript
// ✗ DON'T: Access DOM directly from main process
// Main process should NEVER touch DOM

// ✓ DO: Use IPC for main-renderer communication

// ✗ DON'T: Store state in DOM elements
// DOM should reflect state, not store it

// ✓ DO: Use tab/task state objects

// ✗ DON'T: Skip error handling
try {
  riskyOperation();
} catch (e) {}

// ✓ DO: Handle errors meaningfully
try {
  riskyOperation();
} catch (e) {
  console.error("Operation failed:", e);
  // Provide fallback behavior
}
```

---

## Quick Reference

### File Templates

**New JS Module:**

```javascript
const dependency = require("dependency.js");

const newModule = {
  // Implementation
};

module.exports = newModule;
```

**New CSS File:**

```css
.component-name {
  /* Base styles */
}

.component-name .child {
  /* Child styles */
}

.component-name.is-state {
  /* State styles */
}
```

### Common Require Paths

```javascript
// Core modules
const webviews = require("webviews.js");
const browserUI = require("browserUI.js");
const tabs = require("tabState.js").tabs; // Note: tabs is property of export
const tasks = require("tabState.js").tasks;

// Utilities
const settings = require("util/settings/settings.js");
const urlParser = require("util/urlParser.js");
const searchEngine = require("util/searchEngine.js");

// Components
const tabBar = require("navbar/tabBar.js");
const tabEditor = require("navbar/tabEditor.js");
const searchbar = require("searchbar/searchbar.js");
```

### IPC Message Reference

```javascript
// Common IPC messages
ipc.send("addTab", { url: "https://example.com" });
ipc.send("focusMainWebContents");
ipc.send("set-window-title", title);
ipc.send("quit");

// Handling responses
ipc.on("windowFocus", function () {
  webviews.focus();
});
```

---

## Getting Help

- Check existing code in similar components
- Review OpenSpec artifacts for context
- Look at the [Min wiki](https://github.com/minbrowser/min/wiki) for architecture docs
- Join the [Discord server](https://discord.gg/bRpqjJ4) for questions

---

**Remember: This is a living document. Update it as patterns evolve.**
