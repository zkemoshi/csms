// models/session_model.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true }, // UUID for OCPI
    transactionId: { type: Number, required: true }, // From OCPP StartTransaction
    stationId: { type: String, required: true }, // OCPP chargePointId
    connectorId: { type: Number, required: true },
    idTag: { type: String, required: true }, // RFID or token
    startTime: { type: Date, required: true },
    stopTime: { type: Date }, // null if ongoing
    durationMinutes: { type: Number },
    energyWh: { type: Number }, // Total energy delivered
    socStart: { type: Number },
    socEnd: { type: Number },
    status: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS" },
    ocpiSent: { type: Boolean, default: false }, // Mark if synced with OCPI
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);


export default Session;