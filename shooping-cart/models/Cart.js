/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;

let cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    productList: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1, max: 10 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(`Cart`, cartSchema);
