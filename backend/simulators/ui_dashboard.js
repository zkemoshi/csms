import WebSocket from 'ws';

const SERVER_URL = 'ws://localhost:8080/ws/ui';
const ws = new WebSocket(SERVER_URL);

const displayStations = (data) => {
    console.clear();
    console.log("--- OCPP CSMS Real-time Dashboard ---");
    console.log("-----------------------------------------------------------------------");
    const header = [
        'Station ID'.padEnd(15),
        'Status'.padEnd(15),
        'Vendor'.padEnd(20),
        'Model'.padEnd(15)
    ].join(' | ');
    console.log(header);
    console.log("-".repeat(header.length));

    const stations = data.stations || [];
    if (stations.length === 0) {
        console.log("... Awaiting station connections ...");
    } else {
        stations.forEach(s => {
            const row = [
                s.stationId.padEnd(15),
                s.status.padEnd(15),
                (s.chargePointVendor || 'N/A').padEnd(20),
                (s.chargePointModel || 'N/A').padEnd(15)
            ].join(' | ');
            console.log(row);
        });
    }
    console.log("\n(Listening for updates... Press Ctrl+C to exit)");
};

ws.on('open', () => console.log('Connected to dashboard service.'));

ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);
        if (data.type === 'full_status') {
            displayStations(data);
        }
    } catch (e) {
        console.error('Error parsing message:', e);
    }
});

ws.on('close', () => console.log('\nDisconnected from dashboard service.'));
ws.on('error', (e) => console.error('\nConnection error:', e.message));