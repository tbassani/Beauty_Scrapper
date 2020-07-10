/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
const puppeteer = require('puppeteer');

module.exports = {
  async getProducts(req, res, next) {
    try {
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  },
};
