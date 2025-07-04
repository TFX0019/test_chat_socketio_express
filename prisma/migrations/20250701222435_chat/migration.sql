/*
  Warnings:

  - You are about to drop the column `usuario1Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `usuario2Id` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `Mensaje` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[senderId,receiverId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_usuario1Id_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_usuario2Id_fkey";

-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_emisorId_fkey";

-- DropIndex
DROP INDEX "Chat_usuario1Id_usuario2Id_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "usuario1Id",
DROP COLUMN "usuario2Id",
ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Mensaje";

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "Message" (
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

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_senderId_receiverId_key" ON "Chat"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
