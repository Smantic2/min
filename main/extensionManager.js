/*
 * Extension Manager
 *
 * Handles extension install/load/unload state for Min.
 * This file uses the global variable pattern because main.build.js concatenates modules.
 */

const crypto = require("crypto");

var extensionManager = {
  normalSession: null,
  initialized: false,
  loadingInProgress: false,
  policyOrder: ["min-filtering", "min-permissions", "extension-hooks"],

  getState: function () {
    var state = settings.get("extensionState");
    if (!state || typeof state !== "object") {
      state = {
        version: 1,
        items: [],
      };
    }

    if (!Array.isArray(state.items)) {
      state.items = [];
    }

    return state;
  },

  saveState: function (state) {
    settings.set("extensionState", state);
  },

  getFeatureEnabled: function () {
    return settings.get("extensionsFeatureEnabled") === true;
  },

  setFeatureEnabled: function (value) {
    settings.set("extensionsFeatureEnabled", !!value);
  },

  getRegularSession: function () {
    if (extensionManager.normalSession) {
      return extensionManager.normalSession;
    }

    extensionManager.normalSession =
      session.fromPartition("persist:webcontent");
    return extensionManager.normalSession;
  },

  getExtensionsAPI: function (ses) {
    if (ses.extensions) {
      return ses.extensions;
    }
    return ses;
  },

  getPerformanceState: function () {
    var perfState = settings.get("extensionPerformance") || {
      loadCount: 0,
      totalLoadTimeMs: 0,
      lastLoadTimeMs: 0,
      lastStartupLoadTimeMs: 0,
      requestSamples: 0,
      requestTotalMs: 0,
      requestAverageMs: 0,
      ipcSamples: 0,
      ipcTotalMs: 0,
      ipcAverageMs: 0,
      memorySamples: 0,
      memoryLastPrivateKB: 0,
      memoryPeakPrivateKB: 0,
      lastWarning: null,
      warnings: [],
    };

    if (!Array.isArray(perfState.warnings)) {
      perfState.warnings = [];
    }

    return perfState;
  },

  savePerformanceState: function (perfState) {
    settings.set("extensionPerformance", perfState);
  },

  recordRequestOverhead: function (durationMs) {
    if (!extensionManager.getFeatureEnabled()) {
      return;
    }

    var perfState = extensionManager.getPerformanceState();
    perfState.requestSamples += 1;
    perfState.requestTotalMs += durationMs;
    perfState.requestAverageMs =
      perfState.requestTotalMs / perfState.requestSamples;

    if (perfState.requestSamples % 50 === 0) {
      extensionManager.savePerformanceState(perfState);
    }
  },

  recordIPCDuration: function (durationMs) {
    var perfState = extensionManager.getPerformanceState();
    perfState.ipcSamples += 1;
    perfState.ipcTotalMs += durationMs;
    perfState.ipcAverageMs = perfState.ipcTotalMs / perfState.ipcSamples;
    extensionManager.savePerformanceState(perfState);
  },

  recordMemorySample: function () {
    if (!process.getProcessMemoryInfo) {
      return;
    }

    process
      .getProcessMemoryInfo()
      .then(function (info) {
        var perfState = extensionManager.getPerformanceState();

        var privateKB = info.private || info.workingSetSize || 0;
        perfState.memorySamples += 1;
        perfState.memoryLastPrivateKB = privateKB;
        perfState.memoryPeakPrivateKB = Math.max(
          perfState.memoryPeakPrivateKB || 0,
          privateKB
        );
        extensionManager.savePerformanceState(perfState);
      })
      .catch(function () {});
  },

  withMeasuredIPC: function (fn) {
    return async function () {
      var startTime = Date.now();
      try {
        return await fn.apply(null, arguments);
      } finally {
        extensionManager.recordIPCDuration(Date.now() - startTime);
      }
    };
  },

  recordLoadTiming: function (durationMs, reason, extensionId) {
    var perfState = extensionManager.getPerformanceState();

    perfState.loadCount += 1;
    perfState.totalLoadTimeMs += durationMs;
    perfState.lastLoadTimeMs = durationMs;

    if (reason === "startup") {
      perfState.lastStartupLoadTimeMs = durationMs;
    }

    if (durationMs > 3000) {
      var warning = {
        timestamp: Date.now(),
        type: "slow-load",
        extensionId: extensionId,
        durationMs: durationMs,
      };

      perfState.lastWarning = warning;
      perfState.warnings.push(warning);
      perfState.warnings = perfState.warnings.slice(-50);
      settings.set("extensionPerformanceWarning", warning);
    }

    extensionManager.savePerformanceState(perfState);
  },

  incrementCounter: function (key) {
    var counters = settings.get("extensionCounters") || {};
    counters[key] = (counters[key] || 0) + 1;
    settings.set("extensionCounters", counters);
  },

  getPrivateModePolicy: function () {
    return "disabled";
  },

  getCompatibilityRules: function () {
    return {
      supportedPermissions: [
        "activeTab",
        "storage",
        "tabs",
        "contextMenus",
        "webRequest",
        "webRequestBlocking",
        "notifications",
        "alarms",
        "scripting",
      ],
      partialPermissions: ["commands", "omnibox", "declarativeNetRequest"],
      unsupportedPermissions: [
        "nativeMessaging",
        "debugger",
        "enterprise.deviceAttributes",
        "enterprise.networkingAttributes",
      ],
      unsupportedManifestFields: [
        "chrome_url_overrides",
        "devtools_page",
        "externally_connectable",
      ],
    };
  },

  parseManifest: function (extensionPath) {
    var manifestPath = path.join(extensionPath, "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      throw new Error("manifest.json not found in selected directory");
    }

    var manifestData;
    try {
      manifestData = fs.readFileSync(manifestPath, "utf-8");
    } catch (e) {
      throw new Error("unable to read manifest.json");
    }

    var manifest;
    try {
      manifest = JSON.parse(manifestData);
    } catch (e) {
      throw new Error("manifest.json is not valid JSON");
    }

    if (!manifest.name || !manifest.version || !manifest.manifest_version) {
      throw new Error(
        "manifest.json must include name, version, and manifest_version"
      );
    }

    return manifest;
  },

  classifyCompatibility: function (manifest) {
    var rules = extensionManager.getCompatibilityRules();

    var supportedReasons = [];
    var partialReasons = [];
    var unsupportedReasons = [];

    if (manifest.manifest_version > 3) {
      unsupportedReasons.push("manifest_version > 3 is not supported");
    }

    if (manifest.background && manifest.background.scripts) {
      partialReasons.push(
        "background scripts may have limited support in this Electron runtime"
      );
    }

    if (manifest.background && manifest.background.service_worker) {
      partialReasons.push(
        "service worker background support may vary by extension"
      );
    }

    rules.unsupportedManifestFields.forEach(function (fieldName) {
      if (manifest[fieldName]) {
        unsupportedReasons.push("unsupported manifest field: " + fieldName);
      }
    });

    var permissions = [];
    if (Array.isArray(manifest.permissions)) {
      permissions = permissions.concat(manifest.permissions);
    }
    if (Array.isArray(manifest.optional_permissions)) {
      permissions = permissions.concat(manifest.optional_permissions);
    }

    permissions.forEach(function (permission) {
      if (rules.supportedPermissions.includes(permission)) {
        supportedReasons.push("supported permission: " + permission);
        return;
      }

      if (rules.partialPermissions.includes(permission)) {
        partialReasons.push("partially supported permission: " + permission);
        return;
      }

      if (rules.unsupportedPermissions.includes(permission)) {
        unsupportedReasons.push("unsupported permission: " + permission);
        return;
      }

      partialReasons.push("unknown permission support: " + permission);
    });

    var status = "supported";
    if (unsupportedReasons.length > 0) {
      status = "unsupported";
    } else if (partialReasons.length > 0) {
      status = "partial";
    }

    return {
      status,
      reasons: {
        supported: supportedReasons,
        partial: partialReasons,
        unsupported: unsupportedReasons,
      },
    };
  },

  getLocalIdForPath: function (extensionPath) {
    return crypto
      .createHash("sha1")
      .update(path.resolve(extensionPath))
      .digest("hex")
      .slice(0, 16);
  },

  getExtensionByLocalId: function (localId) {
    var state = extensionManager.getState();
    return state.items.find(function (item) {
      return item.localId === localId;
    });
  },

  getAll: function () {
    var state = extensionManager.getState();
    var perfState = extensionManager.getPerformanceState();

    return {
      featureEnabled: extensionManager.getFeatureEnabled(),
      privateModePolicy: extensionManager.getPrivateModePolicy(),
      policyOrder: extensionManager.policyOrder,
      performance: perfState,
      items: state.items,
    };
  },

  loadIntoSession: async function (extensionItem, reason) {
    var targetSession = extensionManager.getRegularSession();
    var api = extensionManager.getExtensionsAPI(targetSession);

    var startTime = Date.now();
    var loadedExtension = await api.loadExtension(extensionItem.path, {
      allowFileAccess: true,
    });
    var duration = Date.now() - startTime;

    extensionItem.id = loadedExtension.id;
    extensionItem.name = loadedExtension.name || extensionItem.name;
    extensionItem.version = loadedExtension.version || extensionItem.version;
    extensionItem.lastError = null;
    extensionItem.lastLoadedAt = Date.now();

    extensionManager.recordLoadTiming(
      duration,
      reason || "runtime",
      extensionItem.localId
    );
    extensionManager.recordMemorySample();

    extensionManager.incrementCounter("loads");

    return loadedExtension;
  },

  removeFromSession: function (extensionItem) {
    if (!extensionItem || !extensionItem.id) {
      return;
    }

    var targetSession = extensionManager.getRegularSession();
    var api = extensionManager.getExtensionsAPI(targetSession);
    try {
      api.removeExtension(extensionItem.id);
    } catch (e) {
      // ignore if extension was not loaded
    }
  },

  loadEnabledExtensions: async function (reason) {
    if (!extensionManager.getFeatureEnabled()) {
      return;
    }

    if (extensionManager.loadingInProgress) {
      return;
    }

    extensionManager.loadingInProgress = true;

    var state = extensionManager.getState();
    for (var i = 0; i < state.items.length; i++) {
      var item = state.items[i];
      if (!item.enabled) {
        continue;
      }

      try {
        var manifest = extensionManager.parseManifest(item.path);
        item.compatibility = extensionManager.classifyCompatibility(manifest);
        item.name = manifest.name;
        item.version = manifest.version;
      } catch (e) {
        item.lastError = e.message || "failed to parse extension manifest";
        continue;
      }

      if (item.compatibility?.status === "unsupported") {
        item.lastError = (item.compatibility.reasons.unsupported || []).join(
          "; "
        );
        continue;
      }

      try {
        await extensionManager.loadIntoSession(item, reason || "startup");
      } catch (e) {
        item.lastError = e.message || "failed to load extension";
        extensionManager.incrementCounter("loadFailures");
      }
    }

    extensionManager.saveState(state);
    extensionManager.loadingInProgress = false;
  },

  installUnpackedExtension: async function (extensionPath) {
    var resolvedPath = path.resolve(extensionPath);

    if (
      !fs.existsSync(resolvedPath) ||
      !fs.statSync(resolvedPath).isDirectory()
    ) {
      throw new Error("selected path must be a directory");
    }

    var manifest = extensionManager.parseManifest(resolvedPath);
    var compatibility = extensionManager.classifyCompatibility(manifest);

    var state = extensionManager.getState();
    var localId = extensionManager.getLocalIdForPath(resolvedPath);
    var existingItem = state.items.find(function (item) {
      return item.localId === localId;
    });

    var extensionItem = existingItem || {
      localId,
      path: resolvedPath,
      installedAt: Date.now(),
      enabled: true,
    };

    extensionItem.name = manifest.name;
    extensionItem.version = manifest.version;
    extensionItem.description = manifest.description || "";
    extensionItem.manifestVersion = manifest.manifest_version;
    extensionItem.compatibility = compatibility;
    extensionItem.lastError = null;

    if (!existingItem) {
      state.items.push(extensionItem);
    }

    if (compatibility.status === "unsupported") {
      extensionItem.enabled = false;
      extensionItem.lastError = compatibility.reasons.unsupported.join("; ");
      extensionManager.saveState(state);
      return extensionItem;
    }

    extensionManager.setFeatureEnabled(true);

    try {
      await extensionManager.loadIntoSession(extensionItem, "install");
    } catch (e) {
      extensionItem.lastError = e.message || "failed to load extension";
      extensionItem.enabled = false;
    }

    extensionManager.saveState(state);
    return extensionItem;
  },

  enableExtension: async function (localId) {
    var state = extensionManager.getState();
    var extensionItem = state.items.find(function (item) {
      return item.localId === localId;
    });

    if (!extensionItem) {
      throw new Error("extension not found");
    }

    var manifest = extensionManager.parseManifest(extensionItem.path);
    extensionItem.compatibility =
      extensionManager.classifyCompatibility(manifest);
    extensionItem.name = manifest.name;
    extensionItem.version = manifest.version;

    if (extensionItem.compatibility?.status === "unsupported") {
      throw new Error("cannot enable unsupported extension");
    }

    extensionManager.setFeatureEnabled(true);
    extensionItem.enabled = true;

    try {
      await extensionManager.loadIntoSession(extensionItem, "enable");
    } catch (e) {
      extensionItem.enabled = false;
      extensionItem.lastError = e.message || "failed to enable extension";
      throw e;
    } finally {
      extensionManager.saveState(state);
    }

    return extensionItem;
  },

  disableExtension: function (localId) {
    var state = extensionManager.getState();
    var extensionItem = state.items.find(function (item) {
      return item.localId === localId;
    });

    if (!extensionItem) {
      throw new Error("extension not found");
    }

    extensionManager.removeFromSession(extensionItem);
    extensionItem.enabled = false;
    extensionItem.lastError = null;

    extensionManager.saveState(state);
    return extensionItem;
  },

  removeExtension: function (localId) {
    var state = extensionManager.getState();
    var idx = state.items.findIndex(function (item) {
      return item.localId === localId;
    });

    if (idx === -1) {
      throw new Error("extension not found");
    }

    var extensionItem = state.items[idx];
    extensionManager.removeFromSession(extensionItem);

    state.items.splice(idx, 1);
    extensionManager.saveState(state);

    return true;
  },

  onSessionCreated: function (createdSession) {
    // private in-memory sessions are intentionally excluded in v1
    if (!extensionManager.getFeatureEnabled()) {
      return;
    }

    if (createdSession === extensionManager.getRegularSession()) {
      extensionManager.loadEnabledExtensions("session-created");
    }
  },

  disableAllLoadedExtensions: function () {
    var state = extensionManager.getState();
    state.items.forEach(function (item) {
      try {
        extensionManager.removeFromSession(item);
      } catch (e) {}
      item.enabled = false;
    });
    extensionManager.saveState(state);
  },

  initialize: function () {
    if (extensionManager.initialized) {
      return;
    }

    extensionManager.initialized = true;

    if (settings.get("extensionsFeatureEnabled") === undefined) {
      settings.set("extensionsFeatureEnabled", false);
    }

    settings.set("extensionsPolicyOrder", extensionManager.policyOrder);

    ipc.handle(
      "extensions:getAll",
      extensionManager.withMeasuredIPC(async function () {
        return extensionManager.getAll();
      })
    );

    ipc.handle(
      "extensions:install",
      extensionManager.withMeasuredIPC(async function (e, extensionPath) {
        if (!extensionPath || typeof extensionPath !== "string") {
          throw new Error("extension path is required");
        }

        return extensionManager.installUnpackedExtension(extensionPath);
      })
    );

    ipc.handle(
      "extensions:enable",
      extensionManager.withMeasuredIPC(async function (e, localId) {
        if (!localId || typeof localId !== "string") {
          throw new Error("extension id is required");
        }

        return extensionManager.enableExtension(localId);
      })
    );

    ipc.handle(
      "extensions:disable",
      extensionManager.withMeasuredIPC(async function (e, localId) {
        if (!localId || typeof localId !== "string") {
          throw new Error("extension id is required");
        }

        return extensionManager.disableExtension(localId);
      })
    );

    ipc.handle(
      "extensions:remove",
      extensionManager.withMeasuredIPC(async function (e, localId) {
        if (!localId || typeof localId !== "string") {
          throw new Error("extension id is required");
        }

        return extensionManager.removeExtension(localId);
      })
    );

    settings.listen("extensionsFeatureEnabled", function (enabled) {
      if (!enabled) {
        extensionManager.disableAllLoadedExtensions();
      }
    });
  },
};

module.exports = extensionManager;
