-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "esGrupal" BOOLEAN NOT NULL DEFAULT false,
    "creadoPor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioEnChat" (
    "usuarioId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "alias" TEXT,
    "esAdmin" BOOLEAN NOT NULL DEFAULT false,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioEnChat_pkey" PRIMARY KEY ("usuarioId","chatId")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT,
    "tipo" TEXT NOT NULL,
    "urlArchivo" TEXT,
    "nombreArchivo" TEXT,
    "chatId" INTEGER NOT NULL,
    "emisorId" INTEGER NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEnChat" ADD CONSTRAINT "UsuarioEnChat_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioEnChat" ADD CONSTRAINT "UsuarioEnChat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
