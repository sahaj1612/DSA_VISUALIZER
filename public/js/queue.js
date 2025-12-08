// Queue Visualizer with:
// Linear Queue, Circular Queue, Priority Queue, and Deque

const typeButtons = document.querySelectorAll(".queue-type-btn");
const hintEl = document.getElementById("queue-hint");
const statusEl = document.getElementById("queue-status");

const inputEl = document.getElementById("queue-value");
const btnEnqueue = document.getElementById("btn-enqueue");
const btnDequeue = document.getElementById("btn-dequeue");
const btnReset = document.getElementById("btn-reset");

const btnGroupDeque = document.getElementById("btn-group-deque");
const btnEnqFront = document.getElementById("btn-enq-front");
const btnEnqRear = document.getElementById("btn-enq-rear");
const btnDeqFront = document.getElementById("btn-deq-front");
const btnDeqRear = document.getElementById("btn-deq-rear");

const visualGeneric = document.getElementById("queue-visual-generic");
const visualCircular = document.getElementById("queue-visual-circular");
const circularTrack = document.getElementById("circular-track");

let currentType = "linear";

// Linear queue state (simple array)
let linearQueue = [];

// Priority queue state (simple array, sorted by value descending)
let priorityQueue = [];

// Deque state
let deque = [];

// Circular queue state
const CAPACITY = 8;
let circular = {
    data: new Array(CAPACITY).fill(null),
    front: -1,
    rear: -1,
    size: 0,
};

// Utility: set status + small color cue
function setStatus(message, type = "info") {
    statusEl.textContent = message;
    if (type === "info") {
        statusEl.style.setProperty("--dot-color", "#22c55e");
    } else if (type === "warn") {
        statusEl.style.setProperty("--dot-color", "#f97316");
    } else if (type === "error") {
        statusEl.style.setProperty("--dot-color", "#ef4444");
    }
}

// Utility: hint text per type
function updateHint() {
    let text;
    switch (currentType) {
        case "linear":
            text = "Linear Queue: FIFO, front moves forward and freed space is not reused.";
            break;
        case "circular":
            text = "Circular Queue: front and rear wrap around in a fixed-size buffer.";
            break;
        case "priority":
            text = "Priority Queue: highest priority (largest value here) is dequeued first.";
            break;
        case "deque":
            text = "Deque: double-ended queue, you can insert/remove at both front and rear.";
            break;
    }
    hintEl.textContent = text;
}

// Render generic queue (linear, priority, deque)
function renderGenericQueue(items) {
    visualGeneric.innerHTML = "";

    items.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "queue-item";

        if (currentType === "priority") {
            item.classList.add("priority");
        }

        // Highlight front/rear
        if (index === 0) {
            item.classList.add("front");
        }
        if (index === items.length - 1) {
            item.classList.add("rear");
        }

        item.textContent = value;
        visualGeneric.appendChild(item);
    });
}

// Render circular queue
function renderCircularQueue() {
    circularTrack.innerHTML = "";

    for (let i = 0; i < CAPACITY; i++) {
        const cell = document.createElement("div");
        cell.className = "circular-cell";

        const val = circular.data[i];

        if (val !== null) {
            cell.classList.add("used");
            const v = document.createElement("div");
            v.className = "circular-cell-value";
            v.textContent = val;
            cell.appendChild(v);
        }

        const indexLabel = document.createElement("div");
        indexLabel.className = "circular-cell-index";
        indexLabel.textContent = `Index ${i}`;
        cell.appendChild(indexLabel);

        if (circular.size > 0) {
            if (i === circular.front) {
                cell.classList.add("front");
            }
            if (i === circular.rear) {
                cell.classList.add("rear");
            }
        }

        circularTrack.appendChild(cell);
    }
}

// Re-render based on type
function render() {
    if (currentType === "linear") {
        visualGeneric.style.display = "flex";
        visualCircular.classList.remove("active");
        renderGenericQueue(linearQueue);
    } else if (currentType === "priority") {
        visualGeneric.style.display = "flex";
        visualCircular.classList.remove("active");
        renderGenericQueue(priorityQueue);
    } else if (currentType === "deque") {
        visualGeneric.style.display = "flex";
        visualCircular.classList.remove("active");
        renderGenericQueue(deque);
    } else if (currentType === "circular") {
        visualGeneric.style.display = "none";
        visualCircular.classList.add("active");
        renderCircularQueue();
    }
}

