// Encryption and hashing utilities for sensitive fields and files.
// In production, encryption keys must be stored server-side; these helpers
// demonstrate capability and can be invoked from a service worker or backend.

export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  const buffer = new Uint8Array(encrypted);
  return btoa(String.fromCharCode(...[...iv, ...buffer]));
}

export async function decryptText(encrypted: string, key: CryptoKey): Promise<string> {
  const bytes = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const iv = bytes.slice(0, 12);
  const data = bytes.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

export async function generateSymmetricKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function sha256(data: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return sha256(buffer);
}
