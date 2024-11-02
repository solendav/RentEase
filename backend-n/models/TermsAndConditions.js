const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TermsAndConditionsSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` field before saving
TermsAndConditionsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const TermsAndConditions = mongoose.model('TermsAndConditions', TermsAndConditionsSchema);
module.exports = TermsAndConditions;
