import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const STATION_ID = `CP${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
const SERVER_URL = `ws://localhost:8080/ocpp/${STATION_ID}`;

const ws = new WebSocket(SERVER_URL);

let heartbeatInterval;

const send = (message) => {
    console.log(`CSMS <== [${STATION_ID}]:`, JSON.stringify(message));
    ws.send(JSON.stringify(message));
};

ws.on('open', () => {
    console.log(`Charger ${STATION_ID} connected to ${SERVER_URL}`);

    // 1. Send BootNotification
    const bootNotification = [
        2, // MessageType: CALL
        uuidv4(),
        "BootNotification",
        {
            chargePointVendor: "SimpleCharger Inc.",
            chargePointModel: "SC-1000",
        },
    ];
    send(bootNotification);
});

ws.on('message', (message) => {
    const [messageType, messageId, payload] = JSON.parse(message);
    console.log(`[${STATION_ID}] ==> CSMS:`, JSON.stringify(payload));
    
    // Handle BootNotification confirmation
    if (payload.status === 'Accepted') {
        // 2. Start sending Heartbeats based on the interval from the server
        const intervalSeconds = payload.interval;
        console.log(`Heartbeat interval set to ${intervalSeconds} seconds.`);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(() => {
            const heartbeat = [2, uuidv4(), "Heartbeat", {}];
            send(heartbeat);
        }, intervalSeconds * 1000);

        // 3. Start simulating status changes
        simulateStatusChanges();
    }
});

const simulateStatusChanges = () => {
    const statuses = ['Available', 'Preparing', 'Charging', 'Finishing', 'Available', 'Faulted'];
    let statusIndex = 0;

    setInterval(() => {
        const currentStatus = statuses[statusIndex];
        const statusNotification = [
            2,
            uuidv4(),
            "StatusNotification",
            {
                connectorId: 1,
                errorCode: currentStatus === 'Faulted' ? 'GroundFailure' : 'NoError',
                status: currentStatus,
            },
        ];
        send(statusNotification);
        
        // Cycle through statuses
        statusIndex = (statusIndex + 1) % statuses.length;
    }, 15000); // Change status every 15 seconds
};

ws.on('close', () => {
    console.log('Disconnected from server.');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
});