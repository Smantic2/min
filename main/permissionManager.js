/**
 * Permission Manager - Handles web permission requests with persistent storage
 * Supports: clipboard-read, clipboard-write, geolocation, notifications, camera, microphone
 *
 * NOTE: This module uses the global variable pattern (var permissionManager = {...})
 * because main.build.js concatenates files directly without a module system.
 * The module.exports at the end is kept for compatibility but not used in the build.
 */

// Permission type mapping from Electron to internal types
var permissionTypeMap = {
  "clipboard-read": "clipboard-read",
  "clipboard-write": "clipboard-write",
  "clipboard-sanitized-write": "clipboard-write",
  geolocation: "geolocation",
  notifications: "notifications",
  media: "media",
  mediaKeySystem: "media",
  pointerLock: "pointerLock",
  midi: "midi",
  midiSysex: "midi",
  usb: "usb",
  serial: "serial",
  hid: "hid",
  bluetooth: "bluetooth",
};

// Permission descriptions for UI
var permissionDescriptions = {
  "clipboard-read": {
    title: "Access Clipboard",
    description: "wants to read text from your clipboard",
  },
  "clipboard-write": {
    title: "Modify Clipboard",
    description: "wants to write text to your clipboard",
  },
  geolocation: {
    title: "Access Location",
    description: "wants to access your location",
  },
  notifications: {
    title: "Show Notifications",
    description: "wants to show notifications",
  },
  camera: {
    title: "Access Camera",
    description: "wants to access your camera",
  },
  microphone: {
    title: "Access Microphone",
    description: "wants to access your microphone",
  },
  media: {
    title: "Access Camera and Microphone",
    description: "wants to access your camera and/or microphone",
  },
  pointerLock: {
    title: "Lock Pointer",
    description: "wants to lock your mouse pointer",
  },
};

/**
 * Permission Manager module
 * Exposes all permission-related functionality as a global object
 */
