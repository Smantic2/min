document.title = l("settingsPreferencesHeading") + " | Min";

var contentTypeBlockingContainer = document.getElementById(
  "content-type-blocking"
);
var banner = document.getElementById("restart-required-banner");
var siteThemeCheckbox = document.getElementById("checkbox-site-theme");
var showDividerCheckbox = document.getElementById("checkbox-show-divider");
var userscriptsCheckbox = document.getElementById("checkbox-userscripts");
var userscriptsShowDirectorySection = document.getElementById(
  "userscripts-show-directory"
);
var separateTitlebarCheckbox = document.getElementById(
  "checkbox-separate-titlebar"
);
var openTabsInForegroundCheckbox = document.getElementById(
  "checkbox-open-tabs-in-foreground"
);
var autoPlayCheckbox = document.getElementById("checkbox-enable-autoplay");
var userAgentCheckbox = document.getElementById("checkbox-user-agent");
var userAgentInput = document.getElementById("input-user-agent");

function showRestartRequiredBanner() {
  banner.hidden = false;
  settings.set("restartNow", true);
}
settings.get("restartNow", (value) => {
  if (value === true) {
    showRestartRequiredBanner();
  }
});

/* content blocking settings */

var trackingLevelContainer = document.getElementById(
  "tracking-level-container"
);
var trackingLevelOptions = Array.from(
  trackingLevelContainer.querySelectorAll("input[name=blockingLevel]")
);
var blockingExceptionsContainer = document.getElementById(
  "content-blocking-information"
);
var blockingExceptionsInput = document.getElementById(
  "content-blocking-exceptions"
);
var blockedRequestCount = document.querySelector(
  "#content-blocking-blocked-requests strong"
);

settings.listen("filteringBlockedCount", function (value) {
  var count = value || 0;
  var valueStr;
  if (count > 50000) {
    valueStr = new Intl.NumberFormat(navigator.locale, {
      notation: "compact",
      maximumSignificantDigits: 4,
    }).format(count);
  } else {
    valueStr = new Intl.NumberFormat().format(count);
  }
  blockedRequestCount.textContent = valueStr;
});

function updateBlockingLevelUI(level) {
  var radio = trackingLevelOptions[level];
  radio.checked = true;

  if (level === 0) {
    blockingExceptionsContainer.hidden = true;
  } else {
    blockingExceptionsContainer.hidden = false;
    radio.parentNode.appendChild(blockingExceptionsContainer);
  }

  if (
    document.querySelector("#tracking-level-container .setting-option.selected")
  ) {
    document
      .querySelector("#tracking-level-container .setting-option.selected")
      .classList.remove("selected");
  }
  radio.parentNode.classList.add("selected");
}

function changeBlockingLevelSetting(level) {
  settings.get("filtering", function (value) {
    if (!value) {
      value = {};
    }
    value.blockingLevel = level;
    settings.set("filtering", value);
    updateBlockingLevelUI(level);
  });
}

function setExceptionInputSize() {
  blockingExceptionsInput.style.height =
    blockingExceptionsInput.scrollHeight + 2 + "px";
}

settings.get("filtering", function (value) {
  // migrate from old settings (<v1.9.0)
  if (value && typeof value.trackers === "boolean") {
    if (value.trackers === true) {
      value.blockingLevel = 2;
    } else if (value.trackers === false) {
      value.blockingLevel = 0;
    }
    delete value.trackers;
    settings.set("filtering", value);
  }

  if (value && value.blockingLevel !== undefined) {
    updateBlockingLevelUI(value.blockingLevel);
  } else {
    updateBlockingLevelUI(1);
  }

  if (value && value.exceptionDomains && value.exceptionDomains.length > 0) {
    blockingExceptionsInput.value = value.exceptionDomains.join(", ") + ", ";
    setExceptionInputSize();
  }
});

trackingLevelOptions.forEach(function (item, idx) {
  item.addEventListener("change", function () {
    changeBlockingLevelSetting(idx);
  });
});

blockingExceptionsInput.addEventListener("input", function () {
  setExceptionInputSize();

  // remove protocols because of https://github.com/minbrowser/min/issues/1428
  var newValue = this.value
    .split(",")
    .map((i) => i.trim().replace("http://", "").replace("https://", ""))
    .filter((i) => !!i);

  settings.get("filtering", function (value) {
    if (!value) {
      value = {};
    }
    value.exceptionDomains = newValue;
    settings.set("filtering", value);
  });
});

