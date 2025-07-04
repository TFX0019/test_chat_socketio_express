/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_replyTo_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Messages" (
    "id" SERIAL NOT NULL,
    "content" TEXT,
    "replyTo" INTEGER,
    "type" TEXT NOT NULL,
    "urlFile" TEXT,
    "nameFile" TEXT,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Messages_chatId_createdAt_idx" ON "Messages"("chatId", "createdAt");

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
