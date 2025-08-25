// OCPP 1.6 Authorize.conf
// Request:  [2, messageId, "Authorize", { idTag }]
// Response: [3, messageId, { idTagInfo: { status } }]

import { validateTokenWithSettings } from "../../services/token_service.js";

export const handleAuthorize = async (station, message) => {
  const [, messageId, , payload] = message;
  const idTag = payload?.idTag;

  const result = await validateTokenWithSettings(idTag);

  // Map to OCPP status values
  const map = { Accepted: 'Accepted', Blocked: 'Blocked', Expired: 'Expired', Invalid: 'Invalid' };

  return [3, messageId, {
    idTagInfo: {
      status: map[result.status] || 'Invalid',
    }
  }];
};