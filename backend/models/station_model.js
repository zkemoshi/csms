import mongoose from 'mongoose';

const stationSchema = new mongoose.Schema({
    stationId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    // From BootNotification
    chargePointVendor: { type: String },
    chargePointModel: { type: String },
    firmwareVersion: { type: String },
    // Runtime status
    status: {
        type: String,
        enum: ['Available', 'Preparing', 'Charging', 'SuspendedEV', 'SuspendedEVSE', 'Finishing', 'Reserved', 'Unavailable', 'Faulted', 'Offline'],
        default: 'Offline',
    },
    // The WebSocket connection doesn't get stored in the DB,
    // but we track its state via 'status' and 'lastHeartbeat'.
    lastHeartbeat: { type: Date },
}, { timestamps: true }); // Adds createdAt and updatedAt

const Station = mongoose.model('Station', stationSchema);

export default Station;