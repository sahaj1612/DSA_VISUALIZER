const statusEl = document.getElementById("string-status");
const visual = document.getElementById("string-visual");

// Modes
const btnMode1D = document.getElementById("btn-mode-1d");
const btnMode2D = document.getElementById("btn-mode-2d");
const controls1D = document.getElementById("controls-1d");
const controls2D = document.getElementById("controls-2d");

let is2D = false;

// 1D String Data
let str1D = [];

// 2D String Data
let str2D = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

// Helpers
function setStatus(msg, type = "info") {
    statusEl.textContent = msg;
}
function isSingleChar(value) {
    return value.length === 1;
}


// ---------- MODE SWITCH ----------
btnMode1D.addEventListener("click", () => {
    is2D = false;

    btnMode1D.classList.add("primary");
    btnMode1D.classList.remove("subtle");

    btnMode2D.classList.add("subtle");
    btnMode2D.classList.remove("primary");

    controls1D.style.display = "block";
    controls2D.style.display = "none";

    visual.className = "array-visual";
    render1D();
});

btnMode2D.addEventListener("click", () => {
    is2D = true;

    btnMode2D.classList.add("primary");
    btnMode2D.classList.remove("subtle");

    btnMode1D.classList.add("subtle");
    btnMode1D.classList.remove("primary");

    controls1D.style.display = "none";
    controls2D.style.display = "block";

    visual.className = "array-grid";
    render2D();
});


// ---------- RENDER 1D ----------
function render1D(highlightIndex = null) {
    visual.innerHTML = "";

    str1D.forEach((val, i) => {
        const cell = document.createElement("div");
        cell.className = "array-cell";

        const item = document.createElement("div");
        item.className = "array-item";
        if (i === highlightIndex) item.classList.add("highlight");
        item.textContent = val || "-";

        const indexLabel = document.createElement("div");
        indexLabel.className = "array-index";
        indexLabel.textContent = i;

        cell.appendChild(item);
        cell.appendChild(indexLabel);
        visual.appendChild(cell);
    });
}



// ---------- RENDER 2D ----------
function render2D(hr = null, hc = null) {
    visual.innerHTML = "";
    visual.style.gridTemplateColumns = `repeat(${str2D[0].length}, 64px)`;

    str2D.forEach((row, r) => {
        row.forEach((col, c) => {
            const item = document.createElement("div");
            item.className = "array-item";

            if (r === hr && c === hc) {
                item.classList.add("highlight");
            }

            item.textContent = col || "-";
            visual.appendChild(item);
        });
    });
}



// ---------- 1D INSERT ----------
document.getElementById("btn-insert-1d").addEventListener("click", () => {
    const index = parseInt(document.getElementById("index-1d").value);
    const value = document.getElementById("value-1d").value.trim();

    if (isNaN(index) || index < 0 || index > str1D.length) {
        setStatus("Invalid index for insertion.", "warn");
        return;
    }
if (!value || !isSingleChar(value)) {
    setStatus("Only ONE character is allowed.", "warn");
    return;
}


    str1D.splice(index, 0, value);
    render1D();
    setStatus(`Inserted "${value}" at index ${index}.`, "info");
});

// ---------- 1D DELETE ----------
document.getElementById("btn-delete-1d").addEventListener("click", () => {
    const index = parseInt(document.getElementById("index-1d").value);

    if (isNaN(index) || index < 0 || index >= str1D.length) {
        setStatus("Invalid index for deletion.", "warn");
        return;
    }

    str1D.splice(index, 1);
    render1D();
    setStatus(`Deleted "${removed}" from index ${index}.`, "info");
});

// ---------- 2D INSERT ----------
document.getElementById("btn-insert-2d").addEventListener("click", () => {
    const r = parseInt(document.getElementById("row-2d").value);
    const c = parseInt(document.getElementById("col-2d").value);
    const value = document.getElementById("value-2d").value.trim();
if (!value || !isSingleChar(value)) {
    setStatus("Only ONE character is allowed.", "warn");
    return;
}



    if (isNaN(r) || isNaN(c) || !str2D[r] || str2D[r][c] === undefined) {
        setStatus("Invalid row/column.", "error");
        return;
    }

    str2D[r][c] = value;
    render2D();
    setStatus(`Inserted "${value}" at (${r}, ${c}).`);
});

// ---------- 2D DELETE ----------
document.getElementById("btn-delete-2d").addEventListener("click", () => {
    const r = parseInt(document.getElementById("row-2d").value);
    const c = parseInt(document.getElementById("col-2d").value);

    if (isNaN(r) || isNaN(c) || !str2D[r] || str2D[r][c] === undefined) {
        setStatus("Invalid row/column.", "error");
        return;
    }

    str2D[r][c] = "";
    render2D();
    setStatus(`Deleted value at (${r}, ${c}).`);
});

// Initial state
render1D();
