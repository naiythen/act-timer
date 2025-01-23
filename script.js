let timerInterval;
let remainingTime = 0;
let isRunning = false;
let currentSection = "";
let totalQuestions = 0;
let initialTime = 0;
let currentFullTestSection = 0;
const fullTestSections = [
    { name: "English", time: 45, questions: 75 },
    { name: "Math", time: 60, questions: 60 },
    { name: "Reading", time: 35, questions: 40 },
    { name: "Science", time: 35, questions: 40 },
];

// Theme and Tracking Variables
let currentTheme = localStorage.getItem('theme') || 'blue';
let totalTimeTracked = localStorage.getItem('totalTime') ? parseInt(localStorage.getItem('totalTime')) : 0;
let trackingInterval;
let trackingStartTime;

// Cookie Handling
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName.trim() === name) return cookieValue;
    }
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

// Initial Setup
document.addEventListener('DOMContentLoaded', function() {
    // Speed Selection
    if (!getCookie('speed') && window.location.pathname === '/') {
        document.getElementById('menu').style.display = 'none';
        document.getElementById('speedSelection').style.display = 'block';
    }
    
    // Theme Initialization
    changeTheme(currentTheme);
    document.body.innerHTML += '<div class="theme-backdrop"></div>';
});

// Speed Preference
function setSpeedPreference(speedValue) {
    setCookie('speed', speedValue);
    document.getElementById('speedSelection').style.display = 'none';
    document.getElementById('menu').style.display = 'flex';
    showConfirmation('⏱️ Speed preference saved!');
}

// Core Timer Functions
function startTimer(sectionName, durationMinutes, numQuestions) {
    showTimerScreen(sectionName);
    remainingTime = durationMinutes * 60;
    initialTime = remainingTime;
    totalQuestions = numQuestions;
    isRunning = true;
    updateDisplay();
    updateProgressBar();
    updateQuestionGuidance();
    startInterval();
    startTracking();
}

function showTimerScreen(sectionName) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("customInput").style.display = "none";
    document.getElementById("timerScreen").style.display = "block";
    document.getElementById("backArrow").style.display = "flex";
    document.getElementById("sectionTitle").textContent = sectionName;
}

function updateDisplay() {
    const minutes = Math.floor(remainingTime / 60).toString().padStart(2, "0");
    const seconds = (remainingTime % 60).toString().padStart(2, "0");
    document.getElementById("timeDisplay").textContent = `${minutes}:${seconds}`;
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

    const speed = parseInt(getCookie('speed')) || 0;
    const speedOffset = speed * 5 * 60;
    const adjustedTime = Math.max(initialTime - speedOffset, 1);
    const timePerQuestion = adjustedTime / totalQuestions;
    const elapsedTime = initialTime - remainingTime;
    const questionsShouldComplete = Math.min(Math.ceil(elapsedTime / timePerQuestion), totalQuestions);

    const updateCounter = () => {
        const text = `You should be on Question: ${questionsShouldComplete}/${totalQuestions}`;
        if (!questionCounter.querySelector(".counter-container")) {
            const container = document.createElement("div");
            container.className = "counter-container";
            container.innerHTML = `
                <span class="question-text">${text}</span>
                <button class="eye-toggle" aria-label="Toggle visibility">
                    <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                    </svg>
                </button>
            `;
            container.querySelector('button').addEventListener('click', toggleBlur);
            questionCounter.innerHTML = '';
            questionCounter.appendChild(container);
        } else {
            questionCounter.querySelector(".question-text").textContent = text;
        }
    };

    const toggleBlur = (e) => {
        const container = e.target.closest('.counter-container');
        container.classList.toggle('blurred');
        const svg = container.querySelector('svg');
        svg.innerHTML = container.classList.contains('blurred') ? 
            '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>' :
            '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>';
    };

    updateCounter();
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
                showNextSectionButton();
            }
        }
    }, 1000);
}

// Timer Controls
function pauseTimer() {
    isRunning = false;
    pauseTracking();
}

