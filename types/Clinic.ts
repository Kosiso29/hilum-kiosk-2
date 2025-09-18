export interface Clinic {
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