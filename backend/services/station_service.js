import Station from "../models/station_model.js";

// Finds or creates a station based on the stationId from a BootNotification
export const findOrCreateStation = async (stationId, bootInfo) => {
    const station = await Station.findOneAndUpdate(
        { stationId: stationId },
        {
            ...bootInfo,
            status: 'Available', // When a station boots, it becomes available
            lastHeartbeat: new Date(),
        },
        {
            new: true,    // Return the updated document
            upsert: true, // Create the document if it doesn't exist
        }
    );
    return station;
};

// Updates the last heartbeat timestamp for a station
export const updateHeartbeat = async (stationId) => {
    return await Station.findOneAndUpdate(
        { stationId },
        { lastHeartbeat: new Date() },
        { new: true }
    );
};

// Updates a station's status based on a StatusNotification
export const updateStationStatus = async (stationId, { connectorId, status, errorCode }) => {
    // In a real system, you'd handle multiple connectors. Here we simplify.
    // We also map the StatusNotification status to our more general station status.
    const stationUpdate = {
        status: status, // e.g., 'Charging', 'Available', 'Faulted'
        // You could add connector-specific logic here if your model supported it
    };

    return await Station.findOneAndUpdate(
        { stationId },
        stationUpdate,
        { new: true }
    );
};