const PORT = process.env.PORT || 3000;
const GAMES = ["snaek", "maze", "maze3d", "maze3dGoT"];
const ENV = process.env.NODE_ENV || "localhost"; // 'production' in production

let express = require("express"),
  app = express();
isProduction = ENV === "production";

// set the view engine to ejs
app.set("view engine", "ejs");

// set the public folder
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home", { isProduction: isProduction });
});

app.get("/game/:game?", function (req, res) {
  var game = req.params.game;
  if (GAMES.indexOf(game) >= 0) {
    res.render(game, { isProduction: isProduction });
  } else {
    res.send("Game: " + game + " doesn't exists");
  }
});

app.get("/game/snaek", function (req, res) {
  res.render("snaek", { isProduction: isProduction });
});

app.get("/game/maze", function (req, res) {
  res.render("maze", { isProduction: isProduction });
});

app.get("/game/maze3d", function (req, res) {
  res.render("maze3d", { isProduction: isProduction });
});

app.get("/game/maze3dGoT", function (req, res) {
  res.render("maze3dGoT", { isProduction: isProduction });
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
