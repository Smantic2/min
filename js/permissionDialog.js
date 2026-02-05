/**
 * Permission Dialog - Handles permission request modals
 * Apple-style modal for web permission requests
 *
 * NOTE: WebContentsView (tabs) render above HTML content, so we need to
 * hide the current view while the modal is shown to make it visible.
 */

var webviews = require("webviews.js");

// Permission icon SVGs (using inline SVG for minimal dependencies)
var permissionIcons = {
  "clipboard-read":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  "clipboard-write":
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  geolocation:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  notifications:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
  microphone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
  media:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
  pointerLock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path><path d="M13 13l6 6"></path></svg>',
  default:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
};

// Permission descriptions - use localized strings
var permissionDescriptions = {
  "clipboard-read": {
    title: l("permissionClipboardReadTitle"),
    description: l("permissionClipboardReadDescription"),
  },
  "clipboard-write": {
    title: l("permissionClipboardWriteTitle"),
    description: l("permissionClipboardWriteDescription"),
  },
  geolocation: {
    title: l("permissionGeolocationTitle"),
    description: l("permissionGeolocationDescription"),
  },
  notifications: {
    title: l("permissionNotificationsTitle"),
    description: l("permissionNotificationsDescription"),
  },
  camera: {
    title: l("permissionCameraTitle"),
    description: l("permissionCameraDescription"),
  },
  microphone: {
    title: l("permissionMicrophoneTitle"),
    description: l("permissionMicrophoneDescription"),
  },
  media: {
    title: l("permissionMediaTitle"),
    description: l("permissionMediaDescription"),
  },
  pointerLock: {
    title: l("permissionPointerLockTitle"),
    description: l("permissionPointerLockDescription"),
  },
};

