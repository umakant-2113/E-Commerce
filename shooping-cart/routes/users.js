/** @format */

var express = require("express");
var router = express.Router();
var User = require(`../models/User`);
var multer = require(`multer`);
var Product = require(`../models/Product`);

/* GET users listing. */
router.get("/", function (req, res, next) {});

// render user sign-up form

router.get(`/register`, (req, res, next) => {
  res.render(`register`);
});

// render login form

router.get(`/login`, (req, res, next) => {
  let info = req.flash(`info`)[0];
  res.render(`login`, { info });
});

// get user register

router.post(`/register`, (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) return next(err);
    // console.log(err, user);
    res.redirect(`/users/login`);
  });
});

// get user login

router.post(`/login`, (req, res, next) => {
  let { email, password } = req.body;

  // no email or password
  if (!email || !password) {
    req.flash(`info`, `email/password is required`);
    return res.redirect(`/users/login`);
  }

  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    // user as null

    if (!user) {
      req.flash(`info`, `you are register`);

      return res.redirect(`/users/login`);
    }

    if (user.isBlock === false) {
      // compare password
      user.verifyPassword(password, (err, result) => {
        if (err) return next(err);

        // result as false
        if (!result) {
          req.flash(`info`, `invalid password`);

          return res.redirect(`/users/login`);
        }
        // persist session
        req.session.userId = user.id;
        // console.log(err, user);
        if (user.isAdmin) {
          return res.redirect(`/`);
        } else {
          res.redirect(`/`);
        }
      });
    } else {
      req.flash(`info`, `you are blocked`);
      res.redirect(`/users/login`);
    }
  });
});

// block user
router.get(`/:id/block`, (req, res, next) => {
  let id = req.params.id;
  req.body.isBlock = true;
  User.findByIdAndUpdate(id, req.body, { new: true }, (err, user) => {
    if (err) return next(err);
    res.redirect(`/`);
  });
});

// unblock user

router.get(`/:id/unblock`, (req, res, next) => {
  let id = req.params.id;
  req.body.isBlock = false;
  User.findByIdAndUpdate(id, req.body, { new: true }, (err, user) => {
    if (err) return next(err);
    res.redirect(`/`);
  });
});
// logout

router.get(`/logout`, (req, res, next) => {
  req.session.destroy();
  res.clearCookie(`connect.sid`);

  res.redirect(`/users/login`);
});
module.exports = router;
