const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "transfer",
        "withdrawal",
        "own-deposit",
        "deposit-to-balance",
        "service_fee"
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    tx_ref: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    // Fields specific to deposits
    payment_url: { type: String }, // Only used for deposits
    payment_provider: { type: String }, // e.g., 'Chapa', 'PayPal'

    // Fields specific to transfers
    fromAccountNo: { type: String }, // Change to String if account numbers are strings
    toAccountNo: { type: String }, // Only used for transfers
    seen: { type: Boolean, required: true, default: false },
    // Fields specific to any other transaction types
    // Add more fields as necessary
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