var permissionDialog = {
  modalContainer: null,
  modalOverlay: null,
  modalContent: null,
  iconEl: null,
  titleEl: null,
  descriptionEl: null,
  siteEl: null,
  rememberCheckbox: null,
  allowBtn: null,
  denyBtn: null,

  currentRequest: null,
  isVisible: false,
  requestQueue: [],
  hiddenTabId: null, // Track which tab was hidden

  /**
   * Initialize the permission dialog module.
   * Caches DOM elements, binds event handlers, and sets up IPC listeners.
   */
  initialize: function () {
    permissionDialog.cacheDOM();
    permissionDialog.bindEvents();
    permissionDialog.setupIPC();
  },

  cacheDOM: function () {
    permissionDialog.modalContainer =
      document.getElementById("permission-modal");
    permissionDialog.modalOverlay =
      permissionDialog.modalContainer.querySelector(
        ".permission-modal-overlay"
      );
    permissionDialog.modalContent =
      permissionDialog.modalContainer.querySelector(
        ".permission-modal-content"
      );
    permissionDialog.iconEl = document.getElementById("permission-modal-icon");
    permissionDialog.titleEl = document.getElementById(
      "permission-modal-title"
    );
    permissionDialog.descriptionEl = document.getElementById(
      "permission-modal-description"
    );
    permissionDialog.siteEl = document.getElementById("permission-modal-site");
    permissionDialog.rememberCheckbox = document.getElementById(
      "permission-modal-remember"
    );
    permissionDialog.allowBtn = document.getElementById(
      "permission-modal-allow"
    );
    permissionDialog.denyBtn = document.getElementById("permission-modal-deny");
  },

  bindEvents: function () {
    permissionDialog.allowBtn.addEventListener(
      "click",
      permissionDialog.handleAllow
    );
    permissionDialog.denyBtn.addEventListener(
      "click",
      permissionDialog.handleDeny
    );
    permissionDialog.modalOverlay.addEventListener(
      "click",
      permissionDialog.handleDeny
    );

    document.addEventListener("keydown", function (e) {
      if (permissionDialog.isVisible && e.key === "Escape") {
        e.preventDefault();
        permissionDialog.handleDeny();
      }
    });
  },

  /**
   * Set up IPC listener for permission dialog requests from main process.
   */
  setupIPC: function () {
    console.log(
      "[DEBUG][PermDialog] Setting up IPC listener for showPermissionDialog..."
    );
    ipc.on("showPermissionDialog", function (event, request) {
      console.log(
        "[DEBUG][PermDialog] ========== RECEIVED showPermissionDialog =========="
      );
      console.log(
        "[DEBUG][PermDialog] Request:",
        JSON.stringify(request, null, 2)
      );
      permissionDialog.queueRequest(request);
    });
    console.log("[DEBUG][PermDialog] IPC listener registered successfully");
  },

  queueRequest: function (request) {
    console.log(
      "[DEBUG][PermDialog] queueRequest called, isVisible:",
      permissionDialog.isVisible
    );
    if (permissionDialog.isVisible) {
      console.log(
        "[DEBUG][PermDialog] Modal already visible, queueing request"
      );
      permissionDialog.requestQueue.push(request);
      return;
    }
    console.log("[DEBUG][PermDialog] Showing modal...");
    permissionDialog.showModal(request);
  },

  /**
   * Display the permission modal for a given request.
   * Hides the current webview so the modal is visible above native content.
   * @param {Object} request - Permission request object
   * @param {string} request.site - Site hostname requesting permission
   * @param {string} request.permissionType - Type of permission requested
   * @param {string} request.title - Title for the modal
   * @param {string} request.description - Description for the modal
   */
  showModal: function (request) {
    console.log("[DEBUG][PermDialog] ========== SHOWING MODAL ==========");
    console.log("[DEBUG][PermDialog] request.site:", request.site);
    console.log(
      "[DEBUG][PermDialog] request.permissionType:",
      request.permissionType
    );

    permissionDialog.currentRequest = request;
    permissionDialog.isVisible = true;

    // Hide the current webview so the modal is visible
    // WebContentsView renders above HTML, so we need to hide it
    // Use global tabs (set on window.tabs during initialization)
    var selectedTabId =
      typeof tabs !== "undefined" && tabs.getSelected
        ? tabs.getSelected()
        : null;
    console.log("[DEBUG][PermDialog] Selected tab ID:", selectedTabId);
    permissionDialog.hiddenTabId = selectedTabId;
    if (permissionDialog.hiddenTabId) {
      console.log("[DEBUG][PermDialog] Hiding current view...");
      ipc.send("hideCurrentView");
    }

    // Set icon
    var iconSvg =
      permissionIcons[request.permissionType] || permissionIcons.default;
    permissionDialog.iconEl.innerHTML = iconSvg;

    // Set text content
    var desc = permissionDescriptions[request.permissionType] || {
      title: request.title || l("permissionDefaultTitle"),
      description: request.description || l("permissionDefaultDescription"),
    };

    permissionDialog.titleEl.textContent = desc.title;
    permissionDialog.descriptionEl.textContent = desc.description;
    permissionDialog.siteEl.textContent = request.site;

    // Reset checkbox
    permissionDialog.rememberCheckbox.checked = true;

    // Show modal
    permissionDialog.modalContainer.hidden = false;
    console.log("[DEBUG][PermDialog] Modal is now visible");

    // Focus primary button
    setTimeout(function () {
      permissionDialog.allowBtn.focus();
    }, 100);
  },

  /**
   * Hide the permission modal and restore the webview.
   * Processes the next request in queue if any.
   */
  hideModal: function () {
    permissionDialog.modalContainer.hidden = true;
    permissionDialog.isVisible = false;

    // Restore the webview that was hidden
    if (permissionDialog.hiddenTabId) {
      webviews.setSelected(permissionDialog.hiddenTabId, { focus: false });
      permissionDialog.hiddenTabId = null;
    }

    permissionDialog.currentRequest = null;

    // Process next request in queue
    if (permissionDialog.requestQueue.length > 0) {
      var nextRequest = permissionDialog.requestQueue.shift();
      setTimeout(function () {
        permissionDialog.showModal(nextRequest);
      }, 300);
    }
  },

  /**
   * Handle user clicking the "Allow" button.
   * Sends granted response to main process and optionally persists the decision.
   */
  handleAllow: function () {
    console.log("[DEBUG][PermDialog] ========== ALLOW CLICKED ==========");
    console.log(
      "[DEBUG][PermDialog] currentRequest:",
      permissionDialog.currentRequest
        ? JSON.stringify(permissionDialog.currentRequest, null, 2)
        : "null"
    );

    if (!permissionDialog.currentRequest) {
      console.log("[DEBUG][PermDialog] No currentRequest, returning");
      return;
    }

    var remember = permissionDialog.rememberCheckbox.checked;
    console.log("[DEBUG][PermDialog] remember:", remember);

    var response = {
      site: permissionDialog.currentRequest.site,
      permissionType: permissionDialog.currentRequest.permissionType,
      granted: true,
      remember: remember,
    };
    console.log(
      "[DEBUG][PermDialog] Sending permissionDialogResponse:",
      JSON.stringify(response, null, 2)
    );

    // Send response to main process
    ipc.send("permissionDialogResponse", response);
    console.log("[DEBUG][PermDialog] IPC permissionDialogResponse sent");

    // Save permission if remember is checked
    if (remember) {
      console.log(
        "[DEBUG][PermDialog] Sending permission:set to save decision..."
      );
      ipc.send("permission:set", {
        site: permissionDialog.currentRequest.site,
        permissionType: permissionDialog.currentRequest.permissionType,
        decision: "granted",
        remember: true,
      });
    }

    permissionDialog.hideModal();
  },

  /**
   * Handle user clicking the "Deny" button or pressing Escape.
   * Sends denied response to main process and optionally persists the decision.
   */
  handleDeny: function () {
    console.log("[DEBUG][PermDialog] ========== DENY CLICKED ==========");
    console.log(
      "[DEBUG][PermDialog] currentRequest:",
      permissionDialog.currentRequest
        ? JSON.stringify(permissionDialog.currentRequest, null, 2)
        : "null"
    );

    if (!permissionDialog.currentRequest) {
      console.log("[DEBUG][PermDialog] No currentRequest, returning");
      return;
    }

    var remember = permissionDialog.rememberCheckbox.checked;
    console.log("[DEBUG][PermDialog] remember:", remember);

    var response = {
      site: permissionDialog.currentRequest.site,
      permissionType: permissionDialog.currentRequest.permissionType,
      granted: false,
      remember: remember,
    };
    console.log(
      "[DEBUG][PermDialog] Sending permissionDialogResponse:",
      JSON.stringify(response, null, 2)
    );

    // Send response to main process
    ipc.send("permissionDialogResponse", response);
    console.log("[DEBUG][PermDialog] IPC permissionDialogResponse sent");

    // Save permission if remember is checked
    if (remember) {
      console.log(
        "[DEBUG][PermDialog] Sending permission:set to save decision..."
      );
      ipc.send("permission:set", {
        site: permissionDialog.currentRequest.site,
        permissionType: permissionDialog.currentRequest.permissionType,
        decision: "denied",
        remember: true,
      });
    }

    permissionDialog.hideModal();
  },
};

module.exports = permissionDialog;