/* content type settings */

var contentTypes = {
  // humanReadableName: contentType
  scripts: "script",
  images: "image",
};

// used for showing localized strings
var contentTypeSettingNames = {
  scripts: "settingsBlockScriptsToggle",
  images: "settingsBlockImagesToggle",
};

for (var contentType in contentTypes) {
  (function (contentType) {
    settings.get("filtering", function (value) {
      // create the settings section for blocking each content type

      var section = document.createElement("div");
      section.classList.add("setting-section");

      var id = "checkbox-block-" + contentTypes[contentType];

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = id;

      if (value && value.contentTypes) {
        checkbox.checked =
          value.contentTypes.indexOf(contentTypes[contentType]) != -1;
      }

      var label = document.createElement("label");
      label.setAttribute("for", id);
      label.textContent = l(contentTypeSettingNames[contentType]);

      section.appendChild(checkbox);
      section.appendChild(label);

      contentTypeBlockingContainer.appendChild(section);

      checkbox.addEventListener("change", function (e) {
        settings.get("filtering", function (value) {
          if (!value) {
            value = {};
          }
          if (!value.contentTypes) {
            value.contentTypes = [];
          }

          if (e.target.checked) {
            // add the item to the array
            value.contentTypes.push(contentTypes[contentType]);
          } else {
            // remove the item from the array
            var idx = value.contentTypes.indexOf(contentTypes[contentType]);
            value.contentTypes.splice(idx, 1);
          }

          settings.set("filtering", value);
        });
      });
    });
  })(contentType);
}

/* dark mode setting */
var darkModeNever = document.getElementById("dark-mode-never");
var darkModeNight = document.getElementById("dark-mode-night");
var darkModeAlways = document.getElementById("dark-mode-always");
var darkModeSystem = document.getElementById("dark-mode-system");

// -1 - off ; 0 - auto ; 1 - on
settings.get("darkMode", function (value) {
  darkModeNever.checked = value === -1;
  darkModeNight.checked = value === 0;
  darkModeAlways.checked = value === 1 || value === true;
  darkModeSystem.checked =
    value === 2 || value === undefined || value === false;
});

darkModeNever.addEventListener("change", function (e) {
  if (this.checked) {
    settings.set("darkMode", -1);
  }
});
darkModeNight.addEventListener("change", function (e) {
  if (this.checked) {
    settings.set("darkMode", 0);
  }
});
darkModeAlways.addEventListener("change", function (e) {
  if (this.checked) {
    settings.set("darkMode", 1);
  }
});
darkModeSystem.addEventListener("change", function (e) {
  if (this.checked) {
    settings.set("darkMode", 2);
  }
});

/* site theme setting */

settings.get("siteTheme", function (value) {
  if (value === true || value === undefined) {
    siteThemeCheckbox.checked = true;
  } else {
    siteThemeCheckbox.checked = false;
  }
});

siteThemeCheckbox.addEventListener("change", function (e) {
  settings.set("siteTheme", this.checked);
});

/* navbar color customization settings */

var navbarColorPresets = document.getElementById("navbar-color-presets");
var navbarCustomColor = document.getElementById("navbar-custom-color");
var navbarOpacitySlider = document.getElementById("navbar-opacity-slider");
var navbarOpacityValue = document.getElementById("navbar-opacity-value");
var navbarColorReset = document.getElementById("navbar-color-reset");

function updateColorSwatchSelection(selectedColor) {
  var swatches = navbarColorPresets.querySelectorAll(".color-swatch");
  swatches.forEach(function (swatch) {
    var swatchColor = swatch.getAttribute("data-color");
    if (
      swatchColor &&
      swatchColor.toLowerCase() === selectedColor.toLowerCase()
    ) {
      swatch.classList.add("selected");
    } else {
      swatch.classList.remove("selected");
    }
  });
}

function applyNavbarColorPreview(color, opacity) {
  // Send message to main browser window to apply color
  postMessage({
    message: "navbarColorChanged",
    color: color,
    opacity: opacity,
  });
}

