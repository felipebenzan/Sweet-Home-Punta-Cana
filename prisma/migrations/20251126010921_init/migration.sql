-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "bedding" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "image" TEXT NOT NULL,
    "amenities" TEXT NOT NULL,
    "gallery" TEXT,
    "inventoryUnits" INTEGER NOT NULL DEFAULT 1,
    "cancellationPolicy" TEXT
);

-- CreateTable
CREATE TABLE "Excursion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "icon" TEXT,
    "priceAdult" REAL NOT NULL,
    "inclusions" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "pickupMapLink" TEXT,
    "notes" TEXT NOT NULL,
    "gallery" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "checkInDate" DATETIME NOT NULL,
    "checkOutDate" DATETIME NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceBooking" (
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
    CONSTRAINT "ServiceBooking_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Excursion_slug_key" ON "Excursion"("slug");
