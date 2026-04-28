-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BIRDIE', 'EAGLE', 'DOUBLE_EAGLE', 'HOLE_IN_ONE', 'LEADER_CHANGE');

-- AlterTable
ALTER TABLE "Player" ADD COLUMN "notificationsSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "round" INTEGER NOT NULL,
    "playerId" TEXT,
    "hole" INTEGER,
    "course" TEXT,
    "strokes" INTEGER,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
