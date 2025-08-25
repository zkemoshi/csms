import mongoose from 'mongoose';

const sampledValueSchema = new mongoose.Schema({
  value: String,          
  context: String,
  format: String,
  measurand: String,
  location: String,
  unit: String,
}, { _id: false });

const meterValueSchema = new mongoose.Schema({
  timestamp: Date,
  sampledValue: [sampledValueSchema],
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  stationId: { type: String, index: true },
  connectorId: Number,
  idTag: String,

  // Start
  transactionId: { type: Number, unique: true, index: true },
  meterStart: Number,
  startTimestamp: Date,

  // Stop
  meterStop: Number,
  stopTimestamp: Date,
  stopReason: String,

  // Streamed data
  meterValues: [meterValueSchema],

  status: { type: String, enum: ['Active', 'Stopped'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);