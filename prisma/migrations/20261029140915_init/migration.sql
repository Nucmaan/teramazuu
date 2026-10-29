-- CreateEnum
CREATE TYPE "TiramisuType" AS ENUM ('CLASSIC', 'CREATIVE');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "tiramisuType" "TiramisuType" NOT NULL,
    "presentationRating" SMALLINT NOT NULL,
    "tasteRating" SMALLINT NOT NULL,
    "overallRating" SMALLINT NOT NULL,
    "deviceHash" TEXT,
    "networkHash" TEXT,
    "isTest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL DEFAULT 'Week of Italian Cuisine in the World 2026',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "votingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "resultsPublic" BOOLEAN NOT NULL DEFAULT false,
    "heroIntro" TEXT NOT NULL DEFAULT 'Experience the art of Italian cuisine in Mogadishu. Discover exceptional Tiramisù, celebrate authentic flavors, and vote for your favorite.',
    "offerNote" TEXT NOT NULL DEFAULT 'Enjoy a complimentary Tiramisù in any of the participating restaurants, after ordering a main dish, and vote for the best one. Terms & Conditions apply — while stock lasts.',
    "maxVotesPerDevicePerRestaurant" INTEGER NOT NULL DEFAULT 1,
    "maxVotesPerNetworkPerHour" INTEGER NOT NULL DEFAULT 40,
    "requireBotCheck" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE INDEX "Restaurant_isActive_sortOrder_idx" ON "Restaurant"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Vote_restaurantId_createdAt_idx" ON "Vote"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "Vote_createdAt_idx" ON "Vote"("createdAt");

-- CreateIndex
CREATE INDEX "Vote_deviceHash_restaurantId_idx" ON "Vote"("deviceHash", "restaurantId");

-- CreateIndex
CREATE INDEX "Vote_networkHash_createdAt_idx" ON "Vote"("networkHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_idx" ON "AdminSession"("adminUserId");

-- CreateIndex
CREATE INDEX "LoginAttempt_key_createdAt_idx" ON "LoginAttempt"("key", "createdAt");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ratings must be integers from 1 to 5 — enforced by the database as well as the app.
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_presentationRating_range" CHECK ("presentationRating" BETWEEN 1 AND 5);
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_tasteRating_range" CHECK ("tasteRating" BETWEEN 1 AND 5);
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_overallRating_range" CHECK ("overallRating" BETWEEN 1 AND 5);

-- Campaign settings is a single row, and the window must be ordered.
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_singleton" CHECK ("id" = 1);
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_window" CHECK ("endDate" > "startDate");
ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_limits" CHECK ("maxVotesPerDevicePerRestaurant" >= 0 AND "maxVotesPerNetworkPerHour" >= 0);
