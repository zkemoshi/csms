// src/websocket/ocpp_handlers/handleStartTransaction.js
import { v4 as uuidv4 } from 'uuid';
import Transaction from '../../models/transaction_model.js';
import Session from '../../models/session_model.js';
import { validateTokenWithSettings } from '../../services/token_service.js';

export const handleStartTransaction = async (station, message) => {
  const [, messageId, , payload] = message;
  const { connectorId, idTag, meterStart, timestamp } = payload;

  // Validate idTag using the new function that respects authorization settings
  const auth = await validateTokenWithSettings(idTag);
  if (!auth.ok) {
    console.log(`[${station.id}] StartTransaction rejected -> idTag=${idTag}, status=${auth.status}, reason=${auth.reason}`);
    return [3, messageId, {
      transactionId: 0,
      idTagInfo: { status: auth.status || 'Invalid' }
    }];
  }

  // CSMS generates tx id (must be unique)
  const transactionId = Date.now() + Math.floor(Math.random() * 1000);

  // 1) Persist Transaction
  await Transaction.create({
    stationId: station.id,
    connectorId,
    idTag,
    transactionId,
    meterStart,
    startTimestamp: new Date(timestamp),
    status: 'Active',
    meterValues: [],
  });

  // 2) Persist Session (for OCPI)
  await Session.create({
    sessionId: uuidv4(),
    transactionId,
    stationId: station.id,
    connectorId,
    idTag,
    startTime: new Date(timestamp),
    // socStart: null,
    // energyWh: 0,
    status: 'IN_PROGRESS',
  });

  console.log(`[${station.id}] StartTransaction accepted -> txId=${transactionId}, idTag=${idTag}`);

  // 3) OCPP response
  return [3, messageId, {
    transactionId,
    idTagInfo: { status: 'Accepted' }
  }];
};