/** @format */

let express = require(`express`);
let path = require(`path`);
let fs = require(`fs`);
let router = express.Router();
let Product = require(`../models/Product`);
let multer = require(`multer`);
let Comment = require(`../models/Comment`);
let Cart = require(`../models/Cart`);
let auth = require(`../middlewares/auth`);

const imagePath = path.join(__dirname, `../public/images/`);

// set storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const fileExtension = Date.now() + `_` + file.originalname;
    cb(null, fileExtension);
  },
});

const upload = multer({ storage: storage });

// all products

router.get(`/`, (req, res, next) => {
  Product.find({}, (err, products) => {
    Product.distinct(`category`, (err, uniqueCategories) => {
      if (err) return next(err);
      res.render(`products`, { products, uniqueCategories });
    });
  });
});

// add product

router.get(`/new`, auth.loggedInUser, (req, res, next) => {
  res.render(`add-product`);
});

// filter by category

router.get(`/:ctg/category`, (req, res, next) => {
  let ctg = req.params.ctg;
  Product.find({ category: ctg }, (err, products) => {
    if (err) return next(err);
    Product.distinct(`category`, (err, uniqueCategories) => {
      if (err) return next(err);
      res.render(`products`, { products, uniqueCategories });
    });
  });
});

// find single product

router.get(`/:id`, (req, res, next) => {
  let id = req.params.id;

  Product.findById(id)
    .populate({
      path: `comments`,
      populate: { path: `commenter`, model: `User` },
    })
    .exec((err, product) => {
      if (err) return next(err);
      // console.log(err, product.comments[0].commenter.name, `cccmmm`);
      let info = req.flash(`info`)[0];
      res.render(`product`, { product, info });
    });
});

// protected route

router.use(auth.loggedInUser);

router.post(`/new`, upload.single(`image`), (req, res, next) => {
  req.body.image = req.file.filename;

  Product.create(req.body, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/` + product.id);
  });
});

// update product

router.get(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;
  Product.findById(id, (err, product) => {
    if (err) return next(err);

    res.render(`edit-product`, { product });
  });
});

router.post(`/:id/edit`, upload.single(`image`), (req, res, next) => {
  let id = req.params.id;
  req.body.image = req.file.filename;
  Product.findByIdAndUpdate(id, req.body, (err, product) => {
    if (err) return next(err);
    res.redirect(`/products/` + id);
  });
});

// delete product

router.get(`/:id/delete`, (req, res, next) => {
  let id = req.params.id;

  Product.findByIdAndDelete(id, (err, product) => {
    if (err) return next(err);
    Comment.deleteMany({ productId: id }, (err, comments) => {
      if (err) return next(err);
      let filePath = imagePath + `${product.image}`;
      fs.unlink(filePath, err => {
        if (err) return next(err);
        res.redirect(`/products`);
      });
    });
  });
});

// like product

router.get(`/:id/like`, (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  // let userId = req.session.userId;

  Product.findById(id, (err, product) => {
    console.log(product,err)
    if (err) return next(err);
    if (product.likes.includes(userId)) {
      Product.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true },
        (err, product) => {
          if (err) return next(err);
          res.redirect(`/products/` + id);
        }
      );
    } else {
      Product.findByIdAndUpdate(
        id,
        { $push: { likes: userId } },
        { new: true },
        (err, product) => {
          if (err) return next(err);
          res.redirect(`/products/` + id);
        }
      );
    }
  });
});

// dislikes

router.get(`/:id/dislike`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Product.findById(id, (err, product) => {
    if (err) return next(err);
    if (product.dislikes.includes(userId)) {
      Product.findByIdAndUpdate(
        id,
        { $pull: { dislikes: userId } },
        { new: true },
        (err, product) => {
          if (err) return next(err);
          res.redirect(`/products/` + id);
        }
      );
    } else {
      Product.findByIdAndUpdate(
        id,
        { $push: { dislikes: userId } },
        { new: true },
        (err, product) => {
          if (err) return next(err);
          res.redirect(`/products/` + id);
        }
      );
    }
  });
});

// comment on product

router.post(`/:id/comment`, (req, res, next) => {
  let id = req.params.id;
  req.body.commenter = req.session.userId;
  req.body.productId = id;
  Comment.create(req.body, (err, comment) => {
    if (err) return next(err);
    Product.findByIdAndUpdate(
      id,
      { $push: { comments: comment.id } },
      { new: true },
      (err, product) => {
        if (err) return next(err);
        // console.log(err, comment, `cmt`);
        res.redirect(`/products/` + id);
      }
    );
  });
});

// add product into cart

router.get(`/:id/addCart`, async (req, res, next) => {
  let prodId = req.params.id;
  let userId = req.session.userId;
  // console.log(res.locals.user, `uuuu`);
  if (res.locals.user.isAdmin) {
    req.flash(`info`, `you are admin`);
    return res.redirect(`/products/` + prodId);
  } else {
    try {
      let cartItem = await Cart.findOne({ userId });
      // console.log(cartItem, `cartItem`);
      if (cartItem) {
        let itemIndex = cartItem.productList.findIndex(
          p => p.productId == prodId
        );

        if (itemIndex > -1) {
          cartItem.productList[itemIndex].quantity =
            cartItem.productList[itemIndex].quantity + 1;
        } else {
          let itemData = { productId: prodId, quantity: 1 };
          cartItem.productList.push(itemData);
        }
        // console.log(cartItem, itemIndex, `c-i`);
        cartItem.save();
      } else {
        let itemData = {
          userId: userId,
          productList: [{ productId: prodId, quantity: 1 }],
        };

        let itemObj = await Cart.create(itemData);
      }
      res.redirect(`/products/` + prodId);
    } catch (error) {
      next(error);
    }
  }
});

module.exports = router;
