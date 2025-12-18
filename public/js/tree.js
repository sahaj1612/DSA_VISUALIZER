/* single JS file implementing:
   - view switching tabs
   - General Tree, BST, AVL, B-Tree, Trie
   - arrowed SVG connectors between parent and child nodes
*/

/* ---------- UTIL: SVG overlay & connectors ---------- */

function ensureOverlay(areaEl) {
  // find or create <svg class="overlay"> inside the .tree-area
  let svg = areaEl.querySelector('svg.overlay');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'overlay');
    svg.setAttribute('preserveAspectRatio', 'none');
    // add defs for arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L10,4 L0,8 z" fill="${getComputedStyle(document.documentElement).getPropertyValue('--connector-color') || '#10b981'}"></path>
      </marker>
    `;
    svg.appendChild(defs);
    areaEl.appendChild(svg);
  }
  // ensure svg sized to area
  svg.setAttribute('width', areaEl.clientWidth);
  svg.setAttribute('height', areaEl.clientHeight);
  return svg;
}

function clearOverlay(svg) {
  // remove all connectors (keep defs)
  [...svg.querySelectorAll('g.connector-group')].forEach(g => g.remove());
}

function createConnector(svg, x1, y1, x2, y2) {
  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('class', 'connector-group');

  // shadow (optional but keeps your UI depth)
  const shadow = document.createElementNS(svg.namespaceURI, 'line');
  shadow.setAttribute('class', 'connector-shadow');
  shadow.setAttribute('x1', x1);
  shadow.setAttribute('y1', y1);
  shadow.setAttribute('x2', x2);
  shadow.setAttribute('y2', y2);
  g.appendChild(shadow);

  // main diagonal connector
  const line = document.createElementNS(svg.namespaceURI, 'line');
  line.setAttribute('class', 'connector');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('marker-end', 'url(#arrowhead)');
  g.appendChild(line);

  svg.appendChild(g);
  return g;
}

function drawConnectionsForArea(areaEl, connections) {
  // connections: array of { parentEl, childEl }
  const svg = ensureOverlay(areaEl);
  clearOverlay(svg);
  if (connections.length === 0) return;
  // we need the svg's coordinate space to match areaEl content:
  // svg is absolute positioned inside areaEl (same dimensions).
  const areaRect = areaEl.getBoundingClientRect();

  connections.forEach(({ parentEl, childEl }) => {
    if (!parentEl || !childEl) return;
    const p = parentEl.getBoundingClientRect();
    const c = childEl.getBoundingClientRect();
    // coordinates relative to areaEl (center bottom of parent -> center top of child)
    const x1 = (p.left + p.right) / 2 - areaRect.left + areaEl.scrollLeft;
    const y1 = p.bottom - areaRect.top + areaEl.scrollTop; // bottom of parent
    const x2 = (c.left + c.right) / 2 - areaRect.left + areaEl.scrollLeft;
    const y2 = c.top - areaRect.top + areaEl.scrollTop; // top of child

    createConnector(svg, x1, y1, x2, y2);
  });
}

/* Re-draw connectors on window resize so lines remain aligned */
window.addEventListener('resize', () => {
  // throttle briefly
  if (window._trees_resize_timeout) clearTimeout(window._trees_resize_timeout);
  window._trees_resize_timeout = setTimeout(() => {
    document.querySelectorAll('.tree-area').forEach(area => {
      // call renderConnectedForArea if stored
      const fn = area._redrawConnectors;
      if (typeof fn === 'function') fn();
    });
  }, 120);
});


/* ---------- VIEW SWITCHER ---------- */
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    document.querySelectorAll('.tree-view').forEach(tv=>{
      tv.classList.add('hidden');
    });
    document.getElementById('view-' + view).classList.remove('hidden');
    // trigger a connector redraw for the shown view
    const shownArea = document.getElementById('view-' + view).querySelector('.tree-area');
    if (shownArea && typeof shownArea._redrawConnectors === 'function') shownArea._redrawConnectors();
  });
});


/* ---------- 1. GENERAL TREE ---------- */
let gtNextId = 1;
const gtRoot = { id: 0, value: "root", children: [] };
const gtTreeEl = document.getElementById("gt-tree");
const gtValueEl = document.getElementById("gt-value");
const gtParentEl = document.getElementById("gt-parent");
const gtInsertBtn = document.getElementById("gt-insert");
const gtDeleteBtn = document.getElementById("gt-delete");
const gtResetBtn = document.getElementById("gt-reset");
const gtTraverseBtn = document.getElementById("gt-traverse");
const gtStatus = document.getElementById("gt-status");
let gtSelectedNodeId = 0;
function setGtStatus(msg){ gtStatus.textContent = msg; }
function findNodeById(node, id){ if(node.id===id) return node; for(const c of node.children){ const f=findNodeById(c,id); if(f) return f;} return null; }
function findParent(node, id){ for(const c of node.children){ if(c.id===id) return node; const d=findParent(c,id); if(d) return d;} return null; }

function renderGt(){
  const rows=[];
  const q=[{node:gtRoot, depth:0}];
  while(q.length){
    const {node,depth}=q.shift();
    rows[depth]=rows[depth]||[];
    rows[depth].push(node);
    node.children.forEach(child=>q.push({node:child, depth:depth+1}));
  }
  gtTreeEl.innerHTML='';
  const nodeElMap = new Map(); // id -> element
  rows.forEach(row=>{
    const rowEl=document.createElement('div'); rowEl.className='tree-row';
    row.forEach(node=>{
      const nEl=document.createElement('div'); nEl.className='node';
      if(node.id===gtSelectedNodeId) nEl.classList.add('highlight');
      nEl.textContent = `${node.value} [${node.id}]`;
      nEl.dataset.nodeId = String(node.id);
      nEl.onclick = ()=>{ gtSelectedNodeId = node.id; setGtStatus(`Selected node ${node.value} [${node.id}]`); renderGt(); };
      rowEl.appendChild(nEl);
      nodeElMap.set(node.id, nEl);
    });
    gtTreeEl.appendChild(rowEl);
  });

  // build connections (parent->child) and draw
  const connections = [];
  (function collect(node){
    if(!node) return;
    node.children.forEach(child=>{
      const pEl = nodeElMap.get(node.id);
      const cEl = nodeElMap.get(child.id);
      if(pEl && cEl) connections.push({ parentEl: pEl, childEl: cEl });
      collect(child);
    });
  })(gtRoot);

  // store redraw function on container (used on resize)
  const area = gtTreeEl;
  area._redrawConnectors = () => drawConnectionsForArea(area, connections);
  // small timeout to allow layout to settle (positions)
  setTimeout(()=> area._redrawConnectors(), 10);
}
gtInsertBtn.addEventListener('click', ()=>{
  const val = gtValueEl.value.trim();
  if(!val){ setGtStatus('Enter a value to insert.'); gtValueEl.focus(); return; }
  const parentIdInput = gtParentEl.value.trim();
  let parentId = gtSelectedNodeId;
  if(parentIdInput !== '') parentId = Number(parentIdInput);
  const parentNode = findNodeById(gtRoot, parentId);
  if(!parentNode){ setGtStatus('Parent not found.'); return; }
  const node = { id: gtNextId++, value: val, children: [] };
  parentNode.children.push(node);
  gtValueEl.value='';
  setGtStatus(`Inserted ${val} as child of ${parentNode.value}[${parentNode.id}]`);
  renderGt();
});
gtDeleteBtn.addEventListener('click', ()=>{
  const idStr = gtParentEl.value.trim() || String(gtSelectedNodeId);
  const id = Number(idStr);
  if(id===0){ setGtStatus('Cannot delete root.'); return; }
  const parent = findParent(gtRoot, id);
  if(!parent){ setGtStatus('Node not found.'); return; }
  parent.children = parent.children.filter(c=>c.id!==id);
  setGtStatus(`Deleted node ${id}.`);
  if(gtSelectedNodeId===id) gtSelectedNodeId = 0;
  renderGt();
});
gtResetBtn.addEventListener('click', ()=>{ gtRoot.children = []; gtNextId = 1; gtSelectedNodeId = 0; setGtStatus('Tree reset.'); renderGt(); });
gtTraverseBtn.addEventListener('click', ()=>{ const res=[]; (function preorder(n){ res.push(`${n.value}[${n.id}]`); n.children.forEach(preorder); })(gtRoot); setGtStatus('Preorder: '+res.join(' → ')); });
renderGt(); setGtStatus('Ready. Root selected.');


/* ---------- 2. BST ---------- */
let bstRoot = null;
let _bstUid = 1;
function ensureUid(node){
  if(!node) return;
  if(!node._uid) node._uid = _bstUid++;
}
const bstTreeEl = document.getElementById("bst-tree");
const bstValueEl = document.getElementById("bst-value");
const bstInsertBtn = document.getElementById("bst-insert");
const bstDeleteBtn = document.getElementById("bst-delete");
const bstSearchBtn = document.getElementById("bst-search");
const bstTraverseBtn = document.getElementById("bst-traverse");
const bstResetBtn = document.getElementById("bst-reset");
const bstStatus = document.getElementById("bst-status");
function setBstStatus(m){ bstStatus.textContent = m; }
function insertNode(root, val){ if(!root) return { val, left:null, right:null, _uid: _bstUid++ }; if(val < root.val) root.left = insertNode(root.left, val); else root.right = insertNode(root.right, val); return root; }
function findMin(node){ while(node.left) node = node.left; return node; }
function deleteNode(root, val){
  if(!root) return null;
  if(val < root.val) root.left = deleteNode(root.left, val);
  else if(val > root.val) root.right = deleteNode(root.right, val);
  else {
    if(!root.left && !root.right) return null;
    if(!root.left) return root.right;
    if(!root.right) return root.left;
    const succ = findMin(root.right);
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}
function searchNode(root, val){ while(root){ if(val === root.val) return true; root = val < root.val ? root.left : root.right; } return false; }
function inorder(root, out=[]){ if(!root) return out; inorder(root.left,out); out.push(root.val); inorder(root.right,out); return out; }

function layoutLevelsBST(root){
  const rows=[]; const q=[{n:root, depth:0}];
  while(q.length){
    const {n,depth} = q.shift();
    if(!n) continue;
    rows[depth] = rows[depth] || []; rows[depth].push(n);
    q.push({n:n.left, depth:depth+1}); q.push({n:n.right, depth:depth+1});
  }
  return rows;
}

function renderBst(){
  bstTreeEl.innerHTML='';
  if(!bstRoot){ bstTreeEl.innerHTML = "<div style='color:var(--text-soft)'>Tree is empty.</div>"; return; }
  const rows = layoutLevelsBST(bstRoot);
  const nodeMap = new Map(); // uid->element

  rows.forEach(row=>{
    const rowEl = document.createElement('div'); rowEl.className = 'tree-row';
    row.forEach(node=>{
      ensureUid(node);
      const nEl = document.createElement('div'); nEl.className = 'node';
      nEl.textContent = node.val;
      nEl.dataset.uid = node._uid;
      rowEl.appendChild(nEl);
      nodeMap.set(node._uid, nEl);
    });
    bstTreeEl.appendChild(rowEl);
  });

  // collect parent-child connections by traversing nodes
  const connections = [];
  (function collect(node){
    if(!node) return;
    if(node.left && nodeMap.get(node._uid) && nodeMap.get(node.left._uid)) connections.push({ parentEl: nodeMap.get(node._uid), childEl: nodeMap.get(node.left._uid) });
    if(node.right && nodeMap.get(node._uid) && nodeMap.get(node.right._uid)) connections.push({ parentEl: nodeMap.get(node._uid), childEl: nodeMap.get(node.right._uid) });
    collect(node.left); collect(node.right);
  })(bstRoot);

  const area = bstTreeEl;
  area._redrawConnectors = () => drawConnectionsForArea(area, connections);
  setTimeout(()=> area._redrawConnectors(), 10);
}

bstInsertBtn.addEventListener('click', ()=>{
  const v = Number(bstValueEl.value);
  if(!bstValueEl.value){ setBstStatus('Enter a numeric value.'); bstValueEl.focus(); return; }
  bstRoot = insertNode(bstRoot, v);
  setBstStatus(`Inserted ${v}.`);
  bstValueEl.value='';
  renderBst();
});
bstDeleteBtn.addEventListener('click', ()=>{
  const v = Number(bstValueEl.value);
  if(!bstValueEl.value){ setBstStatus('Enter value to delete.'); bstValueEl.focus(); return; }
  if(!searchNode(bstRoot, v)){ setBstStatus('Value not found.'); return; }
  bstRoot = deleteNode(bstRoot, v);
  setBstStatus(`Deleted ${v}.`);
  bstValueEl.value='';
  renderBst();
});
bstSearchBtn.addEventListener('click', ()=>{
  const v = Number(bstValueEl.value);
  if(!bstValueEl.value){ setBstStatus('Enter value to search.'); bstValueEl.focus(); return; }
  const found = searchNode(bstRoot, v);
  setBstStatus(found ? `Found ${v} in tree.` : `Value ${v} not found.`);
});
bstTraverseBtn.addEventListener('click', ()=>{ setBstStatus('In-order: ' + inorder(bstRoot).join(', ')); });
bstResetBtn.addEventListener('click', ()=>{ bstRoot = null; setBstStatus('Tree reset.'); renderBst(); });
renderBst();


/* ---------- 3. AVL ---------- */
let avlRoot = null;
let _avlUid = 1;

function ensureAvlUid(node) { 
  if (!node) return; 
  if (!node._uid) node._uid = _avlUid++; 
}

function height(n) { return n ? n.h : 0; }

function update(n) { 
  if (n) n.h = 1 + Math.max(height(n.left), height(n.right)); 
}

function balanceFactor(n) { 
  return n ? height(n.left) - height(n.right) : 0; 
}

function rotateRight(y) { 
  const x = y.left; 
  const T2 = x.right; 
  x.right = y; 
  y.left = T2; 
  update(y); 
  update(x); 
  return x; 
}

function rotateLeft(x) { 
  const y = x.right; 
  const T2 = y.left; 
  y.left = x; 
  x.right = T2; 
  update(x); 
  update(y); 
  return y; 
}

function avlInsert(node, key) { 
  if (!node) return { val: key, left: null, right: null, h: 1, _uid: _avlUid++ }; 
  if (key < node.val) node.left = avlInsert(node.left, key); 
  else if (key > node.val) node.right = avlInsert(node.right, key); 
  else return node; // Duplicate keys not allowed

  update(node); 
  const bf = balanceFactor(node); 
  
  // Left Left Case
  if (bf > 1 && key < node.left.val) return rotateRight(node); 
  // Right Right Case
  if (bf < -1 && key > node.right.val) return rotateLeft(node); 
  // Left Right Case
  if (bf > 1 && key > node.left.val) { 
    node.left = rotateLeft(node.left); 
    return rotateRight(node); 
  } 
  // Right Left Case
  if (bf < -1 && key < node.right.val) { 
    node.right = rotateRight(node.right); 
    return rotateLeft(node); 
  } 
  return node; 
}

function avlMinValueNode(n) { 
  let cur = n; 
  while (cur.left) cur = cur.left; 
  return cur; 
}

function avlDelete(node, key) {
  if (!node) return node;
  if (key < node.val) node.left = avlDelete(node.left, key);
  else if (key > node.val) node.right = avlDelete(node.right, key);
  else {
    if (!node.left || !node.right) {
      node = node.left ? node.left : node.right;
    } else {
      const temp = avlMinValueNode(node.right);
      node.val = temp.val;
      node.right = avlDelete(node.right, temp.val);
    }
  }
  if (!node) return node;

  update(node);
  const bf = balanceFactor(node);
  if (bf > 1 && balanceFactor(node.left) >= 0) return rotateRight(node);
  if (bf > 1 && balanceFactor(node.left) < 0) { 
    node.left = rotateLeft(node.left); 
    return rotateRight(node); 
  }
  if (bf < -1 && balanceFactor(node.right) <= 0) return rotateLeft(node);
  if (bf < -1 && balanceFactor(node.right) > 0) { 
    node.right = rotateRight(node.right); 
    return rotateLeft(node); 
  }
  return node;
}

const avlTreeEl = document.getElementById("avl-tree");
const avlValueEl = document.getElementById("avl-value");
const avlInsertBtn = document.getElementById("avl-insert");
const avlDeleteBtn = document.getElementById("avl-delete");
const avlTraverseBtn = document.getElementById("avl-traverse");
const avlResetBtn = document.getElementById("avl-reset");
const avlStatus = document.getElementById("avl-status");

function setAvlStatus(m) { avlStatus.textContent = m; }

function renderAvl() {
  avlTreeEl.innerHTML = '';
  if (!avlRoot) { 
    avlTreeEl.innerHTML = "<div style='color:var(--text-soft); padding: 20px;'>Tree is empty.</div>"; 
    return; 
  }

  // Use a proper level-order traversal for layout
  const rows = []; 
  const q = [{ n: avlRoot, depth: 0 }];
  while (q.length) { 
    const { n, depth } = q.shift(); 
    if (!n) continue;
    rows[depth] = rows[depth] || []; 
    rows[depth].push(n); 
    q.push({ n: n.left, depth: depth + 1 }); 
    q.push({ n: n.right, depth: depth + 1 }); 
  }

  const nodeMap = new Map();
  rows.forEach(row => {
    const rowEl = document.createElement('div'); 
    rowEl.className = 'tree-row';
    row.forEach(node => {
      ensureAvlUid(node);
      const nEl = document.createElement('div'); 
      nEl.className = 'node';
      nEl.textContent = node.val;
      // Added tooltip for height
      nEl.title = `Height: ${node.h}`;
      nEl.dataset.uid = node._uid;
      rowEl.appendChild(nEl);
      nodeMap.set(node._uid, nEl);
    });
    avlTreeEl.appendChild(rowEl);
  });

  const connections = [];
  const collectConnections = (node) => {
    if (!node) return;
    if (node.left && nodeMap.has(node._uid) && nodeMap.has(node.left._uid)) {
      connections.push({ parentEl: nodeMap.get(node._uid), childEl: nodeMap.get(node.left._uid) });
    }
    if (node.right && nodeMap.has(node._uid) && nodeMap.has(node.right._uid)) {
      connections.push({ parentEl: nodeMap.get(node._uid), childEl: nodeMap.get(node.right._uid) });
    }
    collectConnections(node.left);
    collectConnections(node.right);
  };
  collectConnections(avlRoot);

  const area = avlTreeEl;
  area._redrawConnectors = () => drawConnectionsForArea(area, connections);
  
  // Force a small delay to ensure DOM is painted before drawing lines
  requestAnimationFrame(() => {
    setTimeout(() => area._redrawConnectors(), 50);
  });
}

avlInsertBtn.addEventListener('click', () => {
  const v = parseInt(avlValueEl.value);
  if (isNaN(v)) { setAvlStatus('Enter a valid number.'); avlValueEl.focus(); return; }
  avlRoot = avlInsert(avlRoot, v);
  setAvlStatus(`Inserted ${v}.`);
  avlValueEl.value = '';
  renderAvl();
});

avlDeleteBtn.addEventListener('click', () => {
  const v = parseInt(avlValueEl.value);
  if (isNaN(v)) { setAvlStatus('Enter value to delete.'); avlValueEl.focus(); return; }
  avlRoot = avlDelete(avlRoot, v);
  setAvlStatus(`Deleted ${v}.`);
  avlValueEl.value = '';
  renderAvl();
});

avlTraverseBtn.addEventListener('click', () => { 
    const res = [];
    const inorder = (n) => { if(n){ inorder(n.left); res.push(n.val); inorder(n.right); } };
    inorder(avlRoot);
    setAvlStatus('In-order: ' + res.join(', ')); 
});

avlResetBtn.addEventListener('click', () => { 
    avlRoot = null; 
    setAvlStatus('Tree reset.'); 
    renderAvl(); 
});

// Initialize rendering
renderAvl();


/* ---------- 4. B-TREE (t=2) ---------- */
class BNode {
  constructor(leaf = true) { this.keys = []; this.children = []; this.leaf = leaf; this._uid = null; }
}
class BTree {
  constructor(t=2){ this.t = t; this.root = new BNode(true); this._uid = 1; }
  assignUids(node){
    if(!node) return;
    if(!node._uid) node._uid = this._uid++;
    node.children.forEach(c => this.assignUids(c));
  }
  splitChild(parent, i){
    const t = this.t;
    const y = parent.children[i];
    const z = new BNode(y.leaf);
    z.keys = y.keys.splice(t); // move last t-1 keys
    const mid = y.keys.pop(); // middle key
    if(!y.leaf) z.children = y.children.splice(t);
    parent.children.splice(i+1, 0, z);
    parent.keys.splice(i, 0, mid);
  }
  insertNonFull(x, k){
    let i = x.keys.length - 1;
    if(x.leaf){
      while(i >= 0 && k < x.keys[i]) i--;
      x.keys.splice(i+1, 0, k);
    } else {
      while(i >= 0 && k < x.keys[i]) i--;
      i++;
      if(x.children[i].keys.length === 2*this.t - 1){
        this.splitChild(x, i);
        if(k > x.keys[i]) i++;
      }
      this.insertNonFull(x.children[i], k);
    }
  }
  insert(k){
    const r = this.root;
    if(r.keys.length === 2*this.t - 1){
      const s = new BNode(false);
      this.root = s;
      s.children.push(r);
      this.splitChild(s, 0);
      this.insertNonFull(s, k);
    } else this.insertNonFull(r, k);
  }
}

const bt = new BTree(2);
const btTreeEl = document.getElementById("bt-tree");
const btValueEl = document.getElementById("bt-value");
const btInsertBtn = document.getElementById("bt-insert");
const btTraverseBtn = document.getElementById("bt-traverse");
const btResetBtn = document.getElementById("bt-reset");
const btStatus = document.getElementById("bt-status");
function setBtStatus(m){ btStatus.textContent = m; }

function renderBTree(){
  // ensure uids
  bt.assignUids(bt.root);

  btTreeEl.innerHTML='';
  const rows = [];
  const q = [{ node: bt.root, depth: 0 }];
  const nodeMap = new Map();
  while (q.length) {
    const {node, depth} = q.shift();
    rows[depth] = rows[depth] || [];
    rows[depth].push(node);
    if (!node.leaf) node.children.forEach(c => q.push({ node: c, depth: depth + 1 }));
  }
  rows.forEach(level=>{
    const rowEl = document.createElement('div'); rowEl.className='tree-row';
    level.forEach(node=>{
      const nEl = document.createElement('div'); nEl.className='node'; nEl.style.minWidth='120px';
      nEl.dataset.uid = node._uid;
      nEl.innerHTML = node.keys.map(k=>`<div style="padding:4px 6px; border-bottom:1px dashed rgba(0,0,0,0.06)">${k}</div>`).join('');
      rowEl.appendChild(nEl);
      nodeMap.set(node._uid, nEl);
    });
    btTreeEl.appendChild(rowEl);
  });

  // connections: each parent node connects to its children nodes (node.children -> child nodes)
  const connections = [];
  (function collect(node){
    if(!node) return;
    node.children.forEach(child=>{
      const pEl = nodeMap.get(node._uid);
      const cEl = nodeMap.get(child._uid);
      if(pEl && cEl) connections.push({ parentEl: pEl, childEl: cEl });
      collect(child);
    });
  })(bt.root);

  const area = btTreeEl;
  area._redrawConnectors = () => drawConnectionsForArea(area, connections);
  setTimeout(()=> area._redrawConnectors(), 10);
}

btInsertBtn.addEventListener('click', ()=>{
  const v = Number(btValueEl.value);
  if(!btValueEl.value){ setBtStatus('Enter value to insert.'); btValueEl.focus(); return; }
  bt.insert(v); setBtStatus(`Inserted ${v}.`); btValueEl.value=''; renderBTree();
});
btTraverseBtn.addEventListener('click', ()=>{
  const res=[];
  (function dfs(n){ if(!n) return; n.keys.forEach(k=>res.push(k)); n.children.forEach(c=>dfs(c)); })(bt.root);
  setBtStatus('Keys: ' + res.join(', '));
});
btResetBtn.addEventListener('click', ()=>{ bt.root = new BNode(true); bt._uid = 1; setBtStatus('B-tree reset.'); renderBTree(); });
renderBTree();


/* ---------- 5. TRIE ---------- */
class TrieNode {
  constructor(ch=''){ this.ch = ch; this.children = {}; this.end = false; this._uid = null; }
}
class Trie {
  constructor(){ this.root = new TrieNode(); this._uid = 1; }
  assignUids(node){ if(!node) return; if(!node._uid) node._uid = this._uid++; Object.values(node.children).forEach(c => this.assignUids(c)); }
  insert(word){ let cur = this.root; for(const c of word){ if(!cur.children[c]) cur.children[c] = new TrieNode(c); cur = cur.children[c]; } cur.end = true; }
  search(word){ let cur = this.root; for(const c of word){ if(!cur.children[c]) return false; cur = cur.children[c]; } return cur.end === true; }
  startsWith(prefix){ let cur = this.root; for(const c of prefix){ if(!cur.children[c]) return false; cur = cur.children[c]; } return true; }
}

const trie = new Trie();
const elTree = document.getElementById("trie-tree");
const wordEl = document.getElementById("trie-word");
const insertBtn = document.getElementById("trie-insert");
const searchBtn = document.getElementById("trie-search");
const prefixBtn = document.getElementById("trie-prefix");
const resetBtn = document.getElementById("trie-reset");
const status = document.getElementById("trie-status");
function setStatus(m){ status.textContent = m; }

function renderTrie() {
  trie.assignUids(trie.root);
  elTree.innerHTML='';
  const rows=[]; const q=[{node:trie.root, depth:0}];
  const nodeMap = new Map();
  while(q.length){
    const {node,depth} = q.shift(); rows[depth] = rows[depth] || []; rows[depth].push(node);
    Object.values(node.children).forEach(ch => q.push({node:ch, depth:depth+1}));
  }
  rows.forEach(row=>{
    const rowEl=document.createElement('div'); rowEl.className='tree-row';
    row.forEach(n=>{
      const nEl=document.createElement('div'); nEl.className='node';
      nEl.dataset.uid = n._uid;
      nEl.innerHTML = `<div>${n.ch || '·'}</div>${n.end ? '<div style="font-size:0.65rem;color:var(--text-soft)">●</div>' : ''}`;
      rowEl.appendChild(nEl);
      nodeMap.set(n._uid, nEl);
    });
    elTree.appendChild(rowEl);
  });

  const connections = [];
  (function collect(node){
    if(!node) return;
    Object.values(node.children).forEach(child => {
      const pEl = nodeMap.get(node._uid);
      const cEl = nodeMap.get(child._uid);
      if(pEl && cEl) connections.push({ parentEl: pEl, childEl: cEl });
      collect(child);
    });
  })(trie.root);

  const area = elTree;
  area._redrawConnectors = () => drawConnectionsForArea(area, connections);
  setTimeout(()=> area._redrawConnectors(), 10);
}

insertBtn.addEventListener('click', ()=>{
  const w = wordEl.value.trim();
  if(!w){ setStatus('Enter a word to insert.'); wordEl.focus(); return; }
  trie.insert(w); setStatus(`Inserted "${w}"`); wordEl.value=''; renderTrie();
});
searchBtn.addEventListener('click', ()=>{
  const w = wordEl.value.trim();
  if(!w){ setStatus('Enter a word to search.'); wordEl.focus(); return; }
  const found = trie.search(w); setStatus(found ? `Word "${w}" found.` : `Word "${w}" not found.`);
});
prefixBtn.addEventListener('click', ()=>{
  const p = wordEl.value.trim();
  if(!p){ setStatus('Enter a prefix to search.'); wordEl.focus(); return; }
  const ok = trie.startsWith(p); setStatus(ok ? `There are words starting with "${p}".` : `No words start with "${p}".`);
});
resetBtn.addEventListener('click', ()=>{ trie.root = new TrieNode(); trie._uid = 1; setStatus('Trie reset.'); renderTrie(); });
renderTrie(); setStatus('Ready.');
