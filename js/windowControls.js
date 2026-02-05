var settings = require("util/settings/settings.js");

function initialize() {
  if (settings.get("useSeparateTitlebar") === true) {
    document.body.classList.add("separate-titlebar");
  }

  var windowIsMaximized = false;
  var windowIsFullscreen = false;

  // Traffic light buttons (unified for all platforms)
  var trafficClose = document.getElementById("traffic-close");
  var trafficMinimize = document.getElementById("traffic-minimize");
  var trafficMaximize = document.getElementById("traffic-maximize");

  // Bind click handlers for traffic light buttons
  if (trafficClose) {
    trafficClose.addEventListener("click", function (e) {
      e.stopPropagation();
      ipc.invoke("close");
    });
  }

  if (trafficMinimize) {
    trafficMinimize.addEventListener("click", function (e) {
      e.stopPropagation();
      ipc.invoke("minimize");
    });
  }

  if (trafficMaximize) {
    trafficMaximize.addEventListener("click", function (e) {
      e.stopPropagation();
      if (windowIsFullscreen) {
        ipc.invoke("setFullScreen", false);
      } else if (windowIsMaximized) {
        ipc.invoke("unmaximize");
      } else {
        ipc.invoke("maximize");
      }
    });
  }

  // Listen for window state changes
  ipc.on("maximize", function (e) {
    windowIsMaximized = true;
    document.body.classList.add("maximized");
  });

  ipc.on("unmaximize", function (e) {
    windowIsMaximized = false;
    document.body.classList.remove("maximized");
  });

  ipc.on("enter-full-screen", function (e) {
    windowIsFullscreen = true;
    document.body.classList.add("fullscreen");
  });

  ipc.on("leave-full-screen", function (e) {
    windowIsFullscreen = false;
    document.body.classList.remove("fullscreen");
  });
}

module.exports = { initialize };
