/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable linebreak-style */
const puppeteer = require('puppeteer');
const rp = require('request-promise');
const $ = require('cheerio');

module.exports = {
  async getProducts(req, res, next) {
    const { brand, page } = req.params;
    let URL = '';
    try {
      switch (brand.toString().toUpperCase()) {
        case 'SEPHORA':
          console.log(`GET PRODUCTS FROM: ${brand}`);
          URL = `https://www.sephora.com.br/maquiagem?p=${page}`;
          break;

        default:
          URL = 'http://books.toscrape.com/';
          break;
      }

      const scrape = async (url) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const result = await page.evaluate(() => {
          const products = [];
          let maker = '';
          let rating = '';
          let name = '';
          let ref = '';
          let img_src = '';
          let id = '';
          let i = 1;
          let price = '';
          let li = document.querySelector(`#add-product-${i}`);
          while (li) {
            id = li.getAttribute('data-productid');
            price = li.getAttribute('data-product-final-price');
            let div = li.querySelector(
              '.product-container > .product-infos > .product-manufacturer'
            );
            maker = div.textContent;
            div = li.querySelector('.ratings > .rating-box > .rating');
            rating = div.getAttribute('style');

            const a = li.querySelector('a');
            name = a.getAttribute('title');
            ref = a.getAttribute('href');

            const img = a.querySelector('img');
            img_src = img.getAttribute('src');

            const product = {
              id,
              name,
              maker,
              price,
              rating,
              img_src,
              ref,
            };
            li = document.querySelector(`#add-product-${i}`);
            products.push(product);
            i += 1;
          }
          return products;
        });

        browser.close();
        return result;
      };
      scrape(URL).then((value) => {
        console.log(value);
        res.status(200).json(value);
      });
    } catch (error) {
      next(error);
    }
  },
};
