// Linked List Visualizer (supports four types)
// Keep naming consistent with your stack.js usage style.

(() => {
  // DOM references
  const typeSel = document.getElementById("ll-type");
  const titleEl = document.getElementById("ll-title");
  const badgeEl = document.getElementById("ll-badge");

  const inputVal = document.getElementById("ll-value");
  const inputPos = document.getElementById("ll-pos");
  const swapA = document.getElementById("ll-swap-a");
  const swapB = document.getElementById("ll-swap-b");

  const statusEl = document.getElementById("ll-status");
  const visual = document.getElementById("ll-visual");

  // buttons
  const btnInsFront = document.getElementById("btn-ins-front");
  const btnInsRear = document.getElementById("btn-ins-rear");
  const btnInsPos = document.getElementById("btn-ins-pos");
  const btnDelFront = document.getElementById("btn-del-front");
  const btnDelRear = document.getElementById("btn-del-rear");
  const btnDelPos = document.getElementById("btn-del-pos");
  const btnReverse = document.getElementById("btn-reverse");
  const btnSwap = document.getElementById("btn-swap");
  const btnSortAsc = document.getElementById("btn-sort-asc");
  const btnSortDesc = document.getElementById("btn-sort-desc");
  const btnReset = document.getElementById("btn-reset");

  // Linked list representation: we'll use an internal array of node objects,
  // and manage linkage semantics depending on selected type.
  // Node: { val: string, id: unique }
  let nodes = [];
  let nextId = 1;

  function setStatus(msg, type = "info") {
    statusEl.textContent = msg;
    // color hint if desired
    if (type === "error") statusEl.style.setProperty("--dot-color", "#ef4444");
    else if (type === "warn") statusEl.style.setProperty("--dot-color", "#f97316");
    else statusEl.style.setProperty("--dot-color", "#22c55e");
  }

  function getType() {
    return typeSel.value; // "singly", "circular-singly", "doubly", "circular-doubly"
  }

  function updateTitle() {
    const t = getType();
    const map = {
      "singly": "Singly Linked List",
      "circular-singly": "Circular Singly Linked List",
      "doubly": "Doubly Linked List",
      "circular-doubly": "Circular Doubly Linked List"
    };
    titleEl.textContent = map[t];
    badgeEl.textContent = `Type: ${t.replace('-', ' ')}`;
  }

  // Rendering: show nodes horizontally with arrows; if circular, show loop arrow at end
  function render() {
    visual.innerHTML = "";
    if (nodes.length === 0) {
      setStatus("Linked list is empty. Add nodes to begin.");
      return;
    }

    nodes.forEach((n, idx) => {
      const nodeEl = document.createElement("div");
      nodeEl.className = "ll-node";
      if (idx === 0) nodeEl.classList.add("ll-head");
      if (idx === nodes.length - 1) nodeEl.classList.add("ll-tail");

      nodeEl.dataset.id = n.id;
      nodeEl.innerHTML = `<div>${n.val}</div><div class="ptr"></div>`;
      visual.appendChild(nodeEl);

      // arrow (except after last element unless we want to show circular marker)
      if (idx !== nodes.length - 1) {
        const arrow = document.createElement("div");
        arrow.className = "ll-arrow";
        visual.appendChild(arrow);
      }
    });

    // if circular, show a small loop marker after tail
    const t = getType();
    if (t === "circular-singly" || t === "circular-doubly") {
      const loopContainer = document.createElement("div");
      loopContainer.style.display = "flex";
      loopContainer.style.alignItems = "center";
      loopContainer.style.gap = "10px";

      const arrow = document.createElement("div");
      arrow.className = "ll-arrow";
      arrow.style.width = "26px";
      arrow.style.opacity = "0.6";
      loopContainer.appendChild(arrow);

      const loopText = document.createElement("div");
      loopText.className = "small-muted";
      loopText.textContent = "↺ (loop to head)";
      loopContainer.appendChild(loopText);

      visual.appendChild(loopContainer);
    }

    setStatus(`Rendered ${nodes.length} node(s).`);
  }

  /* --- Core operations on 'nodes' array --- */
  function createNode(val) {
    return { val: String(val), id: String(nextId++) };
  }

  function insertFront(val) {
    nodes.unshift(createNode(val));
    render();
    setStatus(`Inserted ${val} at front.`, "info");
  }

  function insertRear(val) {
    nodes.push(createNode(val));
    render();
    setStatus(`Inserted ${val} at rear.`, "info");
  }

  function insertAt(val, pos) {
    if (pos < 1) { setStatus("Position must be >= 1", "warn"); return; }
    const idx = Math.min(nodes.length, pos - 1);
    nodes.splice(idx, 0, createNode(val));
    render();
    setStatus(`Inserted ${val} at position ${pos}.`, "info");
  }

  function deleteFront() {
    if (nodes.length === 0) { setStatus("List empty: nothing to delete.", "warn"); return; }
    const removed = nodes.shift();
    render();
    setStatus(`Deleted front node (${removed.val}).`, "info");
  }

  function deleteRear() {
    if (nodes.length === 0) { setStatus("List empty: nothing to delete.", "warn"); return; }
    const removed = nodes.pop();
    render();
    setStatus(`Deleted rear node (${removed.val}).`, "info");
  }

  function deleteAt(pos) {
    if (nodes.length === 0) { setStatus("List empty: nothing to delete.", "warn"); return; }
    if (pos < 1 || pos > nodes.length) { setStatus("Position out of range.", "warn"); return; }
    const removed = nodes.splice(pos - 1, 1)[0];
    render();
    setStatus(`Deleted node at position ${pos} (${removed.val}).`, "info");
  }

  function reverseList() {
    nodes.reverse();
    render();
    setStatus("List reversed.", "info");
  }

  function swapNodes(a, b) {
    // swap by positions (1-based)
    if (a === b) { setStatus("Positions are same — nothing to swap.", "warn"); return; }
    if (a < 1 || b < 1 || a > nodes.length || b > nodes.length) { setStatus("Swap positions out of range.", "warn"); return; }
    const ai = a - 1, bi = b - 1;
    const tmp = nodes[ai];
    nodes[ai] = nodes[bi];
    nodes[bi] = tmp;
    render();
    setStatus(`Swapped nodes at positions ${a} and ${b}.`, "info");
  }

  function sortList(ascending = true) {
    // treat node values as numbers if possible, otherwise strings
    const numeric = nodes.every(n => !isNaN(Number(n.val)));
    if (numeric) {
      nodes.sort((x, y) => ascending ? (Number(x.val) - Number(y.val)) : (Number(y.val) - Number(x.val)));
    } else {
      nodes.sort((x, y) => ascending ? x.val.localeCompare(y.val) : y.val.localeCompare(x.val));
    }
    render();
    setStatus(`Sorted nodes in ${ascending ? "ascending" : "descending"} order.`, "info");
  }

  function resetList() {
    nodes = [];
    nextId = 1;
    render();
    setStatus("List reset to empty.");
  }

  /* --- Event wiring --- */
  typeSel.addEventListener("change", () => {
    updateTitle();
    render(); // same data, may show loop indicator
  });

  btnInsFront.addEventListener("click", () => {
    const v = inputVal.value.trim();
    if (!v) { setStatus("Enter a value before inserting.", "warn"); inputVal.focus(); return; }
    insertFront(v);
    inputVal.value = "";
  });

  btnInsRear.addEventListener("click", () => {
    const v = inputVal.value.trim();
    if (!v) { setStatus("Enter a value before inserting.", "warn"); inputVal.focus(); return; }
    insertRear(v);
    inputVal.value = "";
  });

  btnInsPos.addEventListener("click", () => {
    const v = inputVal.value.trim();
    const p = Number(inputPos.value);
    if (!v) { setStatus("Enter a value to insert.", "warn"); inputVal.focus(); return; }
    if (!p || p < 1) { setStatus("Enter a valid 1-based position.", "warn"); inputPos.focus(); return; }
    insertAt(v, p);
    inputVal.value = "";
    inputPos.value = "";
  });

  btnDelFront.addEventListener("click", () => deleteFront());
  btnDelRear.addEventListener("click", () => deleteRear());

  btnDelPos.addEventListener("click", () => {
    const p = Number(inputPos.value);
    if (!p || p < 1) { setStatus("Enter a valid 1-based position to delete.", "warn"); inputPos.focus(); return; }
    deleteAt(p);
    inputPos.value = "";
  });

  btnReverse.addEventListener("click", () => reverseList());

  btnSwap.addEventListener("click", () => {
    const a = Number(swapA.value);
    const b = Number(swapB.value);
    if (!a || !b) { setStatus("Enter two valid positions to swap.", "warn"); return; }
    swapNodes(a, b);
    swapA.value = ""; swapB.value = "";
  });

  btnSortAsc.addEventListener("click", () => sortList(true));
  btnSortDesc.addEventListener("click", () => sortList(false));
  btnReset.addEventListener("click", () => resetList());

  // allow Enter on value to add to rear
  inputVal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnInsRear.click();
  });

  // initial UI
  updateTitle();
  setStatus("Linked list is empty. Choose a type and add nodes.");
  render();

  // Notes: structural behaviors for circular/doubly are purely visual here
  // (circular shows loop icon; doubly would be conceptually supported if you
  // want to implement prev pointers later). For visual parity and all operations,
  // using the nodes array is consistent and supports all requested operations.
})();
