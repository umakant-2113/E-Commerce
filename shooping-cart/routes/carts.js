/** @format */

let express = require(`express`);
let router = express.Router();

let Cart = require(`../models/Cart`);
const { rawListeners } = require("../models/Comment");

// all product of cart

router.get(`/`, async (req, res, next) => {
  let id = req.session.userId;

  Cart.findOne({ userId: id })
    .populate({
      path: `productList`,
      populate: {
        path: `productId`,
        model: "Product",
      },
    })
    .exec((err, cartObj) => {
      if (err) return next(err);
      console.log(cartObj);

      res.render(`cart`, { cartObj });
    });
});

// remove product from cart

router.get(`/:id/remove`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Cart.findOne({ userId }, (err, cartObj) => {
    if (err) return next(err);
    let itemIndex = cartObj.productList.findIndex(p => p.id == id);
    cartObj.productList.splice(itemIndex, 1);
    cartObj.save(err => {
      if (err) return next();
      res.redirect(`/carts`);
    });

    // console.log(cartObj, `iiii`);
  });
});

// update quantity

router.get(`/:id/inc`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Cart.findOne({ userId }, (err, cartObj) => {
    if (err) return next(err);
    console.log(err, cartObj, `inc`);
    let itemIndex = cartObj.productList.findIndex(p => p.id === id);
    cartObj.productList[itemIndex].quantity += 1;
    cartObj.save(err => {
      if (err) return next(err);
      res.redirect(`/carts`);
    });
  });
});

// decrease product quantity

router.get(`/:id/dec`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Cart.findOne({ userId }, (err, cartObj) => {
    if (err) return next(err);
    let itemIndex = cartObj.productList.findIndex(p => p.id === id);
    cartObj.productList[itemIndex].quantity -= 1;
    cartObj.save(err => {
      if (err) return next(err);
      res.redirect(`/carts`);
    });
  });
});

module.exports = router;
