var express = require("express");
var app = express();

var username = "";

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use("/resources", express.static("resources"));
app.use("/views", express.static("views"));

app.get("/", (req, res) => {
  res.render("pages/welcome");
});

app.get("/chat", checkUserName, (req, res) => {
  res.render("pages/index", { username: username });
});

app.post("/chat", (req, res) => {
  if (req.body.submit) {
    username = req.body.name;
    res.redirect("/chat");
  }
});

function checkUserName(req, res, next) {
  if (username) {
    next();
  } else {
    res.redirect("/");
  }
}

app.listen(8000);
console.log("Server is listening on port 8000");
