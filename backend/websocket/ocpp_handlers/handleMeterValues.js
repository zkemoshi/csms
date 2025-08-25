// src/websocket/ocpp_handlers/handleMeterValues.js
import Transaction from '../../models/transaction_model.js';
import Session from '../../models/session_model.js';

const getFirstSoC = (meterValue = []) => {
  for (const mv of meterValue) {
    if (!mv.sampledValue) continue;
    for (const sv of mv.sampledValue) {
      if (sv.measurand === 'SoC' && sv.value != null) {
        const n = Number(sv.value);
        return Number.isFinite(n) ? n : undefined;
      }
    }
  }
};

export const handleMeterValues = async (station, message) => {
  const [, messageId, , payload] = message;
  const { transactionId, meterValue = [] } = payload;

  if (!transactionId) {
    console.warn(`[${station.id}] MeterValues missing transactionId`);
    return [3, messageId, {}];
  }

  // 1) Append MV to Transaction
  const tx = await Transaction.findOneAndUpdate(
    { transactionId },
    { $push: { meterValues: { $each: meterValue } } },
    { new: true }
  );

  // 2) Update SoC in Session (start/end heuristics)
  const soc = getFirstSoC(meterValue);
  if (typeof soc === 'number') {
    const sess = await Session.findOne({ transactionId });
    if (sess) {
      const updates = {};
      if (sess.socStart == null) updates.socStart = soc;
      updates.socEnd = soc;
      if (Object.keys(updates).length) {
        await Session.updateOne({ _id: sess._id }, { $set: updates });
      }
    }
  }

  // ACK per spec
  return [3, messageId, {}];
};