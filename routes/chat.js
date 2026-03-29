const express = require("express");
const router = express.Router();

module.exports = function ({ doTrainerCommand }) {

  router.get("/student", (req, res) => {
    res.render("chat_message_entry");
  });

  router.get("/trainer", (req, res) => {
    res.render("chat_messages");
  });

  router.get("/admin", (req, res) => {
    res.render("admin");
  });

  router.get("/clear", (req, res) => {
    doTrainerCommand({ name: "trainer", body: "clear" });
    res.render("index");
  });

  return router;
};