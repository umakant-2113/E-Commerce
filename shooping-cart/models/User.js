/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let bcrypt = require(`bcrypt`);

let userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /@/,
      trim: true,
    },
    password: { type: String, required: true, minlength: 5, trim: true },
    isAdmin: { type: Boolean, default: false, required: false },
    isBlock: { type: Boolean, default: false },
    productId: [{ type: Schema.Types.ObjectId, ref: `Product` }],
  },
  { timestamps: true }
);

// hash password

userSchema.pre(`save`, function (next) {
  let adminEmail = [`welcometoneeraj@gmail.com`];
  if (adminEmail.includes(this.email)) {
    this.isAdmin = true;
  }
  if (this.password && this.isModified(`password`)) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

// compare password

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    cb(err, result);
  });
};

module.exports = mongoose.model(`User`, userSchema);
