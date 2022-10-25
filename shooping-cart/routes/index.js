/** @format */

var express = require("express");
const Product = require("../models/Product");
var User = require(`../models/User`);
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.user) {
    if (req.user.isAdmin) {
      User.find({ isAdmin: false }, (err, users) => {
        if (err) return next(err);
        return res.render(`adminDashBoard`, {
          users,
        });
      });
      // console.log(err, products, uniqueCategory, `adming`);
    } else {
      res.render(`index`);
    }
  } else {
    res.render("index", { title: "Express" });
  }
});

module.exports = router;
