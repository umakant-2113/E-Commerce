/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let commentSchema = new Schema(
  {
    title: { type: String, trim: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    commenter: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Comment`, commentSchema);
