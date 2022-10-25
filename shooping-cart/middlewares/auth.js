/** @format */
let User = require(`../models/User`);
let Cart = require(`../models/Cart`);
module.exports = {
  loggedInUser: (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.redirect(`/users/login`);
    }
  },
  userInfo: (req, res, next) => {
    var userId = req.session && req.session.userId;
    if (userId) {
      User.findById(userId, "name email isAdmin", (err, user) => {
        if (err) return next(err);

        Cart.findOne({ userId }, (err, cartCount) => {
          if (err) return next(err);
          // console.log(err, cartCount, `ccccccc`);

          let totalItem = 0;
          if (cartCount) {
            cartCount.productList.forEach(elm => {
              totalItem += elm.quantity;
            });
          }
          req.user = user;
          res.locals.user = user;
          res.locals.cartCount = totalItem;
          next();
        });
      });
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
};
