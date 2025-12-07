// TAB SWITCHING
const tabButtons = document.querySelectorAll(".tab-button");
const sections = document.querySelectorAll(".visual-section");

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetId = btn.getAttribute("data-target");
        sections.forEach(sec => {
            if (sec.id === targetId) sec.classList.add("active");
            else sec.classList.remove("active");
        });
    });
});

// ---------------- STACK ----------------
let stack = [];

const stackInput = document.getElementById("stack-input");
const stackPushBtn = document.getElementById("stack-push");
const stackPopBtn = document.getElementById("stack-pop");
const stackResetBtn = document.getElementById("stack-reset");
const stackContainer = document.getElementById("stack-container");

function renderStack() {
    stackContainer.innerHTML = "";
    stack.forEach(v => {
        const item = document.createElement("div");
        item.classList.add("stack-item");
        item.textContent = v;
        stackContainer.appendChild(item);
        requestAnimationFrame(() => item.classList.add("show"));
    });
}

stackPushBtn.addEventListener("click", () => {
    const value = stackInput.value.trim();
    if (!value) return;
    stack.push(value);
    stackInput.value = "";
    renderStack();
});

stackPopBtn.addEventListener("click", () => {
    if (stack.length === 0) return;
    const items = stackContainer.querySelectorAll(".stack-item");
    if (items.length > 0) {
        const topItem = items[items.length - 1];
        topItem.classList.add("removing");
        setTimeout(() => {
            stack.pop();
            renderStack();
        }, 200);
    } else {
        stack.pop();
        renderStack();
    }
});

stackResetBtn.addEventListener("click", () => {
    stack = [];
    renderStack();
});

// ---------------- QUEUE ----------------
let queue = [];

const queueInput = document.getElementById("queue-input");
const queueEnqBtn = document.getElementById("queue-enq");
const queueDeqBtn = document.getElementById("queue-deq");
const queueResetBtn = document.getElementById("queue-reset");
const queueContainer = document.getElementById("queue-container");

function renderQueue() {
    queueContainer.innerHTML = "";
    queue.forEach(v => {
        const item = document.createElement("div");
        item.classList.add("queue-item");
        item.textContent = v;
        queueContainer.appendChild(item);
        requestAnimationFrame(() => item.classList.add("show"));
    });
}

queueEnqBtn.addEventListener("click", () => {
    const value = queueInput.value.trim();
    if (!value) return;
    queue.push(value);
    queueInput.value = "";
    renderQueue();
});

queueDeqBtn.addEventListener("click", () => {
    if (queue.length === 0) return;
    const items = queueContainer.querySelectorAll(".queue-item");
    if (items.length > 0) {
        const frontItem = items[0];
        frontItem.classList.add("removing");
        setTimeout(() => {
            queue.shift();
            renderQueue();
        }, 200);
    } else {
        queue.shift();
        renderQueue();
    }
});

queueResetBtn.addEventListener("click", () => {
    queue = [];
    renderQueue();
});

// ---------------- LINKED LIST (as array for visual) ----------------
let list = [];

const listInput = document.getElementById("list-input");
const listInsertHeadBtn = document.getElementById("list-insert-head");
const listInsertTailBtn = document.getElementById("list-insert-tail");
const listDeleteHeadBtn = document.getElementById("list-delete-head");
const listResetBtn = document.getElementById("list-reset");
const listContainer = document.getElementById("list-container");

function renderList() {
    listContainer.innerHTML = "";
    list.forEach((v, idx) => {
        const node = document.createElement("div");
        node.classList.add("list-node");

        const valueSpan = document.createElement("div");
        valueSpan.classList.add("list-node-value");
        valueSpan.textContent = v;

        node.appendChild(valueSpan);

        if (idx !== list.length - 1) {
            const arrow = document.createElement("span");
            arrow.classList.add("arrow");
            arrow.textContent = "→";
            node.appendChild(arrow);
        }

        listContainer.appendChild(node);
        requestAnimationFrame(() => node.classList.add("show"));
    });
}

listInsertHeadBtn.addEventListener("click", () => {
    const value = listInput.value.trim();
    if (!value) return;
    list.unshift(value);
    listInput.value = "";
    renderList();
});

listInsertTailBtn.addEventListener("click", () => {
    const value = listInput.value.trim();
    if (!value) return;
    list.push(value);
    listInput.value = "";
    renderList();
});

listDeleteHeadBtn.addEventListener("click", () => {
    if (list.length === 0) return;
    const nodes = listContainer.querySelectorAll(".list-node");
    if (nodes.length > 0) {
        const headNode = nodes[0];
        headNode.classList.add("removing");
        setTimeout(() => {
            list.shift();
            renderList();
        }, 200);
    } else {
        list.shift();
        renderList();
    }
});

listResetBtn.addEventListener("click", () => {
    list = [];
    renderList();
});

// initial renders
renderStack();
renderQueue();
renderList();
