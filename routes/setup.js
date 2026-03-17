const express = require("express");
const router = express.Router();

router.get("/start", (req, res) => {
  res.render("start");
});
router.post("/startSubmit", (req, res) => {
  serverUtils.initApp(req, res, fs);
});

router.get("/start/Read", (req, res) => {
  let data = fs.readFileSync("data.json", "utf8");
  res.send(JSON.parse(data));
});

router.get('/start/edit', (req, res) => {
  const obj = {
    data: JSON.parse(fs.readFileSync("data.json", "utf8"))
  };
  res.render('startedit', obj);
});

module.exports = router;