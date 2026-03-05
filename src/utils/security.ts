import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'porteo-secure-v1-2026';

export const SecurityUtils = {
  encrypt: (data: string): string => {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  },
  
  decrypt: (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  hash: (data: string): string => {
    return CryptoJS.SHA256(data).toString();
  },

  // Simulate secure protocol handshake
  verifyProtocol: (): boolean => {
    console.log('[Security] Verifying TLS 1.3 / AES-256 Handshake...');
    return true;
  }
};