// Initialize color swatches with their colors
if (navbarColorPresets) {
  var swatches = navbarColorPresets.querySelectorAll(".color-swatch");
  swatches.forEach(function (swatch) {
    var color = swatch.getAttribute("data-color");
    if (color) {
      swatch.style.backgroundColor = color;
    }
  });
}

// Load saved navbar color
settings.get("navbarColor", function (value) {
  if (value) {
    navbarCustomColor.value = value;
    updateColorSwatchSelection(value);
  }
});

// Load saved navbar opacity
settings.get("navbarOpacity", function (value) {
  var opacity = value !== undefined ? value : 100;
  navbarOpacitySlider.value = opacity;
  navbarOpacityValue.textContent = opacity + "%";
});

// Preset swatch click handlers
if (navbarColorPresets) {
  navbarColorPresets.addEventListener("click", function (e) {
    var swatch = e.target.closest(".color-swatch");
    if (swatch) {
      var color = swatch.getAttribute("data-color");
      if (color) {
        settings.set("navbarColor", color);
        navbarCustomColor.value = color;
        updateColorSwatchSelection(color);

        settings.get("navbarOpacity", function (opacity) {
          applyNavbarColorPreview(color, opacity !== undefined ? opacity : 100);
        });
      }
    }
  });
}

// Custom color picker change handler
navbarCustomColor.addEventListener("input", function (e) {
  var color = this.value;
  settings.set("navbarColor", color);
  updateColorSwatchSelection(color);

  settings.get("navbarOpacity", function (opacity) {
    applyNavbarColorPreview(color, opacity !== undefined ? opacity : 100);
  });
});

// Opacity slider change handler with live preview
navbarOpacitySlider.addEventListener("input", function (e) {
  var opacity = parseInt(this.value);
  navbarOpacityValue.textContent = opacity + "%";
  settings.set("navbarOpacity", opacity);

  settings.get("navbarColor", function (color) {
    if (color) {
      applyNavbarColorPreview(color, opacity);
    }
  });
});

// Reset button handler
navbarColorReset.addEventListener("click", function (e) {
  settings.set("navbarColor", null);
  settings.set("navbarOpacity", 100);

  navbarCustomColor.value = "#4A90D9";
  navbarOpacitySlider.value = 100;
  navbarOpacityValue.textContent = "100%";
  updateColorSwatchSelection("");

  applyNavbarColorPreview(null, 100);
});

/* startup settings */

var startupSettingInput = document.getElementById("startup-options");

settings.get("startupTabOption", function (value = 2) {
  startupSettingInput.value = value;
});

startupSettingInput.addEventListener("change", function () {
  settings.set("startupTabOption", parseInt(this.value));
});

/* new window settings */

var newWindowSettingInput = document.getElementById("new-window-options");

settings.get("newWindowOption", function (value = 1) {
  newWindowSettingInput.value = value;
});

newWindowSettingInput.addEventListener("change", function () {
  settings.set("newWindowOption", parseInt(this.value));
});

/* userscripts setting */

settings.get("userscriptsEnabled", function (value) {
  if (value === true) {
    userscriptsCheckbox.checked = true;
    userscriptsShowDirectorySection.hidden = false;
  }
});

userscriptsCheckbox.addEventListener("change", function (e) {
  settings.set("userscriptsEnabled", this.checked);
  userscriptsShowDirectorySection.hidden = !this.checked;
});

userscriptsShowDirectorySection
  .getElementsByTagName("a")[0]
  .addEventListener("click", function () {
    postMessage({ message: "showUserscriptDirectory" });
  });

/* show divider between tabs setting */

settings.get("showDividerBetweenTabs", function (value) {
  if (value === true) {
    showDividerCheckbox.checked = true;
  }
});

showDividerCheckbox.addEventListener("change", function (e) {
  settings.set("showDividerBetweenTabs", this.checked);
});

/* language setting*/

var languagePicker = document.getElementById("setting-language-picker");

for (var language in languages) {
  //from localization.build.js
  var item = document.createElement("option");
  item.textContent = languages[language].name;
  item.value = languages[language].identifier;
  languagePicker.appendChild(item);
}

languagePicker.value = getCurrentLanguage();

