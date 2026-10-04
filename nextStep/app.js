// ==========================================
// NextStep - App JavaScript
// ==========================================

// ==========================================
// DATA
// ==========================================

let tasks = JSON.parse(localStorage.getItem("lifeDumpTasks")) || [];
let xp = Number(localStorage.getItem("lifeDumpXP")) || 0;
let focusMinutes = Number(localStorage.getItem("lifeDumpFocusMinutes")) || 0;


// ==========================================
// FOCUS TIMER
// ==========================================

const TOTAL_FOCUS_SECONDS = 25 * 60;

let timerSeconds = TOTAL_FOCUS_SECONDS;
let timerInterval = null;
let isTimerRunning = false;
let currentFocusTaskId = null;


// ==========================================
// STARTUP
// ==========================================

document.addEventListener("DOMContentLoaded", function () {
    renderTasks();
    updateStats();
    updateXP();
    updateOverallProgress();
    updateFocusTimer();
    updateFocusProgress();
    updateTimerButton();

    // Make sure old data doesn't break the app
    tasks = tasks.map(function (task) {
        return {
            id: task.id || Date.now() + Math.random(),
            text: task.text || "",
            importance: task.importance || "medium",
            timing: task.timing || "now",
            completed: Boolean(task.completed),
            createdAt: task.createdAt || new Date().toISOString()
        };
    });

    saveData();
    renderTasks();
    updateStats();
    updateOverallProgress();
});


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
    localStorage.setItem(
        "lifeDumpTasks",
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        "lifeDumpXP",
        String(xp)
    );

    localStorage.setItem(
        "lifeDumpFocusMinutes",
        String(focusMinutes)
    );
}


// ==========================================
// CAPTURE THOUGHT
// ==========================================

