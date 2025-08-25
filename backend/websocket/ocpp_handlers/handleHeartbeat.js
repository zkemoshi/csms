import { updateHeartbeat } from '../../services/station_service.js';

export const handleHeartbeat = async (station, message) => {
    const [, messageId] = message;

    await updateHeartbeat(station.id);
    console.log(`Heartbeat from ${station.id} processed.`);

    // Respond with the current time
    const response = [
        3, // MessageType: CALLRESULT
        messageId,
        {
            currentTime: new Date().toISOString(),
        },
    ];

    return response;
};