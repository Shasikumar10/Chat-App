const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const KEY = (process.env.E2E_KEY || 'replace_with_32_byte_key_1234567890abcd').slice(0,32);

function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), tag: tag.toString('base64'), data: encrypted };
}

function decrypt(payload) {
  const { iv, tag, data } = payload;
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  let dec = decipher.update(data, 'base64', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = { encrypt, decrypt };