function processDump() {

    const input = document.getElementById("dumpInput");
    const importance = document.getElementById("importanceSelect");
    const timing = document.getElementById("timingSelect");

    if (!input) {
        return;
    }

    const text = input.value.trim();

    // Don't allow empty tasks
    if (!text) {
        showDumpMessage(
            "Please write something first.",
            true
        );
        return;
    }

    const newTask = {
        id: Date.now(),
        text: text,

        importance: importance
            ? importance.value
            : "medium",

        timing: timing
            ? timing.value
            : "now",

        completed: false,

        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    saveData();

    // Clear input
    input.value = "";

    // Reset selects
    if (importance) {
        importance.value = "medium";
    }

    if (timing) {
        timing.value = "now";
    }

    renderTasks();
    updateStats();
    updateOverallProgress();

    showDumpMessage(
        "Added to NextStep ✓",
        false
    );
}


// ==========================================
// CLEAR INPUT
// ==========================================

function clearDump() {

    const input = document.getElementById("dumpInput");

    if (input) {
        input.value = "";
    }

    const importance = document.getElementById("importanceSelect");
    const timing = document.getElementById("timingSelect");

    if (importance) {
        importance.value = "medium";
    }

    if (timing) {
        timing.value = "now";
    }

    const message = document.getElementById("dumpMessage");

    if (message) {
        message.textContent = "";
        message.classList.add("hidden");
    }
}


// ==========================================
// MESSAGE BELOW CAPTURE BOX
// ==========================================

function showDumpMessage(text, isError = false) {

    const message = document.getElementById("dumpMessage");

    if (!message) {
        return;
    }

    message.textContent = text;
    message.classList.remove("hidden");

    if (isError) {
        message.style.color = "#d04d68";
    } else {
        message.style.color = "";
    }

    setTimeout(function () {

        message.classList.add("hidden");

    }, 3000);
}


// ==========================================
// RENDER TASKS
// ==========================================

function renderTasks() {

    const taskList = document.getElementById("taskList");

    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    // Empty state
    if (tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty">
                No tasks yet. Clear your mind and add your first step.
            </div>
        `;

        return;
    }


    tasks.forEach(function (task) {

        const taskElement = document.createElement("div");

        taskElement.className = "task";

        if (task.completed) {
            taskElement.classList.add("completed");
        }


        const importanceClass =
            getImportanceClass(task.importance);


        const focusButton = task.completed
            ? ""
            : `
                <button
                    class="small-button"
                    onclick="startFocusForTask(${task.id})"
                >
                    Focus
                </button>
            `;


        taskElement.innerHTML = `

            <div
                class="check"
                onclick="completeTask(${task.id})"
                title="${task.completed ? "Completed" : "Complete task"}"
            >
                ${task.completed ? "✓" : ""}
            </div>


            <div class="task-content">

                <div class="task-name">
                    ${escapeHTML(task.text)}
                </div>


                <div class="meta">

                    <span class="badge ${importanceClass}">
                        ${getImportanceLabel(task.importance)}
                    </span>


                    <span class="badge">
                        ${getTimingLabel(task.timing)}
                    </span>

                </div>

            </div>


            <div class="task-actions">

                ${focusButton}


                <button
                    class="icon-button"
                    onclick="deleteTask(${task.id})"
                    title="Delete task"
                >
                    ×
                </button>

            </div>
        `;


        taskList.appendChild(taskElement);

    });
}


// ==========================================
// COMPLETE TASK
// ==========================================

function completeTask(id) {

    const task = tasks.find(function (item) {
        return Number(item.id) === Number(id);
    });


    if (!task) {
        return;
    }


    // Don't give XP twice
    if (task.completed) {
        return;
    }


    task.completed = true;

    // Main task XP
    xp += 50;

    saveData();

    renderTasks();
    updateStats();
    updateXP();
    updateOverallProgress();

    showDumpMessage(
        "Task completed! +50 XP 🎉",
        false
    );
}


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const task = tasks.find(function (item) {
        return Number(item.id) === Number(id);
    });


    if (!task) {
        return;
    }


    const confirmed = confirm(
        "Delete this task?"
    );


    if (!confirmed) {
        return;
    }


    tasks = tasks.filter(function (item) {
        return Number(item.id) !== Number(id);
    });


    // If deleted task was selected for focus
    if (
        currentFocusTaskId !== null &&
        Number(currentFocusTaskId) === Number(id)
    ) {
        currentFocusTaskId = null;

        const focusTaskName =
            document.getElementById("focusTaskName");

        if (focusTaskName) {
            focusTaskName.textContent =
                "No task selected";
        }

        resetTimer();
    }


    saveData();

    renderTasks();
    updateStats();
    updateOverallProgress();
}


// ==========================================
// CLEAR ALL TASKS
// ==========================================

function clearTasks() {

    if (tasks.length === 0) {
        showDumpMessage(
            "There are no tasks to clear.",
            false
        );

        return;
    }


    const confirmed = confirm(
        "Are you sure you want to clear all tasks?"
    );


    if (!confirmed) {
        return;
    }


    tasks = [];

    currentFocusTaskId = null;

    resetTimer();


    const focusTaskName =
        document.getElementById("focusTaskName");

    if (focusTaskName) {
        focusTaskName.textContent =
            "No task selected";
    }


    saveData();

    renderTasks();
    updateStats();
    updateOverallProgress();

    showDumpMessage(
        "All tasks cleared.",
        false
    );
}


// ==========================================
// START FOCUS FOR SPECIFIC TASK
// ==========================================

function startFocusForTask(id) {

    const task = tasks.find(function (item) {
        return Number(item.id) === Number(id);
    });


    if (!task) {
        return;
    }


    if (task.completed) {
        showDumpMessage(
            "This task is already completed.",
            false
        );

        return;
    }


    currentFocusTaskId = task.id;


    const focusTaskName =
        document.getElementById("focusTaskName");


    if (focusTaskName) {
        focusTaskName.textContent =
            task.text;
    }


    // Reset timer whenever a new task is selected
    resetTimer();


    // Scroll to focus section
    const focusCard =
        document.querySelector(".focus");


    if (focusCard) {

        focusCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
}


// ==========================================
// TIMER TOGGLE
// This is the function your HTML calls
// ==========================================

function toggleTimer() {

    if (isTimerRunning) {

        pauseTimer();

    } else {

        startTimer();

    }
}


// ==========================================
// START TIMER
// ==========================================

function startTimer() {

    if (isTimerRunning) {
        return;
    }


    // If timer somehow reached zero,
    // start a fresh session
    if (timerSeconds <= 0) {
        timerSeconds = TOTAL_FOCUS_SECONDS;
    }


    isTimerRunning = true;

    updateTimerButton();


    timerInterval = setInterval(function () {

        timerSeconds--;

        updateFocusTimer();
        updateFocusProgress();


        if (timerSeconds <= 0) {

            finishFocusSession();

        }

    }, 1000);
}


// ==========================================
// PAUSE TIMER
// ==========================================

function pauseTimer() {

    if (!isTimerRunning) {
        return;
    }


    clearInterval(timerInterval);

    timerInterval = null;

    isTimerRunning = false;

    updateTimerButton();
}


// ==========================================
// RESET TIMER
// ==========================================

function resetTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isTimerRunning = false;

    timerSeconds = TOTAL_FOCUS_SECONDS;

    updateFocusTimer();
    updateFocusProgress();
    updateTimerButton();
}


// ==========================================
// FINISH FOCUS SESSION
// ==========================================

function finishFocusSession() {

    clearInterval(timerInterval);

    timerInterval = null;

    isTimerRunning = false;


    // 25 focus minutes
    focusMinutes += 25;

    // Focus XP
    xp += 25;


    // Complete selected task automatically
    if (currentFocusTaskId !== null) {

        const task = tasks.find(function (item) {
            return Number(item.id) === Number(currentFocusTaskId);
        });


        if (task && !task.completed) {

            task.completed = true;

            // Completing the task gives another 50 XP
            xp += 50;

        }

    }


    saveData();


    // Reset timer
    timerSeconds = TOTAL_FOCUS_SECONDS;


    updateFocusTimer();
    updateFocusProgress();
    updateTimerButton();

    renderTasks();
    updateStats();
    updateXP();
    updateOverallProgress();


    // Show completion message in End of Day area
    const endDayMessage =
        document.getElementById("endDayMessage");


    if (endDayMessage) {

        endDayMessage.textContent =
            "Focus session complete! +25 XP 🎉";

        endDayMessage.classList.remove("hidden");

        setTimeout(function () {

            endDayMessage.classList.add("hidden");

        }, 4000);

    }


    currentFocusTaskId = null;


    const focusTaskName =
        document.getElementById("focusTaskName");


    if (focusTaskName) {
        focusTaskName.textContent =
            "No task selected";
    }
}


// ==========================================
// UPDATE TIMER DISPLAY
// ==========================================

function updateFocusTimer() {

    const timer =
        document.getElementById("timer");


    if (!timer) {
        return;
    }


    const minutes =
        Math.floor(timerSeconds / 60);


    const seconds =
        timerSeconds % 60;


    timer.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ==========================================
// FOCUS PROGRESS BAR
// ==========================================

function updateFocusProgress() {

    const progressBar =
        document.getElementById("focusProgressBar");


    if (!progressBar) {
        return;
    }


    const elapsed =
        TOTAL_FOCUS_SECONDS - timerSeconds;


    let percentage =
        (elapsed / TOTAL_FOCUS_SECONDS) * 100;


    // Keep between 0 and 100
    percentage =
        Math.max(
            0,
            Math.min(100, percentage)
        );


    progressBar.style.width =
        percentage + "%";
}


// ==========================================
// TIMER BUTTON
// ==========================================

function updateTimerButton() {

    const button =
        document.getElementById("timerButton");


    if (!button) {
        return;
    }


    if (isTimerRunning) {

        button.textContent = "Pause";

        button.classList.remove("primary");
        button.classList.add("secondary");

    } else {

        button.textContent = "Start";

        button.classList.remove("secondary");
        button.classList.add("primary");

    }
}


// ==========================================
// STATS
// ==========================================

function updateStats() {

    const totalTasks =
        document.getElementById("totalTasks");


    const completedTasks =
        document.getElementById("completedTasks");


    const focusMinutesElement =
        document.getElementById("focusMinutes");


    const streak =
        document.getElementById("streak");


    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    // Total
    if (totalTasks) {
        totalTasks.textContent =
            tasks.length;
    }


    // Completed
    if (completedTasks) {
        completedTasks.textContent =
            completed;
    }


    // Focus minutes
    if (focusMinutesElement) {
        focusMinutesElement.textContent =
            focusMinutes;
    }


    // Day streak
    if (streak) {
        streak.textContent = "1";
    }
}


// ==========================================
// XP DISPLAY
// ==========================================

function updateXP() {

    const xpElement =
        document.getElementById("xp");


    if (!xpElement) {
        return;
    }


    xpElement.textContent =
        xp + " XP";
}


// ==========================================
// OVERALL PROGRESS
// ==========================================

function updateOverallProgress() {

    const progressBar =
        document.getElementById("overallProgressBar");


    const progressPercentage =
        document.getElementById("progressPercentage");


    const progressXP =
        document.getElementById("progressXP");


    const total =
        tasks.length;


    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (completed / total) * 100
            );

    }


    // Progress bar
    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

    }


    // Percentage text
    if (progressPercentage) {

        progressPercentage.textContent =
            percentage + "%";

    }


    // XP text
    if (progressXP) {

        progressXP.textContent =
            xp + " XP";

    }
}


// ==========================================
// END OF DAY
// ==========================================

function endDay() {

    const completed =
        tasks.filter(function (task) {
            return task.completed;
        }).length;


    const total =
        tasks.length;


    let message = "";


    if (total === 0) {

        message =
            "You didn't add any tasks today. That's okay. Start fresh tomorrow.";

    } else if (completed === total) {

        message =
            "Amazing! You completed everything today. 🎉";

    } else if (completed > 0) {

        message =
            "Good work! You completed " +
            completed +
            " out of " +
            total +
            " tasks today.";

    } else {

        message =
            "You don't need to finish everything. Tomorrow is another chance to take your next step.";

    }


    const endDayMessage =
        document.getElementById("endDayMessage");


    if (!endDayMessage) {
        return;
    }


    endDayMessage.textContent =
        message;


    endDayMessage.classList.remove(
        "hidden"
    );
}


// ==========================================
// IMPORTANCE HELPERS
// ==========================================

function getImportanceClass(importance) {

    if (importance === "high") {
        return "high";
    }


    if (importance === "low") {
        return "low";
    }


    return "medium";
}


function getImportanceLabel(importance) {

    if (importance === "high") {
        return "🔴 High";
    }


    if (importance === "low") {
        return "🟢 Low";
    }


    return "🟡 Medium";
}


// ==========================================
// TIMING HELPERS
// ==========================================

function getTimingLabel(timing) {

    if (timing === "now") {
        return "⚡ Now";
    }


    if (timing === "later") {
        return "🌤 Later Today";
    }


    if (timing === "someday") {
        return "📅 Someday";
    }


    return "Now";
}


// ==========================================
// ESCAPE HTML
// Prevent HTML injection in task names
// ==========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        String(text);


    return div.innerHTML;
}

// ==========================================
// AI COACH - GEMMA
// ==========================================

let latestAICoachSteps = [];


// ==========================================
// GET AI COACH RESPONSE
// ==========================================

async function getAICoach() {

    const input =
        document.getElementById("aiCoachInput");

    const button =
        document.getElementById("aiCoachButton");

    const loading =
        document.getElementById("aiCoachLoading");

    const error =
        document.getElementById("aiCoachError");

    const results =
        document.getElementById("aiCoachResults");

    const stepsContainer =
        document.getElementById("aiCoachSteps");


    if (!input) {
        return;
    }


    const situation =
        input.value.trim();


    if (!situation) {

        showAICoachError(
            "Tell me what's on your mind first."
        );

        return;
    }


    if (situation.length < 5) {

        showAICoachError(
            "Give me a little more detail so I can help."
        );

        return;
    }


    // Reset UI
    error.classList.add("hidden");
    results.classList.add("hidden");
    loading.classList.remove("hidden");

    button.disabled = true;
    button.textContent = "🧠 Thinking...";


    try {

        const response =
            await fetch("/api/coach", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    situation: situation
                })
            });


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "AI Coach could not respond."
            );

        }


        if (
            !data.steps ||
            !Array.isArray(data.steps)
        ) {

            throw new Error(
                "AI Coach returned an invalid response."
            );

        }


        latestAICoachSteps =
            data.steps.slice(0, 3);


        renderAICoachSteps(
            latestAICoachSteps
        );


        results.classList.remove(
            "hidden"
        );


    } catch (err) {

        console.error(
            "AI Coach error:",
            err
        );


        showAICoachError(
            err.message ||
            "Something went wrong. Please try again."
        );


    } finally {

        loading.classList.add(
            "hidden"
        );

        button.disabled = false;

        button.textContent =
            "✨ Find My Next Steps";
    }
}


// ==========================================
// RENDER AI STEPS
// ==========================================

function renderAICoachSteps(steps) {

    const container =
        document.getElementById("aiCoachSteps");


    if (!container) {
        return;
    }


    container.innerHTML = "";


    steps.forEach(function (step, index) {

        const stepElement =
            document.createElement("div");


        stepElement.className =
            "ai-coach-step";


        const number =
            document.createElement("div");


        number.className =
            "step-number";


        number.textContent =
            index + 1;


        const text =
            document.createElement("div");


        text.className =
            "step-text";


        text.textContent =
            step;


        const addButton =
            document.createElement("button");


        addButton.className =
            "secondary small-button";


        addButton.textContent =
            "+ Add Task";


        addButton.onclick =
            function () {

                addAICoachTask(
                    step,
                    addButton
                );

            };


        stepElement.appendChild(
            number
        );

        stepElement.appendChild(
            text
        );

        stepElement.appendChild(
            addButton
        );


        container.appendChild(
            stepElement
        );

    });
}


// ==========================================
// ADD AI STEP TO TASKS
// ==========================================

function addAICoachTask(
    stepText,
    button
) {

    const newTask = {

        id:
            Date.now() +
            Math.random(),

        text:
            stepText,

        importance:
            "medium",

        timing:
            "now",

        completed:
            false,

        createdAt:
            new Date().toISOString()
    };


    tasks.unshift(
        newTask
    );


    saveData();

    renderTasks();

    updateStats();

    updateOverallProgress();


    if (button) {

        button.textContent =
            "✓ Added";

        button.disabled =
            true;

    }


    showDumpMessage(
        "AI step added to NextStep ✓",
        false
    );
}


// ==========================================
// AI COACH ERROR
// ==========================================

function showAICoachError(
    message
) {

    const error =
        document.getElementById(
            "aiCoachError"
        );


    if (!error) {
        return;
    }


    error.textContent =
        message;


    error.classList.remove(
        "hidden"
    );
}


// ==========================================
// CLEAR AI COACH
// ==========================================

function clearAICoach() {

    const input =
        document.getElementById(
            "aiCoachInput"
        );


    const results =
        document.getElementById(
            "aiCoachResults"
        );


    const error =
        document.getElementById(
            "aiCoachError"
        );


    if (input) {
        input.value = "";
    }


    if (results) {
        results.classList.add(
            "hidden"
        );
    }


    if (error) {
        error.classList.add(
            "hidden"
        );
    }


    latestAICoachSteps = [];
}