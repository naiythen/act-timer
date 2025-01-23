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
}

function showTimerScreen(sectionName) {
    document.getElementById("menu").style.display = "none";
    document.getElementById("customInput").style.display = "none";
    document.getElementById("timerScreen").style.display = "block";
    document.getElementById("backArrow").style.display = "flex";
    document.getElementById("sectionTitle").textContent = sectionName;
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
    const timePerQuestion = initialTime / totalQuestions;
    const questionsShouldComplete = Math.min(
        Math.ceil((initialTime - remainingTime) / timePerQuestion),
        totalQuestions
    );
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
                showNextSectionButton();
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
    if (currentFullTestSection < fullTestSections.length) {
        document.getElementById("nextSectionContainer").style.display = "block";
    }
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
}

function startCustomTimer() {
    const customTime = parseInt(
        document.getElementById("customTime").value
    );
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
    startTimer("Custom Section", customTime, customQuestions);
}

function goBack() {
    resetTimer();
    document.getElementById("menu").style.display = "flex";
    document.getElementById("timerScreen").style.display = "none";
    document.getElementById("customInput").style.display = "none";
    document.getElementById("backArrow").style.display = "none";
}