languagePicker.addEventListener("change", function () {
  settings.set("userSelectedLanguage", this.value);
  showRestartRequiredBanner();
});

/* separate titlebar setting */

settings.get("useSeparateTitlebar", function (value) {
  if (value === true) {
    separateTitlebarCheckbox.checked = true;
  }
});

separateTitlebarCheckbox.addEventListener("change", function (e) {
  settings.set("useSeparateTitlebar", this.checked);
  showRestartRequiredBanner();
});

/* tabs in foreground setting */

settings.get("openTabsInForeground", function (value) {
  if (value === true) {
    openTabsInForegroundCheckbox.checked = true;
  }
});

openTabsInForegroundCheckbox.addEventListener("change", function (e) {
  settings.set("openTabsInForeground", this.checked);
});

/* media autoplay setting */

settings.get("enableAutoplay", function (value) {
  autoPlayCheckbox.checked = value;
});

autoPlayCheckbox.addEventListener("change", function (e) {
  settings.set("enableAutoplay", this.checked);
});

/* user agent settting */

settings.get("customUserAgent", function (value) {
  if (value) {
    userAgentCheckbox.checked = true;
    userAgentInput.style.visibility = "visible";
    userAgentInput.value = value;
  }
});

userAgentCheckbox.addEventListener("change", function (e) {
  if (this.checked) {
    userAgentInput.style.visibility = "visible";
  } else {
    settings.set("customUserAgent", null);
    userAgentInput.style.visibility = "hidden";
    showRestartRequiredBanner();
  }
});

userAgentInput.addEventListener("input", function (e) {
  const value = this.value.slice(0, 200);
  if (value !== this.value) {
    this.value = value;
  }
  if (value) {
    settings.set("customUserAgent", value);
  } else {
    settings.set("customUserAgent", null);
  }
  showRestartRequiredBanner();
});

/* update notifications setting */

var updateNotificationsCheckbox = document.getElementById(
  "checkbox-update-notifications"
);

settings.get("updateNotificationsEnabled", function (value) {
  if (value === false) {
    updateNotificationsCheckbox.checked = false;
  } else {
    updateNotificationsCheckbox.checked = true;
  }
});

updateNotificationsCheckbox.addEventListener("change", function (e) {
  settings.set("updateNotificationsEnabled", this.checked);
});

/* usage statistics setting */

var usageStatisticsCheckbox = document.getElementById(
  "checkbox-usage-statistics"
);

settings.get("collectUsageStats", function (value) {
  if (value === false) {
    usageStatisticsCheckbox.checked = false;
  } else {
    usageStatisticsCheckbox.checked = true;
  }
});

usageStatisticsCheckbox.addEventListener("change", function (e) {
  settings.set("collectUsageStats", this.checked);
});

/* default search engine setting */

var searchEngineDropdown = document.getElementById("default-search-engine");
var searchEngineInput = document.getElementById("custom-search-engine");

searchEngineInput.setAttribute(
  "placeholder",
  l("customSearchEngineDescription")
);

settings.onLoad(function () {
  if (currentSearchEngine.custom) {
    searchEngineInput.hidden = false;
    searchEngineInput.value = currentSearchEngine.searchURL;
  }

  for (var searchEngine in searchEngines) {
    var item = document.createElement("option");
    item.textContent = searchEngines[searchEngine].name;

    if (searchEngines[searchEngine].name == currentSearchEngine.name) {
      item.setAttribute("selected", "true");
    }

    searchEngineDropdown.appendChild(item);
  }

  // add custom option
  item = document.createElement("option");
  item.textContent = "custom";
  if (currentSearchEngine.custom) {
    item.setAttribute("selected", "true");
  }
  searchEngineDropdown.appendChild(item);
});

searchEngineDropdown.addEventListener("change", function (e) {
  if (this.value === "custom") {
    searchEngineInput.hidden = false;
  } else {
    searchEngineInput.hidden = true;
    settings.set("searchEngine", { name: this.value });
  }
});

searchEngineInput.addEventListener("input", function (e) {
  settings.set("searchEngine", { url: this.value });
});

/* key map settings */

