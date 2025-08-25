// src/websocket/ocpp_handlers/handleStopTransaction.js
import Transaction from '../../models/transaction_model.js';
import Session from '../../models/session_model.js';

export const handleStopTransaction = async (station, message) => {
  const [, messageId, , payload] = message;
  const { transactionId, meterStop, timestamp, reason } = payload;

  const tx = await Transaction.findOne({ transactionId });
  if (!tx) {
    console.warn(`[${station.id}] StopTransaction for unknown txId=${transactionId}`);
    // Still ACK to keep station happy
    return [3, messageId, { idTagInfo: { status: 'Accepted' } }];
  }

  // 1) Update Transaction
  tx.meterStop = meterStop;
  tx.stopTimestamp = new Date(timestamp);
  tx.stopReason = reason;
  tx.status = 'Stopped';
  await tx.save();

  // 2) Update Session
  const session = await Session.findOne({ transactionId });
  if (session) {
    const durationMs = tx.stopTimestamp - tx.startTimestamp;
    const durationMinutes = Math.max(0, Math.round(durationMs / 60000));

    // Energy best-effort: use meterStop - meterStart
    const energyWh = (typeof tx.meterStart === 'number' && typeof meterStop === 'number')
      ? Math.max(0, meterStop - tx.meterStart)
      : session.energyWh ?? 0;

    await Session.updateOne(
      { _id: session._id },
      {
        $set: {
          stopTime: tx.stopTimestamp,
          durationMinutes,
          energyWh,
          status: 'COMPLETED'
        }
      }
    );
  }

  console.log(
    `[${station.id}] StopTransaction txId=${transactionId} reason=${reason || 'n/a'}`
  );

  // 3) OCPP response
  return [3, messageId, { idTagInfo: { status: 'Accepted' } }];
};