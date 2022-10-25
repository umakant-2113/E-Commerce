/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },

    quantity: { type: Number, require: true, default: 0 },
    category: { type: String, required: true },
    image: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Product`, productSchema);