settings.get("keyMap", function (keyMapSettings) {
  var keyMap = userKeyMap(keyMapSettings);

  var keyMapList = document.getElementById("key-map-list");

  Object.keys(keyMap).forEach(function (action) {
    var li = createKeyMapListItem(action, keyMap);
    keyMapList.appendChild(li);
  });
});

function formatCamelCase(text) {
  var result = text.replace(/([a-z])([A-Z])/g, "$1 $2");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function createKeyMapListItem(action, keyMap) {
  var li = document.createElement("li");
  var label = document.createElement("label");
  var input = document.createElement("input");
  label.innerText = formatCamelCase(action);
  label.htmlFor = action;

  input.type = "text";
  input.id = input.name = action;
  input.value = formatKeyValue(keyMap[action]);
  input.addEventListener("input", onKeyMapChange);

  li.appendChild(label);
  li.appendChild(input);

  return li;
}

function formatKeyValue(value) {
  // multiple shortcuts should be separated by commas
  if (value instanceof Array) {
    value = value.join(", ");
  }
  // use either command or ctrl depending on the platform
  if (navigator.platform === "MacIntel") {
    value = value.replace(/\bmod\b/g, "command");
  } else {
    value = value.replace(/\bmod\b/g, "ctrl");
    value = value.replace(/\boption\b/g, "alt");
  }
  if (navigator.platform === "Win32") {
    value = value.replace(/\bsuper\b/g, "win");
  }
  return value;
}

function parseKeyInput(input) {
  // input may be a single mapping or multiple mappings comma separated.
  var parsed = input.toLowerCase().split(",");
  parsed = parsed.map(function (e) {
    return e.trim();
  });
  // Remove empty
  parsed = parsed.filter(Boolean);
  // convert key names back to generic equivalents
  parsed = parsed.map(function (e) {
    if (navigator.platform === "MacIntel") {
      e = e.replace(/\b(command)|(cmd)\b/g, "mod");
    } else {
      e = e.replace(/\b(control)|(ctrl)\b/g, "mod");
      e = e.replace(/\balt\b/g, "option");
      e = e.replace(/\bwin\b/g, "super");
    }
    return e;
  });
  return parsed.length > 1 ? parsed : parsed[0];
}

function onKeyMapChange(e) {
  var action = this.name;
  var newValue = this.value;

  settings.get("keyMap", function (keyMapSettings) {
    if (!keyMapSettings) {
      keyMapSettings = {};
    }

    keyMapSettings[action] = parseKeyInput(newValue);
    settings.set("keyMap", keyMapSettings);
    showRestartRequiredBanner();
  });
}

/* Password auto-fill settings  */

var passwordManagersDropdown = document.getElementById(
  "selected-password-manager"
);
for (var manager in passwordManagers) {
  var item = document.createElement("option");
  item.textContent = passwordManagers[manager].name;
  passwordManagersDropdown.appendChild(item);
}

settings.listen("passwordManager", function (value) {
  passwordManagersDropdown.value = currentPasswordManager.name;
});

passwordManagersDropdown.addEventListener("change", function (e) {
  if (this.value === "none") {
    settings.set("passwordManager", { name: "none" });
  } else {
    settings.set("passwordManager", { name: this.value });
  }
});

var keychainViewLink = document.getElementById("keychain-view-link");

keychainViewLink.addEventListener("click", function () {
  postMessage({ message: "showCredentialList" });
});

settings.listen("passwordManager", function (value) {
  keychainViewLink.hidden = !(
    currentPasswordManager.name === "Built-in password manager"
  );
});

/* proxy settings */

const proxyTypeInput = document.getElementById("selected-proxy-type");
const proxyInputs = Array.from(
  document.querySelectorAll("#proxy-settings-container input")
);

const toggleProxyOptions = (proxyType) => {
  document.getElementById("manual-proxy-section").hidden = proxyType != 1;
  document.getElementById("pac-option").hidden = proxyType != 2;
};

const setProxy = (key, value) => {
  settings.get("proxy", (proxy = {}) => {
    proxy[key] = value;
    settings.set("proxy", proxy);
  });
};

settings.get("proxy", (proxy = {}) => {
  toggleProxyOptions(proxy.type);

  proxyTypeInput.options.selectedIndex = proxy.type || 0;
  proxyInputs.forEach((item) => (item.value = proxy[item.name] || ""));
});

proxyTypeInput.addEventListener("change", (e) => {
  const proxyType = e.target.options.selectedIndex;
  setProxy("type", proxyType);
  toggleProxyOptions(proxyType);
});

proxyInputs.forEach((item) =>
  item.addEventListener("change", (e) =>
    setProxy(e.target.name, e.target.value)
  )
);

settings.get("customBangs", (value) => {
  const bangslist = document.getElementById("custom-bangs");

  if (value) {
    value.forEach(function (bang) {
      bangslist.appendChild(
        createBang(bang.phrase, bang.snippet, bang.redirect)
      );
    });
  }
});

document
  .getElementById("add-custom-bang")
  .addEventListener("click", function () {
    const bangslist = document.getElementById("custom-bangs");
    const newListItem = createBang();
    bangslist.appendChild(newListItem);
    document.body.scrollBy(
      0,
      Math.round(newListItem.getBoundingClientRect().height)
    );
  });

function createBang(bang, snippet, redirect) {
  var li = document.createElement("li");
  var bangInput = document.createElement("input");
  var snippetInput = document.createElement("input");
  var redirectInput = document.createElement("input");
  var xButton = document.createElement("button");
  var current = {
    phrase: bang ?? "",
    snippet: snippet ?? "",
    redirect: redirect ?? "",
  };
  function update(key, input) {
    settings.get("customBangs", function (d) {
      const filtered = d
        ? d.filter(
            (bang) =>
              bang.phrase !== current.phrase &&
              (key !== "phrase" || bang.phrase !== input.value)
          )
        : [];
      filtered.push({
        phrase: bangInput.value,
        snippet: snippetInput.value,
        redirect: redirectInput.value,
      });
      settings.set("customBangs", filtered);
      current[key] = input.value;
    });
  }

  bangInput.type = "text";
  snippetInput.type = "text";
  redirectInput.type = "text";
  bangInput.value = bang ?? "";
  snippetInput.value = snippet ?? "";
  redirectInput.value = redirect ?? "";
  xButton.className = "i carbon:close custom-bang-delete-button";

  bangInput.placeholder = l("settingsCustomBangsPhrase");
  snippetInput.placeholder = l("settingsCustomBangsSnippet");
  redirectInput.placeholder = l("settingsCustomBangsRedirect");
  xButton.addEventListener("click", function () {
    li.remove();
    settings.get("customBangs", (d) => {
      settings.set(
        "customBangs",
        d.filter((bang) => bang.phrase !== bangInput.value)
      );
    });
    showRestartRequiredBanner();
  });

  bangInput.addEventListener("change", function () {
    if (this.value.startsWith("!")) {
      this.value = this.value.slice(1);
    }
    update("phrase", bangInput);
    showRestartRequiredBanner();
  });
  snippetInput.addEventListener("change", function () {
    update("snippet", snippetInput);
    showRestartRequiredBanner();
  });
  redirectInput.addEventListener("change", function () {
    update("redirect", redirectInput);
    showRestartRequiredBanner();
  });

  li.appendChild(bangInput);
  li.appendChild(snippetInput);
  li.appendChild(redirectInput);
  li.appendChild(xButton);

  return li;
}

/* site permissions management */

const permissionsEmptyState = document.getElementById(
  "permissions-empty-state"
);
const permissionsListContainer = document.getElementById(
  "permissions-list-container"
);
const permissionsList = document.getElementById("permissions-list");
const permissionsSearch = document.getElementById("permissions-search");
const permissionsClearAllBtn = document.getElementById("permissions-clear-all");

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
};