// Switch type
typeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        typeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        currentType = btn.getAttribute("data-type");

        // Show/hide deque controls
        if (currentType === "deque") {
            btnGroupDeque.classList.add("active");
            btnEnqueue.style.display = "none";
            btnDequeue.style.display = "none";
        } else {
            btnGroupDeque.classList.remove("active");
            btnEnqueue.style.display = "inline-flex";
            btnDequeue.style.display = "inline-flex";
        }

        // When changing types, we keep existing data or reset?
        // To keep things simple and clear for learning, we reset that type.
        if (currentType === "linear") {
            if (linearQueue.length === 0) {
                setStatus("Linear Queue selected. Currently empty.", "info");
            } else {
                setStatus("Linear Queue selected.", "info");
            }
        } else if (currentType === "circular") {
            setStatus("Circular Queue selected.", "info");
        } else if (currentType === "priority") {
            setStatus("Priority Queue selected.", "info");
        } else if (currentType === "deque") {
            setStatus("Deque selected. Use front/rear buttons.", "info");
        }

        updateHint();
        render();
    });
});

// Input helper
function getInputValue() {
    const v = inputEl.value.trim();
    if (!v) {
        setStatus("Please enter a value first.", "warn");
        inputEl.focus();
        return null;
    }
    return v;
}

// LINEAR QUEUE OPERATIONS
function linearEnqueue(value) {
    linearQueue.push(value);
    render();
    setStatus(`Enqueued “${value}” into linear queue.`, "info");
}

function linearDequeue() {
    if (linearQueue.length === 0) {
        setStatus("Linear queue underflow: no elements to dequeue.", "error");
        return;
    }

    const nodes = [...visualGeneric.querySelectorAll(".queue-item")];
    const frontNode = nodes[0];

    if (frontNode) {
        frontNode.classList.add("removing");
        const v = linearQueue[0];

        setTimeout(() => {
            linearQueue.shift();
            render();
            setStatus(`Dequeued “${v}” from linear queue.`, "info");
        }, 170);
    } else {
        const v = linearQueue.shift();
        render();
        setStatus(`Dequeued “${v}” from linear queue.`, "info");
    }
}

// PRIORITY QUEUE OPERATIONS  (larger number => higher priority)
function priorityEnqueue(value) {
    // Try to parse as number; if not, keep as string but still sort lexicographically
    let num = Number(value);
    if (!Number.isNaN(num)) {
        priorityQueue.push(num);
        // ascending: smallest value has highest priority
        priorityQueue.sort((a, b) => a - b);
        render();
        setStatus(`Enqueued ${num} into priority queue (smallest first).`, "info");
    } else {
        // Fallback: string values sorted ascending
        priorityQueue.push(value);
        priorityQueue.sort((a, b) => (a < b ? -1 : 1));
        render();
        setStatus(`Enqueued “${value}” into priority queue (ascending).`, "info");
    }
}



function priorityDequeue() {
    if (priorityQueue.length === 0) {
        setStatus("Priority queue underflow: no elements to dequeue.", "error");
        return;
    }

    const nodes = [...visualGeneric.querySelectorAll(".queue-item")];
    const frontNode = nodes[0];

    if (frontNode) {
        frontNode.classList.add("removing");
        const v = priorityQueue[0];

        setTimeout(() => {
            priorityQueue.shift();
            render();
            setStatus(`Dequeued highest-priority element “${v}”.`, "info");
        }, 170);
    } else {
        const v = priorityQueue.shift();
        render();
        setStatus(`Dequeued highest-priority element “${v}”.`, "info");
    }
}

// DEQUE OPERATIONS
function dequeEnqueueFront(value) {
    deque.unshift(value);
    render();
    setStatus(`Enqueued “${value}” at FRONT of deque.`, "info");
}

function dequeEnqueueRear(value) {
    deque.push(value);
    render();
    setStatus(`Enqueued “${value}” at REAR of deque.`, "info");
}

function dequeDequeueFront() {
    if (deque.length === 0) {
        setStatus("Deque underflow: no elements at front.", "error");
        return;
    }

    const nodes = [...visualGeneric.querySelectorAll(".queue-item")];
    const frontNode = nodes[0];

    if (frontNode) {
        frontNode.classList.add("removing");
        const v = deque[0];

        setTimeout(() => {
            deque.shift();
            render();
            setStatus(`Dequeued “${v}” from FRONT of deque.`, "info");
        }, 170);
    } else {
        const v = deque.shift();
        render();
        setStatus(`Dequeued “${v}” from FRONT of deque.`, "info");
    }
}

