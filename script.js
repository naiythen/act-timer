let timerInterval;
let remainingTime = 0;
let isRunning = false;
let currentSection = "";
let totalQuestions = 0;
let initialTime = 0;
let currentFullTestSection = 0;
const fullTestSections = [
  {
    name: "English",
    time: 45,
    questions: 75,
  },
  {
    name: "Math",
    time: 60,
    questions: 60,
  },
  {
    name: "Reading",
    time: 35,
    questions: 40,
  },
  {
    name: "Science",
    time: 35,
    questions: 40,
  },
];

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName.trim() === name) {
      return cookieValue;
    }
  }
  return null;
}

function setCookie(name, value, days = 365) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function setTheme(color) {
  setCookie("theme", color);
  applyTheme(color);
}

function applyTheme(color) {
  let themeColor = color;
  if (!themeColor) {
    themeColor = getCookie("theme") || "#3498db";
  }

  console.log("applyTheme - themeColor:", themeColor);
  if (!themeColor) {
    console.error("applyTheme - themeColor is still falsy after fallback!");
    return;
  }
  document.documentElement.style.setProperty(
    "--theme-color-dark",
    getDarkerShade(themeColor, 0.3)
  );
  document.documentElement.style.setProperty(
    "--theme-color-light",
    getLighterShade(themeColor, 0.1)
  );
  document.documentElement.style.setProperty("--primary-color", themeColor);
  document.documentElement.style.setProperty(
    "--primary-hover-color",
    getDarkerShade(themeColor, 0.2)
  );
  document.documentElement.style.setProperty(
    "--progress-bar-start",
    themeColor
  );
  document.documentElement.style.setProperty(
    "--progress-bar-end",
    getLighterShade(themeColor, 0.3)
  );

  document.documentElement.style.setProperty(
    "--back-arrow-start",
    getBackArrowStartColor(themeColor)
  );
  document.documentElement.style.setProperty(
    "--back-arrow-end",
    getBackArrowEndColor(themeColor)
  );

  const rgb = hexToRgb(themeColor);
  document.documentElement.style.setProperty(
    "--primary-rgb",
    `${rgb.r}, ${rgb.g}, ${rgb.b}`
  );
}

function getBackArrowStartColor(themeColor) {
  const rgb = hexToRgb(themeColor);
  const isDarkTheme = (rgb.r + rgb.g + rgb.b) / 3 < 128;
  return isDarkTheme ? "#e63737" : "#ff3b3b";
}

function getBackArrowEndColor(themeColor) {
  const rgb = hexToRgb(themeColor);
  const isDarkTheme = (rgb.r + rgb.g + rgb.b) / 3 < 128;
  return isDarkTheme ? "#cc3333" : "#e63737";
}

function getDarkerShade(color, factor) {
  const rgb = hexToRgb(color);
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;

  r = Math.max(0, Math.round(r * (1 - factor)));
  g = Math.max(0, Math.round(g * (1 - factor)));
  b = Math.max(0, Math.round(b * (1 - factor)));
  return rgbToHex(r, g, b);
}

function getLighterShade(color, factor) {
  const rgb = hexToRgb(color);
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;
  r = Math.min(255, Math.round(r + (255 - r) * factor));
  g = Math.min(255, Math.round(g + (255 - g) * factor));
  b = Math.min(255, Math.round(b + (255 - b) * factor));
  return rgbToHex(r, g, b);
}

function hexToRgb(hex) {
  if (typeof hex !== "string" || !hex) {
    console.error("hexToRgb - Invalid hex value:", hex);
    return { r: 0, g: 0, b: 0 };
  }
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return {
    r: r,
    g: g,
    b: b,
  };
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  applyTheme();
  if (
    !getCookie("speed") ||
    getCookie("speed") === null ||
    getCookie("speed") === undefined
  ) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("speedSelection").style.display = "block";
  }

  initializeSettingsPage();
});

function setSpeedPreference(speedValue) {
  console.log("setSpeedPreference called with speedValue:", speedValue);
  setCookie("speed", speedValue);
  document.getElementById("speedSelection").style.display = "none";
  document.getElementById("menu").style.display = "flex";
  if (document.getElementById("settingsPage").style.display === "block") {
    populatePaceSettings();
  }

  const confirmation = document.createElement("div");
  confirmation.textContent = "⏱️ Pace preference saved!";
  confirmation.style.position = "absolute";
  confirmation.style.top = "auto";
  confirmation.style.bottom = "20px";
  confirmation.style.right = "20px";
  confirmation.style.background = "#3399ff";
  confirmation.style.color = "white";
  confirmation.style.padding = "15px 25px";
  confirmation.style.borderRadius = "8px";
  confirmation.style.boxShadow = "0 4px 15px rgba(51, 153, 255, 0.3)";
  confirmation.style.zIndex = "1002";
  confirmation.style.fontWeight = "500";
  document.querySelector(".container").appendChild(confirmation);
  setTimeout(() => confirmation.remove(), 2000);
}