function resumeTimer() {
    if (!isRunning && remainingTime > 0) {
        isRunning = true;
        startInterval();
        startTracking();
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
    pauseTracking();
}

// Full Test Handling
function startFullTest() {
    currentFullTestSection = 0;
    startNextFullTestSection();
}

function startNextFullTestSection() {
    if (currentFullTestSection < fullTestSections.length) {
        const section = fullTestSections[currentFullTestSection];
        startTimer(`ACT FULL Test - ${section.name}`, section.time, section.questions);
        currentFullTestSection++;
    }
}

function nextSection() {
    resetTimer();
    hideNextSectionButton();
    startNextFullTestSection();
}

// Custom Timer
function showCustomInput() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("customInput").style.display = "block";
}

function startCustomTimer() {
    const customTime = parseInt(document.getElementById("customTime").value);
    const customQuestions = parseInt(document.getElementById("customQuestions").value);
    if (isNaN(customTime) || isNaN(customQuestions) || customTime <= 0 || customQuestions <= 0) {
        alert("Please enter valid time and number of questions.");
        return;
    }
    startTimer("Custom Section", customTime, customQuestions);
}

// Navigation
function goBack() {
    resetTimer();
    document.getElementById("menu").style.display = "flex";
    document.getElementById("timerScreen").style.display = "none";
    document.getElementById("customInput").style.display = "none";
    document.getElementById("backArrow").style.display = "none";
    document.getElementById("speedSelection").style.display = "none";
}

// Theme Management
function changeTheme(color) {
    currentTheme = color;
    localStorage.setItem('theme', color);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('selected');
        if (option.classList.contains(`${color}-theme`)) option.classList.add('selected');
    });

    const root = document.documentElement;
    const themeColor = color === 'blue' ? '#3399ff' : 
                      color === 'red' ? '#ff3366' : 
                      color === 'green' ? '#33cc99' : color;
    root.style.setProperty('--theme-color', themeColor);

    document.querySelectorAll('button:not(.theme-option):not(#settingsGear)').forEach(button => {
        button.style.background = themeColor;
    });
}

// Time Tracking
function startTracking() {
    trackingStartTime = Date.now();
    trackingInterval = setInterval(() => {
        totalTimeTracked++;
        localStorage.setItem('totalTime', totalTimeTracked);
    }, 1000);
}

function pauseTracking() {
    clearInterval(trackingInterval);
    if (trackingStartTime) {
        totalTimeTracked += Math.floor((Date.now() - trackingStartTime) / 1000);
        trackingStartTime = null;
    }
}

function formatTime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
        days > 0 ? `${days}d ` : '',
        hours > 0 ? `${hours}h ` : '',
        minutes > 0 ? `${minutes}m ` : '',
        `${secs}s`
    ].join('').trim();
}

// Settings Menu
function toggleSettings() {
    const menu = document.getElementById('settingsMenu');
    menu.classList.toggle('settings-visible');
    if (menu.classList.contains('settings-visible')) {
        updateStatsDisplay();
    }
}

function updateStatsDisplay() {
    document.getElementById('timeStats').textContent = formatTime(totalTimeTracked);
}

function resetSpeedPreference() {
    document.cookie = 'speed=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    showConfirmation('⏱️ Speed preference reset!');
}

// UI Helpers
function showConfirmation(text) {
    const confirmation = document.createElement('div');
    confirmation.textContent = text;
    confirmation.className = 'confirmation-toast';
    document.body.appendChild(confirmation);
    setTimeout(() => confirmation.remove(), 2000);
}

// Event Listeners
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pauseTracking();
    } else if (isRunning) {
        startTracking();
    }
});

// Section Visibility Control
function showNextSectionButton() {
    if (currentFullTestSection < fullTestSections.length) {
        document.getElementById("nextSectionContainer").style.display = "block";
    }
}

function hideNextSectionButton() {
    document.getElementById("nextSectionContainer").style.display = "none";
}
