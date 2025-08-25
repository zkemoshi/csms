import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  idTag: { type: String, required: true, unique: true, trim: true, index: true }, // RFID/token seen in OCPP
  status: {
    type: String,
    enum: ['Active', 'Blocked', 'Expired', 'Revoked'],
    default: 'Active',
    index: true,
  },
  validFrom: { type: Date },
  validTo: { type: Date },

  // optional metadata
  issuer: String,       // who issued the token
  owner: String,        // user/customer reference
  notes: String,
}, { timestamps: true });

export default mongoose.model('Token', tokenSchema);