function setPacePreference(speedValue) {
  console.log("setPacePreference called with speedValue:", speedValue);
  setCookie("speed", speedValue);
  populatePaceSettings();

  const confirmation = document.createElement("div");
  confirmation.textContent = "⏱️ Pace preference saved!";
  confirmation.style.position = "absolute";
  confirmation.style.top = "auto";
  confirmation.style.bottom = "20px";
  confirmation.style.right = "20px";
  confirmation.style.background = "#3399ff";
  confirmation.style.color = "white";
  confirmation.style.padding = "15px 25px";
  confirmation.style.borderRadius = "8px";
  confirmation.style.boxShadow = "0 4px 15px rgba(51, 153, 255, 0.3)";
  confirmation.style.zIndex = "1002";
  confirmation.style.fontWeight = "500";
  document.querySelector(".container").appendChild(confirmation);
  setTimeout(() => confirmation.remove(), 2000);
}

function startTimer(sectionName, durationMinutes, numQuestions) {
  currentSection = sectionName;
  showTimerScreen(sectionName);
  remainingTime = durationMinutes * 60;
  initialTime = remainingTime;
  totalQuestions = numQuestions;
  isRunning = true;
  updateDisplay();
  updateProgressBar();
  updateQuestionGuidance();
  startInterval();
}

function showTimerScreen(sectionName) {
  document.getElementById("menu").style.display = "none";
  document.getElementById("customInput").style.display = "none";
  document.getElementById("timerScreen").style.display = "block";
  document.getElementById("backArrow").style.display = "flex";
  document.getElementById("settingsPage").style.display = "none";
  document.getElementById("speedSelection").style.display = "none";
  document.getElementById("sectionTitle").textContent = sectionName;
  document.getElementById("fullscreenButton").style.display = "none";
}

function updateDisplay() {
  let minutes = Math.floor(remainingTime / 60);
  let seconds = remainingTime % 60;
  document.getElementById("timeDisplay").textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function updateProgressBar() {
  const progressBar = document.getElementById("progressBar");
  const percentComplete = ((initialTime - remainingTime) / initialTime) * 100;
  progressBar.style.width = `${percentComplete}%`;
}

function updateQuestionGuidance() {
  const questionCounter = document.getElementById("questionCounter");
  if (totalQuestions === 0) {
    questionCounter.style.display = "none";
    return;
  }

  const adjustedTime = initialTime; // No pace reduction for custom timer
  const timePerQuestion = adjustedTime / totalQuestions;
  const elapsedTime = initialTime - remainingTime;

  let questionsShouldComplete = Math.max(1, Math.ceil(elapsedTime / timePerQuestion));
  questionsShouldComplete = Math.min(questionsShouldComplete, totalQuestions);

  if (!questionCounter.querySelector(".counter-container")) {
    const container = document.createElement("div");
    container.className = "counter-container";
    const textSpan = document.createElement("span");
    textSpan.className = "question-text";
    textSpan.textContent = `You should be on Question: ${questionsShouldComplete}/${totalQuestions}`;
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "eye-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle visibility");
    const openEyeSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    openEyeSVG.setAttribute("viewBox", "0 0 24 24");
    openEyeSVG.setAttribute("stroke-linecap", "round");
    openEyeSVG.setAttribute("stroke-linejoin", "round");
    openEyeSVG.innerHTML =
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    const closedEyeSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    closedEyeSVG.setAttribute("viewBox", "0 0 24 24");
    closedEyeSVG.setAttribute("stroke-linecap", "round");
    closedEyeSVG.setAttribute("stroke-linejoin", "round");
    closedEyeSVG.innerHTML =
      '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    toggleBtn.appendChild(openEyeSVG);
    toggleBtn.addEventListener("click", function (e) {
      e.preventDefault();
      container.classList.toggle("blurred");
      toggleBtn.innerHTML = "";
      toggleBtn.appendChild(
        container.classList.contains("blurred") ? closedEyeSVG : openEyeSVG
      );
    });
    container.appendChild(textSpan);
    container.appendChild(toggleBtn);
    questionCounter.innerHTML = "";
    questionCounter.appendChild(container);
  } else {
    const textSpan = questionCounter.querySelector(".question-text");
    textSpan.textContent = `You should be on Question: ${questionsShouldComplete}/${totalQuestions}`;
  }
}

