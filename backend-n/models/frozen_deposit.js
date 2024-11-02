const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const frozen_depositSchema = new Schema({
  account_id: { type: Schema.Types.ObjectId, ref: "account", required: true },
  booking_id: { type: Schema.Types.ObjectId, ref: "booking", required: true },
  frozen_amount: { type: Number, required: true },
  status: { type: String, enum: ["active", "released","frozen"], default: "active" },
}, {
  timestamps: true,
});

const Frozen_Deposit = mongoose.model("Frozen_Deposit", frozen_depositSchema);

module.exports = Frozen_Deposit;
