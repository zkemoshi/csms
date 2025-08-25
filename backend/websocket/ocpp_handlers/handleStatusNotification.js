import { updateStationStatus } from '../../services/station_service.js';

export const handleStatusNotification = async (station, message) => {
  const [, messageId, , payload] = message;

  await updateStationStatus(station.id, payload);
  console.log(`StatusNotification from ${station.id} (${payload.status}) processed.`);

  return [3, messageId, {}];
};