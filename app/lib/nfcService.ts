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
     * @param onLog Optional callback for logging debug information
     */
    async startScanning(
        onSuccess: (token: string) => void,
        onError: (error: string) => void,
        onLog?: (message: string, data?: unknown) => void
    ): Promise<void> {
        const log = (message: string, data?: unknown) => {
            console.log(message, data || '');
            onLog?.(message, data);
        };

        if (!this.isSupported()) {
            const errorMsg = 'NFC is not supported on this device or browser';
            log('❌ ' + errorMsg);
            onError(errorMsg);
            return;
        }

        log('🔍 Checking NFC support...');
        log('✅ NFC is supported');

        try {
            log('📱 Creating NDEFReader instance...');
            this.reader = new NDEFReader();
            this.isScanning = true;
            log('✅ NDEFReader created successfully');

            // Request permission and start scanning
            log('🔐 Requesting NFC permission and starting scan...');
            await this.reader.scan();

            log('✅ NFC scanning started successfully!');
            log('👂 Listening for NFC tags...');
            log('⏰ Scanner is now waiting for tags. The "reading" event will fire when a tag is detected.');
            log('💡 If no event fires, the scanner is running but not detecting any compatible NFC tags.');

            // Listen for NFC tags
            this.reader.addEventListener('reading', ({ message, serialNumber }) => {
                log('🎉 NFC TAG DETECTED!');
                log('📋 Serial Number:', serialNumber);
                log('📦 Message object:', message);
                log('📊 Number of records:', message.records?.length || 0);

                try {
                    // Extract the token from the NDEF message
                    if (message.records && message.records.length > 0) {
                        log('✅ Records found in message');

                        message.records.forEach((record, index) => {
                            log(`📄 Record ${index + 1}:`, {
                                recordType: record.recordType,
                                encoding: record.encoding,
                                dataLength: record.data?.byteLength || 0
                            });

                            // Log raw data bytes for debugging
                            if (record.data) {
                                const dataView = new Uint8Array(record.data);
                                const hexBytes = Array.from(dataView)
                                    .map(b => b.toString(16).padStart(2, '0'))
                                    .join(' ');
                                log(`🔢 Record ${index + 1} raw bytes (hex):`, hexBytes.substring(0, 100) + (hexBytes.length > 100 ? '...' : ''));
                            }
                        });

                        const firstRecord = message.records[0];
                        log('🔍 Processing first record...');
                        log('📝 Record type:', firstRecord.recordType);
                        log('📝 All record properties:', Object.keys(firstRecord));

                        // Check if it's a text record
                        if (firstRecord.recordType === 'text') {
                            log('✅ Record type is TEXT');
                            const encoding = firstRecord.encoding || 'utf-8';
                            log('🔤 Using encoding:', encoding);

                            const textDecoder = new TextDecoder(encoding);
                            const token = textDecoder.decode(firstRecord.data);

                            log('✅ Token extracted successfully!');
                            log('🎫 Token value:', token);
                            log('📏 Token length:', token.length);
                            onSuccess(token);
                        } else {
                            const errorMsg = `Unsupported record type: ${firstRecord.recordType}`;
                            log('❌ ' + errorMsg);
                            log('💡 Expected: "text", Got:', firstRecord.recordType);
                            log('💡 Full record type value:', JSON.stringify(firstRecord.recordType));
                            onError(`Invalid NFC tag format. Record type: ${firstRecord.recordType}`);
                        }
                    } else {
                        const errorMsg = 'No records found in NFC message';
                        log('❌ ' + errorMsg);
                        log('📦 Message structure:', message);
                        log('📦 Message keys:', message ? Object.keys(message) : 'null');
                        log('📦 Message records value:', message.records);
                        onError('No data found on NFC tag');
                    }
                } catch (error: unknown) {
                    log('❌ Error processing NFC tag:', error);
                    log('🔍 Error type:', typeof error);
                    if (error instanceof Error) {
                        log('🔍 Error name:', error.name);
                        log('🔍 Error message:', error.message);
                        log('🔍 Error stack:', error.stack);
                    } else if (error && typeof error === 'object') {
                        log('🔍 Error object keys:', Object.keys(error));
                        try {
                            log('🔍 Error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                        } catch {
                            log('🔍 Could not stringify error');
                        }
                    }
                    onError('Failed to read NFC tag data. Check logs for details.');
                }
            });

            this.reader.addEventListener('readingerror', () => {
                const errorMsg = 'NFC reading error occurred';
                log('❌ ' + errorMsg);
                log('🔍 The readingerror event was triggered');
                log('💡 This means the NFC reader detected a tag but encountered an error while reading it');
                log('💡 Possible causes:');
                log('   - Tag moved away during read');
                log('   - Unsupported tag type or format');
                log('   - Hardware communication error');
                log('   - Tag is not NDEF-formatted');

                onError('Error reading NFC tag. Please try again. Check logs for details.');
            });

        } catch (error: unknown) {
            log('❌ Error starting NFC scan:', error);
            log('🔍 Error type:', typeof error);
            this.isScanning = false;

            if (error && typeof error === 'object') {
                // Log all available error properties
                log('🔍 Error object keys:', Object.keys(error));

                if ('name' in error) {
                    const domError = error as { name: string; message?: string; stack?: string; code?: number };
                    log('🔍 Error name:', domError.name);
                    log('🔍 Error message:', domError.message);
                    log('🔍 Error stack:', domError.stack);
                    log('🔍 Error code:', domError.code);

                    // Try to stringify the full error
                    try {
                        log('🔍 Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                    } catch {
                        log('🔍 Could not stringify error');
                    }

                    if (domError.name === 'NotAllowedError') {
                        const errorMsg = 'NFC permission denied. Please allow NFC access.';
                        log('❌ ' + errorMsg);
                        onError(errorMsg);
                    } else if (domError.name === 'NotSupportedError') {
                        const errorMsg = 'NFC is not supported on this device.';
                        log('❌ ' + errorMsg);
                        onError(errorMsg);
                    } else if (domError.name === 'NotReadableError') {
                        const errorMsg = `NFC hardware error: ${domError.message || 'Cannot read from NFC hardware'}`;
                        log('❌ ' + errorMsg);
                        onError(errorMsg);
                    } else if (domError.name === 'InvalidStateError') {
                        const errorMsg = `NFC state error: ${domError.message || 'Invalid NFC state'}`;
                        log('❌ ' + errorMsg);
                        onError(errorMsg);
                    } else {
                        const errorMsg = `Failed to start NFC scanning: ${domError.name} - ${domError.message || 'Unknown error'}`;
                        log('❌ ' + errorMsg);
                        onError(errorMsg);
                    }
                } else {
                    log('🔍 Error object without name property');
                    const errorMsg = 'Failed to start NFC scanning. Please try again.';
                    log('❌ ' + errorMsg);
                    onError(errorMsg);
                }
            } else {
                log('🔍 Error is not an object, raw value:', String(error));
                const errorMsg = 'Failed to start NFC scanning. Please try again.';
                log('❌ ' + errorMsg);
                onError(errorMsg);
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

interface NDEFReader {
    scan(): Promise<void>;
    addEventListener(type: 'reading', listener: (event: NDEFReadingEvent) => void): void;
    addEventListener(type: 'readingerror', listener: () => void): void;
}

declare global {
    interface Window {
        NDEFReader: {
            new(): NDEFReader;
        };
    }

    const NDEFReader: {
        new(): NDEFReader;
    };
}
