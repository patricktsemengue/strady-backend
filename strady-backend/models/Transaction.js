const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assetSymbol: { type: String, required: true },
  assetName: { type: String },
  assetISIN: { type: String },
  transactionType: {
    type: String,
    required: true,
    enum: ['BOUGHT_STOCK', 'SOLD_STOCK', 'BOUGHT_CALL', 'SOLD_CALL', 'BOUGHT_PUT', 'SOLD_PUT']
  },
  quantity: { type: Number, required: true },
  price: { type: Number }, // For stocks
  currency: { type: String, required: true },
  transactionDate: { type: Date, required: true },
  status: { type: String, required: true, enum: ['OPEN', 'CLOSED', 'EXPIRED', 'ASSIGNED'], default: 'OPEN' },
  notes: { type: String },
  // Option-specific fields
  strikePrice: { type: Number },
  expiryDate: { type: Date },
  premium: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);