function dequeDequeueRear() {
    if (deque.length === 0) {
        setStatus("Deque underflow: no elements at rear.", "error");
        return;
    }

    const nodes = [...visualGeneric.querySelectorAll(".queue-item")];
    const lastNode = nodes[nodes.length - 1];

    if (lastNode) {
        lastNode.classList.add("removing");
        const v = deque[deque.length - 1];

        setTimeout(() => {
            deque.pop();
            render();
            setStatus(`Dequeued “${v}” from REAR of deque.`, "info");
        }, 170);
    } else {
        const v = deque.pop();
        render();
        setStatus(`Dequeued “${v}” from REAR of deque.`, "info");
    }
}

// CIRCULAR QUEUE OPERATIONS
function isCircularFull() {
    return circular.size === CAPACITY;
}

function isCircularEmpty() {
    return circular.size === 0;
}

function circularEnqueue(value) {
    if (isCircularFull()) {
        setStatus("Circular queue overflow: buffer is full.", "error");
        return;
    }

    if (isCircularEmpty()) {
        circular.front = 0;
        circular.rear = 0;
        circular.data[0] = value;
        circular.size = 1;
    } else {
        circular.rear = (circular.rear + 1) % CAPACITY;
        circular.data[circular.rear] = value;
        circular.size++;
    }

    render();
    setStatus(`Enqueued “${value}” into circular queue.`, "info");
}

function circularDequeue() {
    if (isCircularEmpty()) {
        setStatus("Circular queue underflow: no elements to dequeue.", "error");
        return;
    }

    const removed = circular.data[circular.front];
    circular.data[circular.front] = null;

    if (circular.size === 1) {
        // becomes empty
        circular.front = -1;
        circular.rear = -1;
        circular.size = 0;
    } else {
        circular.front = (circular.front + 1) % CAPACITY;
        circular.size--;
    }

    render();
    setStatus(`Dequeued “${removed}” from circular queue.`, "info");
}

// Main buttons (Enqueue / Dequeue / Reset)
btnEnqueue.addEventListener("click", () => {
    const v = getInputValue();
    if (v === null) return;
    inputEl.value = "";

    if (currentType === "linear") {
        linearEnqueue(v);
    } else if (currentType === "priority") {
        priorityEnqueue(v);
    } else if (currentType === "circular") {
        circularEnqueue(v);
    }
});

btnDequeue.addEventListener("click", () => {
    if (currentType === "linear") {
        linearDequeue();
    } else if (currentType === "priority") {
        priorityDequeue();
    } else if (currentType === "circular") {
        circularDequeue();
    }
});

btnReset.addEventListener("click", () => {
    if (currentType === "linear") {
        linearQueue = [];
        render();
        setStatus("Linear queue cleared.", "info");
    } else if (currentType === "priority") {
        priorityQueue = [];
        render();
        setStatus("Priority queue cleared.", "info");
    } else if (currentType === "deque") {
        deque = [];
        render();
        setStatus("Deque cleared.", "info");
    } else if (currentType === "circular") {
        circular = {
            data: new Array(CAPACITY).fill(null),
            front: -1,
            rear: -1,
            size: 0,
        };
        render();
        setStatus("Circular queue cleared.", "info");
    }
});

// Deque buttons
btnEnqFront.addEventListener("click", () => {
    const v = getInputValue();
    if (v === null) return;
    inputEl.value = "";
    dequeEnqueueFront(v);
});

btnEnqRear.addEventListener("click", () => {
    const v = getInputValue();
    if (v === null) return;
    inputEl.value = "";
    dequeEnqueueRear(v);
});

btnDeqFront.addEventListener("click", () => {
    dequeDequeueFront();
});

btnDeqRear.addEventListener("click", () => {
    dequeDequeueRear();
});

// Enter key for enqueue (for non-deque types)
inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (currentType === "deque") {
            // Default to enqueue rear for deque
            btnEnqRear.click();
        } else {
            btnEnqueue.click();
        }
    }
});

// Initial render
updateHint();
render();
setStatus("Linear Queue selected. Currently empty.", "info");
