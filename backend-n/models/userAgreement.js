const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserAgreementSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user', // Reference to the User model
    required: true,
  },
  termsId: {
    type: Schema.Types.ObjectId,
    ref: 'TermsAndConditions', // Reference to the TermsAndConditions model
    required: true,
  },
  agreed: {
    type: Boolean,
    default: false,
  },
  agreedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserAgreement = mongoose.model('UserAgreement', UserAgreementSchema);
module.exports = UserAgreement;
