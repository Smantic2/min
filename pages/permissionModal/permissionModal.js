/**
 * Permission Modal - Handles permission request dialogs
 * Displays Apple-style modal for web permission requests
 */

const { ipcRenderer } = require("electron");

// Permission icon SVGs
const permissionIcons = {
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

// Current permission request state
let currentRequest = null;
let isModalVisible = false;

// DOM elements
const backdrop = document.getElementById("permission-backdrop");
const modal = document.getElementById("permission-modal");
const iconContainer = document.getElementById("permission-icon");
const titleEl = document.getElementById("permission-title");
const descriptionEl = document.getElementById("permission-description");
const siteEl = document.getElementById("permission-site");
const rememberCheckbox = document.getElementById("permission-remember");
const allowBtn = document.getElementById("permission-allow");
const denyBtn = document.getElementById("permission-deny");

/**
 * Show permission modal with request data
 * @param {Object} request - Permission request data
 */
function showPermissionModal(request) {
  if (isModalVisible) {
    // Queue the request if modal is already showing
    setTimeout(function () {
      showPermissionModal(request);
    }, 100);
    return;
  }

  currentRequest = request;
  isModalVisible = true;

  // Set icon
  const iconSvg =
    permissionIcons[request.permissionType] || permissionIcons.default;
  iconContainer.innerHTML = iconSvg;

  // Set text content
  titleEl.textContent = request.title || "Request Permission";
  descriptionEl.textContent =
    request.description || "wants to access a device feature";
  siteEl.textContent = request.site || "Unknown site";

  // Reset checkbox
  rememberCheckbox.checked = true;

  // Show modal with animation
  backdrop.classList.add("visible");
  modal.classList.add("visible");

  // Focus primary button
  setTimeout(function () {
    allowBtn.focus();
  }, 100);
}

/**
 * Hide permission modal
 */
function hidePermissionModal() {
  backdrop.classList.remove("visible");
  modal.classList.remove("visible");

  setTimeout(function () {
    isModalVisible = false;
    currentRequest = null;
  }, 300);
}

/**
 * Handle allow button click
 */
function handleAllow() {
  if (!currentRequest) return;

  const remember = rememberCheckbox.checked;

  // Send response to main process
  ipcRenderer.send("permissionDialogResponse", {
    site: currentRequest.site,
    permissionType: currentRequest.permissionType,
    granted: true,
    remember: remember,
  });

  // Save permission if remember is checked
  if (remember) {
    ipcRenderer.send("permission:set", {
      site: currentRequest.site,
      permissionType: currentRequest.permissionType,
      decision: "granted",
      remember: true,
    });
  }

  hidePermissionModal();
}

/**
 * Handle deny button click
 */
function handleDeny() {
  if (!currentRequest) return;

  const remember = rememberCheckbox.checked;

  // Send response to main process
  ipcRenderer.send("permissionDialogResponse", {
    site: currentRequest.site,
    permissionType: currentRequest.permissionType,
    granted: false,
    remember: remember,
  });

  // Save permission if remember is checked
  if (remember) {
    ipcRenderer.send("permission:set", {
      site: currentRequest.site,
      permissionType: currentRequest.permissionType,
      decision: "denied",
      remember: true,
    });
  }

  hidePermissionModal();
}

/**
 * Handle keyboard events
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
  if (!isModalVisible) return;

  if (e.key === "Escape") {
    e.preventDefault();
    handleDeny();
  }
}

/**
 * Handle backdrop click
 * @param {MouseEvent} e
 */
function handleBackdropClick(e) {
  if (e.target === backdrop) {
    handleDeny();
  }
}

// Event listeners
allowBtn.addEventListener("click", handleAllow);
denyBtn.addEventListener("click", handleDeny);
document.addEventListener("keydown", handleKeyDown);
backdrop.addEventListener("click", handleBackdropClick);

// Listen for permission requests from main process
ipcRenderer.on("showPermissionDialog", function (event, request) {
  showPermissionModal(request);
});

// Initialize - hide modal on load
hidePermissionModal();
