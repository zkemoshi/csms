import { handleBootNotification } from './ocpp_handlers/handleBootNotification.js';
import { handleHeartbeat } from './ocpp_handlers/handleHeartbeat.js';
import { handleStatusNotification } from './ocpp_handlers/handleStatusNotification.js';
import { handleAuthorize } from './ocpp_handlers/handleAuthorize.js';
import { handleStartTransaction } from './ocpp_handlers/handleStartTransaction.js';
import { handleStopTransaction } from './ocpp_handlers/handleStopTransaction.js';
import { handleMeterValues } from './ocpp_handlers/handleMeterValues.js';

// Utility: Send CALLERROR frame
const sendCallError = (ws, messageId, errorCode, errorDesc, details = {}) => {
    const frame = [4, messageId, errorCode, errorDesc || '', details];
    ws.send(JSON.stringify(frame));
};

const ocppActionHandlers = new Map([
    ['BootNotification', handleBootNotification],
    ['Heartbeat', handleHeartbeat],
    ['StatusNotification', handleStatusNotification],
    ['Authorize', handleAuthorize],
    ['StartTransaction', handleStartTransaction],
    ['StopTransaction', handleStopTransaction],
    ['MeterValues', handleMeterValues],
]);

export const routeMessage = async (station, message) => {
    const [messageType, messageId, action, payload] = message;

    // Only handle CALL messages
    if (messageType !== 2) {
        console.log(`Non-CALL message from ${station.id}: ${JSON.stringify(message)}`);
        return;
    }

    const handler = ocppActionHandlers.get(action);

    if (handler) {
        try {
            const response = await handler(station, message);
            station.ws.send(JSON.stringify(response));
        } catch (error) {
            console.error(`Error processing ${action} for ${station.id}:`, error);
            sendCallError(station.ws, messageId, 'InternalError', error.message);
        }
    } else {
        console.warn(`No handler for ${action} from ${station.id}`);
        sendCallError(station.ws, messageId, 'NotImplemented', `No handler for ${action}`);
    }
};