var permissionManager = {
  // Internal state - injected dependency for finding windows from view contents
  _getWindowFromViewContents: null,

  /**
   * Get stored site permissions from settings
   * @returns {Object} - Permissions object keyed by site
   */
  getSitePermissions: function () {
    return settings.get("sitePermissions") || {};
  },

  /**
   * Save site permissions to settings
   * @param {Object} permissions - Permissions object to save
   */
  saveSitePermissions: function (permissions) {
    settings.set("sitePermissions", permissions);
  },

  /**
   * Get permission decision for a specific site and type
   * @param {string} site - Site origin (hostname)
   * @param {string} type - Permission type
   * @returns {string|null} - 'granted', 'denied', or null if not set
   */
  getPermission: function (site, type) {
    var permissions = permissionManager.getSitePermissions();
    if (permissions[site] && permissions[site][type]) {
      return permissions[site][type];
    }
    return null;
  },

  /**
   * Set permission decision for a specific site and type
   * @param {string} site - Site origin (hostname)
   * @param {string} type - Permission type
   * @param {string} decision - 'granted' or 'denied'
   * @param {boolean} remember - Whether to persist this decision
   */
  setPermission: function (site, type, decision, remember) {
    if (remember === false) {
      return;
    }

    var permissions = permissionManager.getSitePermissions();
    if (!permissions[site]) {
      permissions[site] = {};
    }
    permissions[site][type] = decision;
    permissionManager.saveSitePermissions(permissions);
  },

  /**
   * Clear permission for a specific site and type
   * @param {string} site - Site origin
   * @param {string} type - Permission type
   */
  clearPermission: function (site, type) {
    var permissions = permissionManager.getSitePermissions();
    if (permissions[site]) {
      delete permissions[site][type];
      // Clean up empty site entries
      if (Object.keys(permissions[site]).length === 0) {
        delete permissions[site];
      }
      permissionManager.saveSitePermissions(permissions);
    }
  },

  /**
   * Clear all permissions for a specific site
   * @param {string} site - Site origin
   */
  clearSitePermissions: function (site) {
    var permissions = permissionManager.getSitePermissions();
    if (permissions[site]) {
      delete permissions[site];
      permissionManager.saveSitePermissions(permissions);
    }
  },

  /**
   * Clear all site permissions
   */
  clearAllPermissions: function () {
    settings.set("sitePermissions", {});
  },

  /**
   * Get all permissions organized by site
   * @returns {Object} - Permissions object keyed by site
   */
  getAllPermissions: function () {
    return permissionManager.getSitePermissions();
  },

  /**
   * Map Electron permission to internal type
   * @param {string} electronPermission - Permission string from Electron
   * @param {Object} details - Permission details
   * @returns {string|null} - Internal permission type
   */
  mapElectronPermission: function (electronPermission, details) {
    // Handle media permissions specially
    if (electronPermission === "media") {
      if (details.mediaTypes) {
        if (details.mediaTypes.includes("video")) {
          return "camera";
        }
        if (details.mediaTypes.includes("audio")) {
          return "microphone";
        }
      }
      if (details.mediaType === "video") {
        return "camera";
      }
      if (details.mediaType === "audio") {
        return "microphone";
      }
      return "media";
    }

    return permissionTypeMap[electronPermission] || null;
  },

  /**
   * Check if permission should be handled by our system
   * @param {string} permissionType - Internal permission type
   * @returns {boolean}
   */
  isSupportedPermission: function (permissionType) {
    return [
      "clipboard-read",
      "clipboard-write",
      "geolocation",
      "notifications",
      "camera",
      "microphone",
      "media",
      "pointerLock",
    ].includes(permissionType);
  },

  /**
   * Get permission description for UI
   * @param {string} permissionType - Internal permission type
   * @returns {Object} - Title and description
   */
  getPermissionDescription: function (permissionType) {
    return (
      permissionDescriptions[permissionType] || {
        title: "Request Permission",
        description: "wants to access a device feature",
      }
    );
  },

  /**
   * Request permission from user via dialog
   * @param {string} site - Site origin
   * @param {string} permissionType - Internal permission type
   * @param {Object} webContents - Electron webContents
   * @returns {Promise<boolean>} - User decision
   */
  requestPermissionFromUser: function (site, permissionType, webContents) {
    return new Promise(function (resolve) {
      var description =
        permissionManager.getPermissionDescription(permissionType);
      var permissionRequest = {
        site: site,
        permissionType: permissionType,
        title: description.title,
        description: description.description,
        webContentsId: webContents.id,
      };

      // Use the injected function to find the window that owns this view's webContents
      var win = permissionManager._getWindowFromViewContents
        ? permissionManager._getWindowFromViewContents(webContents)
        : null;

      if (!win) {
        console.warn(
          "[PermissionManager] Could not find window for webContents. Denying permission."
        );
        resolve(false);
        return;
      }

      sendIPCToWindow(win, "showPermissionDialog", permissionRequest);

      // Listen for response
      var responseHandler = function (e, response) {
        if (
          response.site === site &&
          response.permissionType === permissionType
        ) {
          ipc.removeListener("permissionDialogResponse", responseHandler);
          resolve(response.granted);
        }
      };

      ipc.on("permissionDialogResponse", responseHandler);

      // Timeout after 5 minutes (user might ignore dialog)
      setTimeout(function () {
        ipc.removeListener("permissionDialogResponse", responseHandler);
        resolve(false);
      }, 300000);
    });
  },

  /**
   * Handle permission request from webview
   * @param {Object} webContents - Electron webContents
   * @param {string} permission - Electron permission type
   * @param {function} callback - Callback with decision
   * @param {Object} details - Permission details
   */
  pagePermissionRequestHandler: function (
    webContents,
    permission,
    callback,
    details
  ) {
    // Always allow fullscreen
    if (permission === "fullscreen") {
      callback(true);
      return;
    }

    // Always allow sanitized clipboard write
    if (permission === "clipboard-sanitized-write") {
      callback(true);
      return;
    }

    // Only handle main frame requests for simplicity
    if (!details.isMainFrame) {
      callback(false);
      return;
    }

    if (!details.requestingUrl) {
      callback(false);
      return;
    }

    // Parse origin
    var site;
    try {
      site = new URL(details.requestingUrl).hostname;
    } catch (e) {
      console.warn(
        "[PermissionManager] Invalid URL in permission request:",
        details.requestingUrl
      );
      callback(false);
      return;
    }

    // Map to internal permission type
    var permissionType = permissionManager.mapElectronPermission(
      permission,
      details
    );

    if (
      !permissionType ||
      !permissionManager.isSupportedPermission(permissionType)
    ) {
      callback(false);
      return;
    }

    // Check stored permission
    var storedDecision = permissionManager.getPermission(site, permissionType);

    if (storedDecision === "granted") {
      callback(true);
      return;
    }

    if (storedDecision === "denied") {
      callback(false);
      return;
    }

    // No stored decision, show dialog
    permissionManager
      .requestPermissionFromUser(site, permissionType, webContents)
      .then(function (granted) {
        callback(granted);
      })
      .catch(function (e) {
        console.error("[PermissionManager] Error requesting permission:", e);
        callback(false);
      });
  },

  /**
   * Handle permission check from webview
   * @param {Object} webContents - Electron webContents
   * @param {string} permission - Electron permission type
   * @param {string} requestingOrigin - Requesting origin
   * @param {Object} details - Permission details
   * @returns {boolean} - Whether permission is granted
   */
  pagePermissionCheckHandler: function (
    webContents,
    permission,
    requestingOrigin,
    details
  ) {
    // Allow iframe requests from same origin
    if (!details.isMainFrame && requestingOrigin !== details.embeddingOrigin) {
      return false;
    }

    if (!requestingOrigin) {
      return false;
    }

    // Always allow sanitized clipboard write
    if (permission === "clipboard-sanitized-write") {
      return true;
    }

    // Parse origin
    var site;
    try {
      site = new URL(requestingOrigin).hostname;
    } catch (e) {
      console.warn(
        "[PermissionManager] Invalid URL in permission check:",
        requestingOrigin
      );
      return false;
    }

    // Map to internal permission type
    var permissionType = permissionManager.mapElectronPermission(
      permission,
      details
    );

    if (
      !permissionType ||
      !permissionManager.isSupportedPermission(permissionType)
    ) {
      return false;
    }

    // Check stored permission
    var storedDecision = permissionManager.getPermission(site, permissionType);
    return storedDecision === "granted";
  },

  /**
   * Initialize permission manager with required dependencies
   * @param {Object} deps - Dependencies object
   * @param {Function} deps.getWindowFromViewContents - Function to get window from view webContents
   */
  initialize: function (deps) {
    if (deps && deps.getWindowFromViewContents) {
      permissionManager._getWindowFromViewContents =
        deps.getWindowFromViewContents;
    } else {
      console.warn(
        "[PermissionManager] WARNING: getWindowFromViewContents not provided!"
      );
    }

    // Register IPC handlers
    ipc.on("permission:set", function (e, data) {
      console.log(
        "[PermissionManager] permission:set called with:",
        JSON.stringify(data)
      );
      permissionManager.setPermission(
        data.site,
        data.permissionType,
        data.decision,
        data.remember
      );
      console.log(
        "[PermissionManager] After set, all permissions:",
        JSON.stringify(permissionManager.getAllPermissions())
      );
    });

    ipc.on("permission:get", function (e, data) {
      var decision = permissionManager.getPermission(
        data.site,
        data.permissionType
      );
      e.returnValue = decision;
    });

    ipc.on("permission:clear", function (e, data) {
      if (data.site && data.permissionType) {
        permissionManager.clearPermission(data.site, data.permissionType);
      } else if (data.site) {
        permissionManager.clearSitePermissions(data.site);
      } else {
        permissionManager.clearAllPermissions();
      }
    });

    ipc.on("permission:getAll", function (e) {
      var allPerms = permissionManager.getAllPermissions();
      console.log(
        "[PermissionManager] permission:getAll called, returning:",
        JSON.stringify(allPerms)
      );
      e.returnValue = allPerms;
    });
  },

  /**
   * Get permission handlers for Electron session
   * @returns {Object} - Permission request and check handlers
   */
  getHandlers: function () {
    return {
      requestHandler: permissionManager.pagePermissionRequestHandler,
      checkHandler: permissionManager.pagePermissionCheckHandler,
    };
  },
};

// Export for compatibility (not used in concatenated build)
module.exports = permissionManager;
