/*
  Warnings:

  - You are about to drop the column `creadoPor` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `esGrupal` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `UsuarioEnChat` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuario1Id,usuario2Id]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario1Id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario2Id` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_creadoPor_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioEnChat" DROP CONSTRAINT "UsuarioEnChat_chatId_fkey";

-- DropForeignKey
ALTER TABLE "UsuarioEnChat" DROP CONSTRAINT "UsuarioEnChat_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "creadoPor",
DROP COLUMN "esGrupal",
DROP COLUMN "nombre",
ADD COLUMN     "usuario1Id" INTEGER NOT NULL,
ADD COLUMN     "usuario2Id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "UsuarioEnChat";

-- CreateIndex
CREATE UNIQUE INDEX "Chat_usuario1Id_usuario2Id_key" ON "Chat"("usuario1Id", "usuario2Id");

-- CreateIndex
CREATE INDEX "Mensaje_chatId_createdAt_idx" ON "Mensaje"("chatId", "createdAt");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_usuario1Id_fkey" FOREIGN KEY ("usuario1Id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_usuario2Id_fkey" FOREIGN KEY ("usuario2Id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
