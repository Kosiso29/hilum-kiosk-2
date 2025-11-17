/**
 * NFC Service for Kiosk App using Web NFC API
 * Reads NFC tags from patient phones for check-in
 */

export class NFCService {
    private reader: NDEFReader | null = null;
    private isScanning: boolean = false;

    /**
     * Check if Web NFC is supported in this browser
     */
    isSupported(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        return 'NDEFReader' in window;
    }

    /**
     * Start scanning for NFC tags
     * @param onSuccess Callback when NFC tag is successfully read
     * @param onError Callback when an error occurs
     */
    async startScanning(
        onSuccess: (token: string) => void,
        onError: (error: string) => void
    ): Promise<void> {
        if (!this.isSupported()) {
            onError('NFC is not supported on this device or browser');
            return;
        }

        try {
            this.reader = new NDEFReader();
            this.isScanning = true;

            // Request permission and start scanning
            await this.reader.scan();

            console.log('NFC scanning started...');

            // Listen for NFC tags
            this.reader.addEventListener('reading', ({ message, serialNumber }) => {
                console.log('NFC tag detected:', serialNumber);
                console.log('NFC message:', message);

                try {
                    // Extract the token from the NDEF message
                    if (message.records && message.records.length > 0) {
                        const firstRecord = message.records[0];

                        // Check if it's a text record
                        if (firstRecord.recordType === 'text') {
                            const textDecoder = new TextDecoder(firstRecord.encoding || 'utf-8');
                            const token = textDecoder.decode(firstRecord.data);

                            console.log('Extracted token:', token);
                            onSuccess(token);
                        } else {
                            console.error('Unsupported record type:', firstRecord.recordType);
                            onError('Invalid NFC tag format');
                        }
                    } else {
                        console.error('No records found in NFC message');
                        onError('No data found on NFC tag');
                    }
                } catch (error) {
                    console.error('Error processing NFC tag:', error);
                    onError('Failed to read NFC tag data');
                }
            });

            this.reader.addEventListener('readingerror', () => {
                console.error('NFC reading error');
                onError('Error reading NFC tag. Please try again.');
            });

        } catch (error: any) {
            console.error('Error starting NFC scan:', error);
            this.isScanning = false;

            if (error.name === 'NotAllowedError') {
                onError('NFC permission denied. Please allow NFC access.');
            } else if (error.name === 'NotSupportedError') {
                onError('NFC is not supported on this device.');
            } else {
                onError('Failed to start NFC scanning. Please try again.');
            }
        }
    }

    /**
     * Stop scanning for NFC tags
     */
    stopScanning(): void {
        if (this.reader) {
            this.reader = null;
            this.isScanning = false;
            console.log('NFC scanning stopped');
        }
    }

    /**
     * Check if currently scanning
     */
    getIsScanning(): boolean {
        return this.isScanning;
    }
}

// Singleton instance
export const nfcService = new NFCService();

// Type definitions for Web NFC API
declare global {
    interface Window {
        NDEFReader: any;
    }

    interface NDEFReader {
        scan(): Promise<void>;
        addEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void;
        addEventListener(type: 'readingerror', listener: () => void): void;
    }

    interface NDEFReadingEvent {
        serialNumber: string;
        message: NDEFMessage;
    }

    interface NDEFMessage {
        records: NDEFRecord[];
    }

    interface NDEFRecord {
        recordType: string;
        data: ArrayBuffer;
        encoding?: string;
    }

    var NDEFReader: {
        prototype: NDEFReader;
        new(): NDEFReader;
    };
}
