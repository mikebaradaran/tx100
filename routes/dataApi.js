const express = require("express");
const router = express.Router();

module.exports = function (serverUtils) {

  // -------------------------
  // Customers
  // -------------------------
  router.get("/customers", (req, res) => {
    res.send(serverUtils.getCustomers());
  });

  router.get("/customers/:id", (req, res) => {
    const id = req.params.id.toLowerCase();
    const customers = serverUtils.getCustomers();
    const data = customers.filter(
      c => c.CustomerID.toLowerCase() === id
    );
    res.send(data);
  });

  // -------------------------
  // Orders
  // -------------------------
  router.get("/orders", (req, res) => {
    res.send(serverUtils.getOrders());
  });

  router.get("/orders/:id", (req, res) => {
    const id = req.params.id.toLowerCase();
    const orders = serverUtils.getOrders();
    const data = orders.filter(
      o => o.CustomerID.toLowerCase() === id
    );
    res.send(data);
  });

  // -------------------------
  // Products
  // -------------------------
  router.get("/products", (req, res) => {
    res.send(serverUtils.getProducts());
  });

  return router;
};