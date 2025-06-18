export const mockBookings = [
    // Today's Bookings (dynamic)
    {
        id: 550,
        roomId: 2,
        room: {
            clinic: {
                name: "Wosler Diagnostics North",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "John",
            lastName: "Smith",
            phoneNumber: "+14161234567",
            birthDate: "1980-03-15T00:00:00.000Z",
            Healthcard: "ontario-1234567890-CD",
        },
        startTimeStamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        endTimeStamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        service: { service: "Chest X-Ray" },
        operator: { name: "Johnson, Bob" },
        bookingReference: "123",
    },
    {
        id: 561,
        roomId: 3,
        room: {
            clinic: {
                name: "Wosler Diagnostics Downtown",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "+14587458796",
            birthDate: "1995-09-06T00:00:00.000Z",
            Healthcard: "ontario-8547961250-AB",
        },
        startTimeStamp: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
        endTimeStamp: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 mins from now
        service: { service: "Blood Test" },
        operator: { name: "Chen, Lucy" },
        bookingReference: "132",
    },
    {
        id: 562,
        roomId: 1,
        room: {
            clinic: {
                name: "Wosler Diagnostics Downtown",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "+14587458796",
            birthDate: "1995-09-06T00:00:00.000Z",
            Healthcard: "ontario-8547961250-AB",
        },
        startTimeStamp: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 mins from now
        endTimeStamp: new Date(Date.now() + 55 * 60 * 1000).toISOString(), // 55 mins from now
        service: { service: "Wrist X-Ray (L)" },
        operator: { name: "Patel, Raj" },
        bookingReference: "133",
    },
    {
        id: 563,
        roomId: 4,
        room: {
            clinic: {
                name: "Wosler Diagnostics East",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "John",
            lastName: "Smith",
            phoneNumber: "+14161234567",
            birthDate: "1980-03-15T00:00:00.000Z",
            Healthcard: "ontario-1234567890-CD",
        },
        startTimeStamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        endTimeStamp: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
        service: { service: "ECG" },
        operator: { name: "Williams, Sarah" },
        bookingReference: "134",
    },
    {
        id: 551,
        roomId: 3,
        room: {
            clinic: {
                name: "Wosler Diagnostics Downtown",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "+14587458796",
            birthDate: "1995-09-06T00:00:00.000Z",
            Healthcard: "ontario-8547961250-AB",
        },
        startTimeStamp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        endTimeStamp: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "MRI - Shoulder" },
        operator: { name: "Williams, Sarah" },
        bookingReference: "532",
    },
    {
        id: 552,
        roomId: 2,
        room: {
            clinic: {
                name: "Wosler Diagnostics East",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "John",
            lastName: "Smith",
            phoneNumber: "+14161234567",
            birthDate: "1980-03-15T00:00:00.000Z",
            Healthcard: "ontario-1234567890-CD",
        },
        startTimeStamp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
        endTimeStamp: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "Ultrasound - Abdomen" },
        operator: { name: "Garcia, Carlos" },
        bookingReference: "124",
    },
    // Week 2
    {
        id: 553,
        roomId: 1,
        room: {
            clinic: {
                name: "Wosler Diagnostics Downtown",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Jane",
            lastName: "Doe",
            phoneNumber: "+14587458796",
            birthDate: "1995-09-06T00:00:00.000Z",
            Healthcard: "ontario-8547961250-AB",
        },
        startTimeStamp: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days from now
        endTimeStamp: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "CT Scan - Head" },
        operator: { name: "Thompson, Lisa" },
        bookingReference: "533",
    },
    {
        id: 554,
        roomId: 4,
        room: {
            clinic: {
                name: "Wosler Diagnostics West",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Michael",
            lastName: "Johnson",
            phoneNumber: "+14169876543",
            birthDate: "1975-11-22T00:00:00.000Z",
            Healthcard: "ontario-9876543210-EF",
        },
        startTimeStamp: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days from now
        endTimeStamp: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "X-Ray - Ankle" },
        operator: { name: "Brown, David" },
        bookingReference: "125",
    },
    // Week 3
    {
        id: 555,
        roomId: 2,
        room: {
            clinic: {
                name: "Wosler Diagnostics Downtown",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Michael",
            lastName: "Johnson",
            phoneNumber: "+14169876543",
            birthDate: "1975-11-22T00:00:00.000Z",
            Healthcard: "ontario-9876543210-EF",
        },
        startTimeStamp: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days from now
        endTimeStamp: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "MRI - Knee" },
        operator: { name: "Miller, Chris" },
        bookingReference: "534",
    },
    {
        id: 556,
        roomId: 1,
        room: {
            clinic: {
                name: "Wosler Diagnostics North",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Sarah",
            lastName: "Davis",
            phoneNumber: "+14162345678",
            birthDate: "1990-01-01T00:00:00.000Z",
            Healthcard: "ontario-1098765432-GH",
        },
        startTimeStamp: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(), // 19 days from now
        endTimeStamp: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "Ultrasound - Pelvic" },
        operator: { name: "Wilson, Jessica" },
        bookingReference: "126",
    },
    {
        id: 557,
        roomId: 3,
        room: {
            clinic: {
                name: "Wosler Diagnostics East",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Robert",
            lastName: "Brown",
            phoneNumber: "+14163456789",
            birthDate: "1965-07-20T00:00:00.000Z",
            Healthcard: "ontario-5678901234-IJ",
        },
        startTimeStamp: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
        endTimeStamp: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "MRI - Brain" },
        operator: { name: "Clark, Kevin" },
        bookingReference: "535",
    },
    {
        id: 558,
        roomId: 4,
        room: {
            clinic: {
                name: "Wosler Diagnostics West",
                nexusNumber: "8547965896",
            },
        },
        patient: {
            firstName: "Linda",
            lastName: "White",
            phoneNumber: "+14164567890",
            birthDate: "1988-12-05T00:00:00.000Z",
            Healthcard: "ontario-3456789012-KL",
        },
        startTimeStamp: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now (3 weeks)
        endTimeStamp: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        service: { service: "CT Scan - Abdomen" },
        operator: { name: "Lewis, Emily" },
        bookingReference: "127",
    },
];