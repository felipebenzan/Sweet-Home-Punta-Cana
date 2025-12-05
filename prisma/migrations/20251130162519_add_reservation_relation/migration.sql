-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "serviceType" TEXT,
    "excursionId" TEXT,
    "guestName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "date" DATETIME,
    "time" TEXT,
    "qty" INTEGER,
    "pax" TEXT,
    "total" REAL,
    "status" TEXT NOT NULL DEFAULT 'Confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "reservationId" TEXT,
    CONSTRAINT "ServiceBooking_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ServiceBooking_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ServiceBooking" ("createdAt", "date", "email", "excursionId", "guestName", "id", "pax", "phone", "qty", "serviceType", "status", "time", "total", "type", "updatedAt") SELECT "createdAt", "date", "email", "excursionId", "guestName", "id", "pax", "phone", "qty", "serviceType", "status", "time", "total", "type", "updatedAt" FROM "ServiceBooking";
DROP TABLE "ServiceBooking";
ALTER TABLE "new_ServiceBooking" RENAME TO "ServiceBooking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
