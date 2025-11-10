/**
 * Kiosk Logger Utility
 * Provides structured logging for all kiosk interactions
 */

let interactionCounter = 0;

export interface KioskLogData {
  dataEntered?: Record<string, unknown>;
  endpoint?: string;
  requestParams?: Record<string, unknown>;
  response?: unknown;
  checkInRequest?: {
    endpoint: string;
    bookingReference?: string;
    externalBookingReference?: string;
  };
  checkInResponse?: unknown;
}

/**
 * Logs a kiosk interaction with detailed information
 */
export function logKioskInteraction(data: KioskLogData) {
  interactionCounter++;
  const separator = `===================== Kiosk interaction ${interactionCounter} ==================================`;

  console.log('\n' + separator);

  // Log 1: Data entered
  if (data.dataEntered) {
    console.log('\nLog 1 - Data entered:');
    console.log(JSON.stringify(data.dataEntered, null, 2));
  }

  // Log 2: Endpoint sent with request params
  if (data.endpoint) {
    console.log('\nLog 2 - Endpoint sent:');
    console.log(`Endpoint: ${data.endpoint}`);
    if (data.requestParams) {
      console.log('Request params:');
      console.log(JSON.stringify(data.requestParams, null, 2));
    }
  }

  // Log 3: Response - raw data with all values visible
  if (data.response !== undefined) {
    console.log('\nLog 3 - Response (raw data):');
    console.log(JSON.stringify(data.response, null, 2));
  }

  // Log 4: Check-in request data
  if (data.checkInRequest) {
    console.log('\nLog 4 - Check-in request data:');
    console.log(`Endpoint: ${data.checkInRequest.endpoint}`);
    if (data.checkInRequest.bookingReference) {
      console.log(`Booking Reference: ${data.checkInRequest.bookingReference}`);
    }
    if (data.checkInRequest.externalBookingReference) {
      console.log(`External Booking Reference: ${data.checkInRequest.externalBookingReference}`);
    }
  }

  // Log 5: Check-in response
  if (data.checkInResponse !== undefined) {
    console.log('\nLog 5 - Check-in response:');
    console.log(JSON.stringify(data.checkInResponse, null, 2));
  }

  console.log('\n' + separator + '\n');
}

/**
 * Logs a kiosk error with detailed information
 */
export function logKioskError(interactionType: string, error: unknown, additionalData?: Record<string, unknown>) {
  interactionCounter++;
  const separator = `===================== Kiosk interaction ${interactionCounter} ==================================`;

  console.error('\n' + separator);
  console.error(`\nERROR - ${interactionType}`);
  console.error('Timestamp:', new Date().toISOString());

  if (additionalData) {
    console.error('\nAdditional Data:');
    console.error(JSON.stringify(additionalData, null, 2));
  }

  console.error('\nError Details:');
  console.error(JSON.stringify(error, null, 2));

  console.error('\n' + separator + '\n');
}

/**
 * Gets the current interaction counter
 */
export function getInteractionCount(): number {
  return interactionCounter;
}

/**
 * Resets the interaction counter (useful for testing)
 */
export function resetInteractionCounter(): void {
  interactionCounter = 0;
}
