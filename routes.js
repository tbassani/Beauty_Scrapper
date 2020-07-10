/* eslint-disable linebreak-style */
const express = require('express');

const appRoutes = express.Router();
const productsController = require('./controllers/ProductsController');

/* appRoutes
  .get('/check_token', authController.checkToken);
// TODOs
//appRoutes.use(authMiddleware); */
appRoutes.get('/products/:brand', productsController.getProducts);
// Auth

module.exports = appRoutes;
