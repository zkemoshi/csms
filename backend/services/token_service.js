import Token from '../models/token_model.js';
import Settings from '../models/settings_model.js';

export async function createToken(data) {
    return Token.create(data);
  }
  
export async function getToken(idTag) {
    return Token.findOne({ idTag });
  }

export async function getAllTokens(filter = {}, skip = 0, limit = 50) {
    return Token.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
}

export async function countTokens(filter = {}) {
    return Token.countDocuments(filter);
}
  
export async function updateToken(idTag, updates) {
    return Token.findOneAndUpdate({ idTag }, updates, { new: true });
}
  
export async function deleteToken(idTag) {
    return Token.findOneAndDelete({ idTag });
}
  
/**
   * Enforce token validity for OCPP Authorize/StartTransaction
   * Returns { ok:boolean, status:'Accepted'|'Blocked'|'Expired'|'Invalid', reason?:string }
   */
export async function validateToken(idTag, at = new Date()) {
    const t = await Token.findOne({ idTag });
    if (!t) return { ok: false, status: 'Invalid', reason: 'Unknown idTag' };
  
    if (t.status === 'Blocked' || t.status === 'Revoked') {
      return { ok: false, status: 'Blocked', reason: `Token ${t.status}` };
    }
    if (t.status === 'Expired') {
      return { ok: false, status: 'Expired', reason: 'Token expired' };
    }
    if (t.validFrom && at < t.validFrom) {
      return { ok: false, status: 'Expired', reason: 'Token not yet valid' };
    }
    if (t.validTo && at > t.validTo) {
      return { ok: false, status: 'Expired', reason: 'Token validity ended' };
    }
    return { ok: true, status: 'Accepted' };
}

  
/**
 * Get authorization settings
 */
export async function getAuthorizationSettings() {
  try {
      const settings = await Settings.findOne({ key: 'authorization_mode' });
      return {
          acceptAnyTag: settings?.value?.acceptAnyTag || false,
          strictValidation: settings?.value?.strictValidation !== false
      };
  } catch (error) {
      console.error('Error getting authorization settings:', error);
      return { acceptAnyTag: false, strictValidation: true };
  }
}

/**
* Update authorization settings
*/
export async function updateAuthorizationSettings(settings) {
  try {
      const result = await Settings.findOneAndUpdate(
          { key: 'authorization_mode' },
          { 
              key: 'authorization_mode',
              value: settings,
              description: 'Authorization mode settings for OCPP'
          },
          { upsert: true, new: true }
      );
      return result.value;
  } catch (error) {
      console.error('Error updating authorization settings:', error);
      throw error;
  }
}


/**
 * Enhanced token validation that respects authorization settings
 */
export async function validateTokenWithSettings(idTag, at = new Date()) {
  // Get current authorization settings
  const settings = await getAuthorizationSettings();
  
  // If accept any tag is enabled, accept all tokens
  if (settings.acceptAnyTag) {
      console.log(`Token validation: Accepting any tag - ${idTag}`);
      return { ok: true, status: 'Accepted', reason: 'Any tag mode enabled' };
  }
  
  // Otherwise, perform strict validation
  return await validateToken(idTag, at);
}