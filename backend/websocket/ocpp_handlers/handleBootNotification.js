import { findOrCreateStation } from '../../services/station_service.js';

export const handleBootNotification = async (station, message) => {
  const [, messageId, , payload] = message;

  const bootInfo = {
    chargePointVendor: payload.chargePointVendor,
    chargePointModel: payload.chargePointModel,
    firmwareVersion: payload.firmwareVersion,
  };

  await findOrCreateStation(station.id, bootInfo);
  console.log(`BootNotification from ${station.id} processed.`);

  return [
    3,
    messageId,
    { status: 'Accepted', currentTime: new Date().toISOString(), interval: 300 }
  ];
};