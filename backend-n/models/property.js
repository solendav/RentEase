const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid"); // Ensure uuidv4 is imported

const Schema = mongoose.Schema;

const propertySchema = new Schema(
  {
    property_name: { type: String, required: true },
    image: [{ type: String, required: true }],
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    address: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: Boolean, required: true },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    verification: {
      type: String,
      enum: ["pending", "verified", "rejected"], // Enum values
      default: "pending", // Default value
    },
    quantity: { type: Number, required: true },
    average_rating: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