function startInterval() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (isRunning && remainingTime > 0) {
      remainingTime--;
      updateDisplay();
      updateProgressBar();
      updateQuestionGuidance();
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        remainingTime = 0;
        updateDisplay();
        updateProgressBar();
        updateQuestionGuidance();
        isRunning = false;
        if (currentFullTestSection > 0 && currentFullTestSection < fullTestSections.length) {
          showNextSectionButton();
        }
      }
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
}

function resumeTimer() {
  if (!isRunning && remainingTime > 0) {
    isRunning = true;
    startInterval();
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  remainingTime = initialTime;
  isRunning = false;
  updateDisplay();
  updateProgressBar();
  updateQuestionGuidance();
  hideNextSectionButton();
}

function showNextSectionButton() {
  document.getElementById("nextSectionContainer").style.display = "block";
}

function hideNextSectionButton() {
  document.getElementById("nextSectionContainer").style.display = "none";
}

function startFullTest() {
  currentFullTestSection = 0;
  startNextFullTestSection();
}

function startNextFullTestSection() {
  if (currentFullTestSection < fullTestSections.length) {
    const section = fullTestSections[currentFullTestSection];
    startTimer(
      `ACT FULL Test - ${section.name}`,
      section.time,
      section.questions
    );
    currentFullTestSection++;
  }
}

function nextSection() {
  resetTimer();
  hideNextSectionButton();
  startNextFullTestSection();
}

function showCustomInput() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("customInput").style.display = "block";
  document.getElementById("settingsPage").style.display = "none";
  document.getElementById("speedSelection").style.display = "none";
}

function startCustomTimer() {
  const customTime = parseInt(document.getElementById("customTime").value);
  const customQuestions = parseInt(
    document.getElementById("customQuestions").value
  );
  if (
    isNaN(customTime) ||
    isNaN(customQuestions) ||
    customTime <= 0 ||
    customQuestions <= 0
  ) {
    alert("Please enter valid time and number of questions.");
    return;
  }

  const speedPreference = parseInt(getCookie("speed")) || 0;
  let paceReductionMinutes = 0;
  if (speedPreference === 1) {
    paceReductionMinutes = 5;
  } else if (speedPreference === 2) {
    paceReductionMinutes = 10;
  }

  if (customTime <= paceReductionMinutes && paceReductionMinutes > 0) {
    const notification = document.createElement("div");
    notification.textContent = "There is no pacing on custom timers";
    notification.style.position = "absolute";
    notification.style.top = "auto";
    notification.style.bottom = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.background = "#f44336";
    notification.style.color = "white";
    notification.style.padding = "15px 25px";
    notification.style.borderRadius = "8px";
    notification.style.boxShadow = "0 4px 15px rgba(244, 67, 54, 0.3)";
    notification.style.zIndex = "1002";
    notification.style.fontWeight = "500";
    document.querySelector(".container").appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  startTimer("Custom Section", customTime, customQuestions);
}

function goBack() {
  resetTimer();
  document.getElementById("menu").style.display = "flex";
  document.getElementById("timerScreen").style.display = "none";
  document.getElementById("customInput").style.display = "none";
  document.getElementById("backArrow").style.display = "none";
  document.getElementById("settingsPage").style.display = "none";
  document.getElementById("speedSelection").style.display = "none";
  document.getElementById("fullscreenButton").style.display = "block";
}

function openSettings() {
  document.getElementById("settingsPage").style.display = "flex";

  document.getElementById("timerScreen").style.display = "none";
  document.getElementById("customInput").style.display = "none";
  document.getElementById("speedSelection").style.display = "none";
  document.getElementById("backArrow").style.display = "none";

  initializeSettingsPage();
}

function closeSettings() {
  document.getElementById("settingsPage").style.display = "none";
  document.getElementById("menu").style.display = "flex";
}

function initializeSettingsPage() {
  populatePaceSettings();
  populateThemeSettings();
}

function populatePaceSettings() {
  const savedSpeed = getCookie("speed");
  const paceSelect = document.getElementById("paceSelect");
  if (savedSpeed !== null) {
    paceSelect.value = savedSpeed;
  } else {
    paceSelect.value = "0";
  }
}

function populateThemeSettings() {
  const savedTheme = getCookie("theme");
  if (savedTheme) {
    const themeOptions = document.querySelectorAll(".theme-color-option");
    themeOptions.forEach((option) => {
      if (option.getAttribute("data-color") === savedTheme) {
        option.classList.add("selected-theme");
      } else {
        option.classList.remove("selected-theme");
      }
    });
  }
}
