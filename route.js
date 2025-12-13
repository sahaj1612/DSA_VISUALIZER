const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/array", (req, res) => {
  res.render("array")
});

app.get("/string", (req, res) => {
  res.render("string")
});

app.get("/stack", (req, res) => {
  res.render("stack");
});

app.get("/queue", (req, res) => {
  res.render("queue");
});

app.get("/linked_list", (req, res) => {
  res.render("linkedlist");
});

app.get("/tree", (req, res) => {
  res.render("tree");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
