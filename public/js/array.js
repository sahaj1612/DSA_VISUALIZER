const statusEl = document.getElementById("array-status");
const visual = document.getElementById("array-visual");

// Modes
const btnMode1D = document.getElementById("btn-mode-1d");
const btnMode2D = document.getElementById("btn-mode-2d");
const controls1D = document.getElementById("controls-1d");
const controls2D = document.getElementById("controls-2d");

let is2D = false;

// 1D Array Data
let arr1D = [];

// 2D Array Data
let arr2D = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
];

// Helpers
function setStatus(msg, type = "info") {
    statusEl.textContent = msg;
}
function isNumeric(value) {
    return /^-?\d+(\.\d+)?$/.test(value);
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

    arr1D.forEach((val, i) => {
        const wrapper = document.createElement("div");
        wrapper.className = "array-cell";

        const item = document.createElement("div");
        item.className = "array-item";
        if (i === highlightIndex) item.classList.add("highlight");
        item.textContent = val;

        const indexLabel = document.createElement("div");
        indexLabel.className = "array-index";
        indexLabel.textContent = i;

        wrapper.appendChild(item);
        wrapper.appendChild(indexLabel);
        visual.appendChild(wrapper);
    });
}


// ---------- RENDER 2D ----------
function render2D(hr = null, hc = null) {
    visual.innerHTML = "";

    // set grid columns equal to number of columns in 2D array
    visual.style.gridTemplateColumns = `repeat(${arr2D[0].length}, 64px)`;

    arr2D.forEach((row, r) => {
        row.forEach((col, c) => {
            const item = document.createElement("div");
            item.className = "array-item";

            if (r === hr && c === hc) {
                item.classList.add("highlight");
            }

            item.textContent = col === "" ? "-" : col;
            visual.appendChild(item);
        });
    });
}


// ---------- 1D INSERT ----------
document.getElementById("btn-insert-1d").addEventListener("click", () => {
    const index = parseInt(document.getElementById("index-1d").value);
    const value = document.getElementById("value-1d").value.trim();

    if (isNaN(index) || index < 0 || index > arr1D.length) {
        setStatus("Invalid index for insertion.", "warn");
        return;
    }

    if (!value) {
        setStatus("Enter a value before inserting.", "warn");
        return;
    }

    if (!isNumeric(value)) {
        setStatus("Only numeric values are allowed!", "error");
        return;
    }

    // Insert value
    arr1D.splice(index, 0, value);
    render1D(index);

    // Animate shifted elements
    const cells = document.querySelectorAll(".array-cell");
    for (let i = index + 1; i < cells.length; i++) {
        cells[i].classList.add("shift-right");
    }

    setStatus(`Inserted ${value} at index ${index}.`);

});


// ---------- 1D DELETE ----------
document.getElementById("btn-delete-1d").addEventListener("click", () => {
    const index = parseInt(document.getElementById("index-1d").value);

    if (isNaN(index) || index < 0 || index >= arr1D.length) {
        setStatus("Invalid index for deletion.", "warn");
        return;
    }

    const removed = arr1D.splice(index, 1);
    render1D(index);
    setStatus(`Deleted "${removed}" from index ${index}.`, "info");
});

// ---------- 2D INSERT ----------
document.getElementById("btn-insert-2d").addEventListener("click", () => {
    const r = parseInt(document.getElementById("row-2d").value);
    const c = parseInt(document.getElementById("col-2d").value);
    const value = document.getElementById("value-2d").value.trim();

if (!value) {
    setStatus("Enter a value before inserting.", "warn");
    return;
}

if (!isNumeric(value)) {
    setStatus("Only numeric values are allowed in arrays!", "error");
    return;
}


    if (isNaN(r) || isNaN(c) || !arr2D[r] || arr2D[r][c] === undefined) {
        setStatus("Invalid row/column.", "error");
        return;
    }

    arr2D[r][c] = value;
    render2D(r, c);
    setStatus(`Inserted "${value}" at (${r}, ${c}).`);
});

// ---------- 2D DELETE ----------
document.getElementById("btn-delete-2d").addEventListener("click", () => {
    const r = parseInt(document.getElementById("row-2d").value);
    const c = parseInt(document.getElementById("col-2d").value);

    if (isNaN(r) || isNaN(c) || !arr2D[r] || arr2D[r][c] === undefined) {
        setStatus("Invalid row/column.", "error");
        return;
    }

    arr2D[r][c] = "";
    render2D(r, c);
    setStatus(`Deleted value at (${r}, ${c}).`);
});

// Initial state
render1D();
