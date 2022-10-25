/** @format */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// var sassMiddleware = require("node-sass-middleware");

var mongoose = require(`mongoose`);
var mongoStore = require(`connect-mongo`);
var session = require(`express-session`);
var flash = require(`connect-flash`);
require(`dotenv`).config();

const auth = require("./middlewares/auth");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productsRouter = require(`./routes/products`);
var commentsRouter = require(`./routes/comments`);
var cartRouter = require(`./routes/carts`);

// connect dataBase

mongoose.connect(
  `mongodb://127.0.0.1/e-com`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  err => {
    console.log(err ? err : `database connected`);
  }
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(
//   sassMiddleware({
//     src: path.join(__dirname, "public"),
//     dest: path.join(__dirname, "public"),
//     indentedSyntax: false, // true = .sass and false = .scss
//     sourceMap: true,
//   })
// );
app.use(express.static(path.join(__dirname, "public")));

// add session

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: `mongodb://127.0.0.1/e-com` }),
  })
);
// add flash
app.use(flash());

app.use(auth.userInfo);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use(`/products`, productsRouter);
app.use(`/comments`, commentsRouter);
app.use(`/carts`, cartRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
