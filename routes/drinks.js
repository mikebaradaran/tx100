const express = require("express");
const router = express.Router();

module.exports = () => {

  // GET version: querystring
  router.get("/", (req, res) => {
    const { drink, milk, sugar } = req.query;
    res.send(`You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
  });

  // POST version: form body
  router.post("/", (req, res) => {
    const { drink, milk, sugar } = req.body;
    res.send(`POSTed: You ordered a ${drink} with milk: ${milk}, sugar: ${sugar}`);
  });

  return router;
};