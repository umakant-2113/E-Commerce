/** @format */

let express = require(`express`);
let router = express.Router();
let Comment = require(`../models/Comment`);

// like comment

router.get(`/:id/like`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (comment.likes.includes(userId)) {
      Comment.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err);
          return res.redirect(`/products/` + comment.productId);
        }
      );
    } else {
      Comment.findByIdAndUpdate(
        id,
        { $push: { likes: userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err);
          res.redirect(`/products/` + comment.productId);
        }
      );
    }
  });
});

// dislike comment

router.get(`/:id/dislike`, (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.userId;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (comment.dislikes.includes(userId)) {
      Comment.findByIdAndUpdate(
        id,
        { $pull: { dislikes: userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err);
          return res.redirect(`/products/` + comment.productId);
        }
      );
    } else {
      Comment.findByIdAndUpdate(
        id,
        { $push: { dislikes: userId } },
        { new: true },
        (err, comment) => {
          if (err) return next(err);
          res.redirect(`/products/` + comment.productId);
        }
      );
    }
  });
});

// edit comment

router.get(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (req.session.userId === comment.commenter.toString()) {
      return res.render(`commentEdit`, { comment });
    } else {
      req.flash(`info`, `you can not edit other's comment`);
      res.redirect(`/products/` + comment.productId);
    }
  });
});

router.post(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;

  Comment.findByIdAndUpdate(id, req.body, { new: true }, (err, comment) => {
    if (err) return next(err);
    console.log(err, comment);
    res.redirect(`/products/` + comment.productId);
  });
});

// delete comment

router.get(`/:id/delete`, (req, res, next) => {
  let id = req.params.id;

  Comment.findById(id, (err, comment) => {
    if (err) return next(err);
    if (req.session.userId !== comment.commenter.toString()) {
      req.flash(`info`, `you can not delete others' comments`);
      return res.redirect(`/products/` + comment.productId);
    }
    Comment.findByIdAndDelete(id, (err, comment) => {
      if (err) return next(err);
      res.redirect(`/products/` + comment.productId);
    });
  });
});

module.exports = router;
