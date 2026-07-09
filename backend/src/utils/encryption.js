const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const secret = process.env.ENCRYPTION_KEY || 'health-companion-demo-key-32-bytes';
const key = crypto.createHash('sha256').update(secret).digest();

function encryptText(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

function decryptText(payload) {
  if (!payload) return '';
  const data = Buffer.from(payload, 'hex');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = { encryptText, decryptText };
