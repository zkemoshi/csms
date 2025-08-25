import { WebSocketServer } from 'ws';
import { routeMessage } from './message_router.js';
import Station from '../models/station_model.js';

const connectedStations = new Map();
const uiClients = new Set();

const broadcastToUIs = async () => {
    if (uiClients.size === 0) return;
    try {
        const stations = await Station.find().sort({ stationId: 1 }).lean();
        const message = JSON.stringify({ type: 'full_status', stations });
        for (const client of uiClients) {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        }
    } catch (error) {
        console.error('Error broadcasting to UIs:', error);
    }
};

export const initializeWSS = (server) => {
    const wss = new WebSocketServer({
        server,
        handleProtocols: (protocols) => {
            let protocolList = [];
            if (Array.isArray(protocols)) {
                protocolList = protocols;
            } else if (protocols && typeof protocols[Symbol.iterator] === 'function') {
                protocolList = [...protocols];
            } else if (typeof protocols === 'string') {
                protocolList = [protocols];
            }
            protocolList = protocolList.map(p => p.trim());
            if (protocolList.includes('ocpp1.6')) return 'ocpp1.6';
            if (protocolList.includes('ocpp2.0.1')) return 'ocpp2.0.1';
            return false;
        }
    });

    wss.on('connection', (ws, req) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.split('/').filter(Boolean);

        // UI dashboard
        if (url.pathname === '/ws/ui') {
            console.log('UI client connected.');
            uiClients.add(ws);
            broadcastToUIs();
            ws.on('close', () => {
                console.log('UI client disconnected.');
                uiClients.delete(ws);
            });
            return;
        }

        // Try multiple ways to get stationId
        let stationId = null;
        let ocppVersion = ws.protocol || 'ocpp1.6';

        if (pathParts.length === 1) {
            // /StationId
            stationId = pathParts[0];
        } else if (pathParts.length === 2 && pathParts[0] === 'ocpp') {
            // /ocpp/StationId
            stationId = pathParts[1];
        } else if (pathParts.length === 3 && pathParts[0] === 'ocpp') {
            // /ocpp/1.6/StationId
            ocppVersion = pathParts[1];
            stationId = pathParts[2];
        }

        // Check query param fallback
        if (!stationId && url.searchParams.has('stationId')) {
            stationId = url.searchParams.get('stationId');
        }

        if (!stationId) {
            ws.close(1008, 'Station ID is required');
            return;
        }

        console.log(`Station '${stationId}' connected via ${ocppVersion}`);
        ws.id = stationId;
        connectedStations.set(stationId, { ws, ocppVersion });

        ws.on('message', async (message) => {
            try {
                const parsedMessage = JSON.parse(message);
                console.log(`[${stationId}] ==> CSMS:`, JSON.stringify(parsedMessage));
                await routeMessage({ id: stationId, ws }, parsedMessage);
                await broadcastToUIs();
            } catch (error) {
                console.error(`Failed to process message from ${stationId}:`, error);
            }
        });

        ws.on('close', async () => {
            console.log(`Station '${stationId}' disconnected.`);
            connectedStations.delete(stationId);
            await Station.findOneAndUpdate({ stationId }, { status: 'Offline' });
            await broadcastToUIs();
        });

        ws.on('error', (error) => console.error(`Error for ${stationId}:`, error));
    });

    console.log('WebSocket server initialized.');
};