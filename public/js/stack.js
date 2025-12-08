// Simple stack implementation with animated rendering

const stack = [];

const inputEl = document.getElementById("stack-value");
const btnPush = document.getElementById("btn-push");
const btnPop = document.getElementById("btn-pop");
const btnReset = document.getElementById("btn-reset");
const visual = document.getElementById("stack-visual");
const statusEl = document.getElementById("stack-status");

function setStatus(message, type = "info") {
    statusEl.textContent = message;

    // Tiny color hint based on type
    if (type === "info") {
        statusEl.style.setProperty("--dot-color", "#22c55e");
    } else if (type === "warn") {
        statusEl.style.setProperty("--dot-color", "#f97316");
    } else if (type === "error") {
        statusEl.style.setProperty("--dot-color", "#ef4444");
    }
}

// Render stack
function renderStack(popIndex = null) {
    visual.innerHTML = "";

    stack.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "stack-item";
        if (index === stack.length - 1) {
            item.classList.add("is-top");
        }
        item.textContent = value;

        // If this is the one we are popping, mark as removing
        if (popIndex !== null && index === popIndex) {
            item.classList.add("removing");
        }

        visual.appendChild(item);
    });
}

// Push operation
btnPush.addEventListener("click", () => {
    const value = inputEl.value.trim();
    if (!value) {
        setStatus("Please enter a value before pushing.", "warn");
        inputEl.focus();
        return;
    }
    stack.push(value);
    inputEl.value = "";
    renderStack();
    setStatus(`Pushed “${value}” onto the stack. Top updated.`, "info");
});

// Pop operation
btnPop.addEventListener("click", () => {
    if (stack.length === 0) {
        setStatus("Stack underflow: nothing to pop.", "error");
        return;
    }

    const topIndex = stack.length - 1;
    const items = [...visual.querySelectorAll(".stack-item")];
    const topItem = items[topIndex];

    if (topItem) {
        topItem.classList.add("removing");
        const poppedValue = stack[topIndex];

        setTimeout(() => {
            stack.pop();
            renderStack();
            setStatus(`Popped “${poppedValue}” from the stack.`, "info");
        }, 180);
    } else {
        const poppedValue = stack.pop();
        renderStack();
        setStatus(`Popped “${poppedValue}” from the stack.`, "info");
    }
});

// Reset stack
btnReset.addEventListener("click", () => {
    if (stack.length === 0) {
        setStatus("Stack is already empty.", "info");
        return;
    }
    stack.length = 0;
    renderStack();
    setStatus("Stack cleared.", "info");
});

// Allow Enter to trigger push
inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        btnPush.click();
    }
});

// Initial render
renderStack();
setStatus("Stack is empty. Push some values!");
