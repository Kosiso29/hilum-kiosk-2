/**
 * IndexedDB service for secure clinic data storage
 */

import { encryptForStorage, decryptFromStorage } from './encryption';

export interface EncryptedClinicData {
    id: string;
    name: string;
    address: string;
    phone: string;
    nexusNumber: string;
    faxNumber: string;
    transferCallNumber: string;
    direction: string;
    email: string;
    timezone: string;
    timezoneOffset: string;
    accountId: string;
    account: {
        id: string;
        name: string;
        companyName: string;
    };
    timings: Array<{
        day: string;
        startTime: string;
        endTime: string;
    }>;
}

interface StoredClinicData {
    encryptedData: string;
    timestamp: number;
}

class ClinicStorageService {
    private dbName = 'HilumKioskDB';
    private version = 1;
    private storeName = 'clinicData';
    private db: IDBDatabase | null = null;

    // Generate a passphrase based on device characteristics
    private getPassphrase(): string {
        // Use a combination of device characteristics to create a unique passphrase
        // This is not cryptographically secure but provides basic obfuscation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx?.fillText('HilumKiosk', 10, 10);
        const fingerprint = canvas.toDataURL();

        return `${navigator.userAgent}-${navigator.language}-${fingerprint.slice(-20)}`;
    }

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    }

    async saveClinicData(clinicData: EncryptedClinicData): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        const passphrase = this.getPassphrase();
        const dataToStore = JSON.stringify(clinicData);
        const encryptedData = await encryptForStorage(dataToStore, passphrase);

        const storedData: StoredClinicData = {
            encryptedData,
            timestamp: Date.now()
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ id: 'selectedClinic', ...storedData });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async getClinicData(): Promise<EncryptedClinicData | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get('selectedClinic');

            request.onerror = () => reject(request.error);
            request.onsuccess = async () => {
                const result = request.result as (StoredClinicData & { id: string }) | undefined;

                if (!result) {
                    resolve(null);
                    return;
                }

                try {
                    const passphrase = this.getPassphrase();
                    const decryptedData = await decryptFromStorage(result.encryptedData, passphrase);
                    const clinicData = JSON.parse(decryptedData) as EncryptedClinicData;
                    resolve(clinicData);
                } catch (error) {
                    console.error('Failed to decrypt clinic data:', error);
                    // If decryption fails, clear the corrupted data
                    await this.clearClinicData();
                    resolve(null);
                }
            };
        });
    }

    async clearClinicData(): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete('selectedClinic');

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async isDataAvailable(): Promise<boolean> {
        const data = await this.getClinicData();
        return data !== null;
    }

    // Get just the nexus number for API calls
    async getNexusNumber(): Promise<string | null> {
        const clinicData = await this.getClinicData();
        return clinicData?.nexusNumber || null;
    }

    // Get just the phone number
    async getPhoneNumber(): Promise<string | null> {
        const clinicData = await this.getClinicData();
        return clinicData?.phone || null;
    }
}

// Export a singleton instance
export const clinicStorage = new ClinicStorageService();