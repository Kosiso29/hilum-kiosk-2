/**
 * Encryption utilities for secure local storage
 * Uses Web Crypto API for client-side encryption
 */

// Generate a key from a passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(passphrase),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Generate a random salt
function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}

// Generate a random IV for AES-GCM
function generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, passphrase: string): Promise<{
    encrypted: ArrayBuffer;
    salt: Uint8Array;
    iv: Uint8Array;
}> {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(passphrase, salt);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        new TextEncoder().encode(data)
    );

    return {
        encrypted,
        salt,
        iv
    };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
    encrypted: ArrayBuffer,
    salt: Uint8Array,
    iv: Uint8Array,
    passphrase: string
): Promise<string> {
    const key = await deriveKey(passphrase, salt);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        encrypted
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Encrypt and serialize data for storage
 */
export async function encryptForStorage(data: string, passphrase: string): Promise<string> {
    const { encrypted, salt, iv } = await encryptData(data, passphrase);

    const result = {
        encrypted: arrayBufferToBase64(encrypted),
        salt: Array.from(salt),
        iv: Array.from(iv)
    };

    return JSON.stringify(result);
}

/**
 * Deserialize and decrypt data from storage
 */
export async function decryptFromStorage(encryptedData: string, passphrase: string): Promise<string> {
    const parsed = JSON.parse(encryptedData);

    const encrypted = base64ToArrayBuffer(parsed.encrypted);
    const salt = new Uint8Array(parsed.salt);
    const iv = new Uint8Array(parsed.iv);

    return decryptData(encrypted, salt, iv, passphrase);
}