const permissionNames = {
  "clipboard-read": "Clipboard Read",
  "clipboard-write": "Clipboard Write",
  geolocation: "Location",
  notifications: "Notifications",
  camera: "Camera",
  microphone: "Microphone",
  media: "Camera & Microphone",
  pointerLock: "Pointer Lock",
};

function loadPermissions() {
  // Request permissions from main process
  const { ipcRenderer } = require("electron");
  const permissions = ipcRenderer.sendSync("permission:getAll");

  renderPermissionsList(permissions);
}

function renderPermissionsList(permissions) {
  const sites = Object.keys(permissions);

  if (sites.length === 0) {
    permissionsEmptyState.hidden = false;
    permissionsListContainer.hidden = true;
    return;
  }

  permissionsEmptyState.hidden = true;
  permissionsListContainer.hidden = false;

  permissionsList.innerHTML = "";

  sites.forEach(function (site) {
    const siteEl = createSiteElement(site, permissions[site]);
    permissionsList.appendChild(siteEl);
  });
}

function createSiteElement(site, sitePermissions) {
  const siteDiv = document.createElement("div");
  siteDiv.className = "permission-site-item";
  siteDiv.setAttribute("data-site", site);

  const headerDiv = document.createElement("div");
  headerDiv.className = "permission-site-header";

  const domainSpan = document.createElement("span");
  domainSpan.className = "permission-site-domain";
  domainSpan.textContent = site;

  const removeSiteBtn = document.createElement("button");
  removeSiteBtn.className = "permission-remove-site-btn";
  removeSiteBtn.textContent = l("settingsSitePermissionsRemoveAll");
  removeSiteBtn.addEventListener("click", function () {
    removeSitePermissions(site);
  });

  headerDiv.appendChild(domainSpan);
  headerDiv.appendChild(removeSiteBtn);
  siteDiv.appendChild(headerDiv);

  // Add permission items
  Object.keys(sitePermissions).forEach(function (permissionType) {
    const decision = sitePermissions[permissionType];
    const permissionEl = createPermissionElement(
      site,
      permissionType,
      decision
    );
    siteDiv.appendChild(permissionEl);
  });

  return siteDiv;
}

