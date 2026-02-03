/*
  Warnings:

  - Added the required column `email` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "openingTime" TEXT,
    "closingTime" TEXT,
    "tags" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Business" ("address", "category", "city", "closingTime", "createdAt", "description", "id", "isVerified", "lat", "lng", "name", "openingTime", "ownerId", "phone", "rating", "reviewCount", "slug", "state", "tags", "tier", "updatedAt", "whatsapp") SELECT "address", "category", "city", "closingTime", "createdAt", "description", "id", "isVerified", "lat", "lng", "name", "openingTime", "ownerId", "phone", "rating", "reviewCount", "slug", "state", "tags", "tier", "updatedAt", "whatsapp" FROM "Business";
DROP TABLE "Business";
ALTER TABLE "new_Business" RENAME TO "Business";
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_target_token_key" ON "VerificationToken"("target", "token");
