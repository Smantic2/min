/**
 * Permission Manager - Handles web permission requests with persistent storage
 * Supports: clipboard-read, clipboard-write, geolocation, notifications, camera, microphone
 */

// Note: ipc is already defined in main.js and available globally in the built file

// Permission type mapping from Electron to internal types
const permissionTypeMap = {
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
const permissionDescriptions = {
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

// Get stored site permissions from settings
function getSitePermissions() {
  return settings.get("sitePermissions") || {};
}

// Save site permissions to settings
function saveSitePermissions(permissions) {
  settings.set("sitePermissions", permissions);
}

/**
 * Get permission decision for a specific site and type
 * @param {string} site - Site origin (hostname)
 * @param {string} type - Permission type
 * @returns {string|null} - 'granted', 'denied', or null if not set
 */
function getPermission(site, type) {
  const permissions = getSitePermissions();
  if (permissions[site] && permissions[site][type]) {
    return permissions[site][type];
  }
  return null;
}

/**
 * Set permission decision for a specific site and type
 * @param {string} site - Site origin (hostname)
 * @param {string} type - Permission type
 * @param {string} decision - 'granted' or 'denied'
 * @param {boolean} remember - Whether to persist this decision
 */
function setPermission(site, type, decision, remember = true) {
  if (!remember) {
    return;
  }

  const permissions = getSitePermissions();
  if (!permissions[site]) {
    permissions[site] = {};
  }
  permissions[site][type] = decision;
  saveSitePermissions(permissions);
}

/**
 * Clear permission for a specific site and type
 * @param {string} site - Site origin
 * @param {string} type - Permission type
 */
function clearPermission(site, type) {
  const permissions = getSitePermissions();
  if (permissions[site]) {
    delete permissions[site][type];
    // Clean up empty site entries
    if (Object.keys(permissions[site]).length === 0) {
      delete permissions[site];
    }
    saveSitePermissions(permissions);
  }
}

/**
 * Clear all permissions for a specific site
 * @param {string} site - Site origin
 */
function clearSitePermissions(site) {
  const permissions = getSitePermissions();
  if (permissions[site]) {
    delete permissions[site];
    saveSitePermissions(permissions);
  }
}

/**
 * Clear all site permissions
 */
function clearAllPermissions() {
  settings.set("sitePermissions", {});
}

/**
 * Get all permissions organized by site
 * @returns {Object} - Permissions object keyed by site
 */
function getAllPermissions() {
  return getSitePermissions();
}

/**
 * Map Electron permission to internal type
 * @param {string} electronPermission - Permission string from Electron
 * @param {Object} details - Permission details
 * @returns {string|null} - Internal permission type
 */
function mapElectronPermission(electronPermission, details) {
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
}

/**
 * Check if permission should be handled by our system
 * @param {string} permissionType - Internal permission type
 * @returns {boolean}
 */
function isSupportedPermission(permissionType) {
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
}

/**
 * Get permission description for UI
 * @param {string} permissionType - Internal permission type
 * @returns {Object} - Title and description
 */
function getPermissionDescription(permissionType) {
  return (
    permissionDescriptions[permissionType] || {
      title: "Request Permission",
      description: "wants to access a device feature",
    }
  );
}

/**
 * Request permission from user via dialog
 * @param {string} site - Site origin
 * @param {string} permissionType - Internal permission type
 * @param {Object} webContents - Electron webContents
 * @returns {Promise<boolean>} - User decision
 */
async function requestPermissionFromUser(site, permissionType, webContents) {
  return new Promise(function (resolve) {
    const description = getPermissionDescription(permissionType);
    const permissionRequest = {
      site: site,
      permissionType: permissionType,
      title: description.title,
      description: description.description,
      webContentsId: webContents.id,
    };

    // Send request to renderer to show dialog
    const window = getWindowFromWebContents(webContents);
    if (window) {
      sendIPCToWindow(window, "showPermissionDialog", permissionRequest);

      // Listen for response
      const responseHandler = function (e, response) {
        if (
          response.site === site &&
          response.permissionType === permissionType
        ) {
          ipc.removeListener("permissionDialogResponse", responseHandler);
          resolve(response.granted);
        }
      };

      ipc.once("permissionDialogResponse", responseHandler);

      // Timeout after 5 minutes (user might ignore dialog)
      setTimeout(function () {
        ipc.removeListener("permissionDialogResponse", responseHandler);
        resolve(false);
      }, 300000);
    } else {
      resolve(false);
    }
  });
}

/**
 * Handle permission request from webview
 * @param {Object} webContents - Electron webContents
 * @param {string} permission - Electron permission type
 * @param {function} callback - Callback with decision
 * @param {Object} details - Permission details
 */
async function pagePermissionRequestHandler(
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
  let site;
  try {
    site = new URL(details.requestingUrl).hostname;
  } catch (e) {
    console.warn("Invalid URL in permission request:", details.requestingUrl);
    callback(false);
    return;
  }

  // Map to internal permission type
  const permissionType = mapElectronPermission(permission, details);

  if (!permissionType || !isSupportedPermission(permissionType)) {
    // Permission not supported by our system
    callback(false);
    return;
  }

  // Check stored permission
  const storedDecision = getPermission(site, permissionType);

  if (storedDecision === "granted") {
    callback(true);
    return;
  }

  if (storedDecision === "denied") {
    callback(false);
    return;
  }

  // No stored decision, show dialog
  try {
    const granted = await requestPermissionFromUser(
      site,
      permissionType,
      webContents
    );
    callback(granted);
  } catch (e) {
    console.error("Error requesting permission:", e);
    callback(false);
  }
}

/**
 * Handle permission check from webview
 * @param {Object} webContents - Electron webContents
 * @param {string} permission - Electron permission type
 * @param {string} requestingOrigin - Requesting origin
 * @param {Object} details - Permission details
 * @returns {boolean} - Whether permission is granted
 */
function pagePermissionCheckHandler(
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
  let site;
  try {
    site = new URL(requestingOrigin).hostname;
  } catch (e) {
    console.warn("Invalid URL in permission check:", requestingOrigin);
    return false;
  }

  // Map to internal permission type
  const permissionType = mapElectronPermission(permission, details);

  if (!permissionType || !isSupportedPermission(permissionType)) {
    return false;
  }

  // Check stored permission
  const storedDecision = getPermission(site, permissionType);
  return storedDecision === "granted";
}

// Helper functions - these are defined in main.js and available globally in the built file
// getWindowFromWebContents and sendIPCToWindow are provided by main.js

/**
 * Initialize permission manager with required dependencies
 * @param {Object} deps - Dependencies from main.js
 */
function initialize(deps) {
  // These functions are already available globally from main.js
  // No need to reassign them

  // Register IPC handlers
  ipc.on("permission:set", function (e, data) {
    setPermission(data.site, data.permissionType, data.decision, data.remember);
  });

  ipc.on("permission:get", function (e, data) {
    const decision = getPermission(data.site, data.permissionType);
    e.returnValue = decision;
  });

  ipc.on("permission:clear", function (e, data) {
    if (data.site && data.permissionType) {
      clearPermission(data.site, data.permissionType);
    } else if (data.site) {
      clearSitePermissions(data.site);
    } else {
      clearAllPermissions();
    }
  });

  ipc.on("permission:getAll", function (e) {
    e.returnValue = getAllPermissions();
  });
}

/**
 * Get permission handlers for Electron session
 * @returns {Object} - Permission request and check handlers
 */
function getHandlers() {
  return {
    requestHandler: pagePermissionRequestHandler,
    checkHandler: pagePermissionCheckHandler,
  };
}

module.exports = {
  initialize,
  getHandlers,
  getPermission,
  setPermission,
  clearPermission,
  clearSitePermissions,
  clearAllPermissions,
  getAllPermissions,
  getPermissionDescription,
};