function createPermissionElement(site, permissionType, decision) {
  const itemDiv = document.createElement("div");
  itemDiv.className = "permission-item";
  itemDiv.setAttribute("data-permission", permissionType);

  const nameDiv = document.createElement("div");
  nameDiv.className = "permission-name";

  const iconSpan = document.createElement("span");
  iconSpan.className = "permission-icon-small";
  iconSpan.innerHTML = permissionIcons[permissionType] || "";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = permissionNames[permissionType] || permissionType;

  nameDiv.appendChild(iconSpan);
  nameDiv.appendChild(nameSpan);

  const statusDiv = document.createElement("div");
  statusDiv.className = "permission-status";

  const statusSpan = document.createElement("span");
  statusSpan.className =
    decision === "granted"
      ? "permission-status-granted"
      : "permission-status-denied";
  statusSpan.textContent =
    decision === "granted"
      ? l("settingsSitePermissionsGranted")
      : l("settingsSitePermissionsDenied");

  const removeBtn = document.createElement("button");
  removeBtn.className = "permission-remove-btn";
  removeBtn.textContent = l("settingsSitePermissionsRemove");
  removeBtn.addEventListener("click", function () {
    removePermission(site, permissionType);
  });

  statusDiv.appendChild(statusSpan);
  statusDiv.appendChild(removeBtn);

  itemDiv.appendChild(nameDiv);
  itemDiv.appendChild(statusDiv);

  return itemDiv;
}

function removePermission(site, permissionType) {
  const { ipcRenderer } = require("electron");
  ipcRenderer.send("permission:clear", {
    site: site,
    permissionType: permissionType,
  });

  // Reload permissions
  setTimeout(loadPermissions, 100);
}

function removeSitePermissions(site) {
  const { ipcRenderer } = require("electron");
  ipcRenderer.send("permission:clear", { site: site });

  // Reload permissions
  setTimeout(loadPermissions, 100);
}

function clearAllPermissions() {
  const { ipcRenderer } = require("electron");
  ipcRenderer.send("permission:clear", {});

  // Reload permissions
  setTimeout(loadPermissions, 100);
}

// Search functionality
permissionsSearch.addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const siteItems = permissionsList.querySelectorAll(".permission-site-item");

  siteItems.forEach(function (item) {
    const site = item.getAttribute("data-site").toLowerCase();
    if (site.includes(searchTerm)) {
      item.hidden = false;
    } else {
      item.hidden = true;
    }
  });
});

// Clear all button
permissionsClearAllBtn.addEventListener("click", function () {
  if (confirm("Are you sure you want to clear all site permissions?")) {
    clearAllPermissions();
  }
});

// Load permissions on page load
loadPermissions();
