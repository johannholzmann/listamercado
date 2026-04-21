-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('pendiente', 'agregado', 'resuelto');

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerParticipantId" TEXT,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByParticipantId" TEXT,

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShoppingList_shareCode_key" ON "ShoppingList"("shareCode");

-- CreateIndex
CREATE INDEX "ShoppingList_updatedAt_idx" ON "ShoppingList"("updatedAt");

-- CreateIndex
CREATE INDEX "ShoppingList_ownerParticipantId_updatedAt_idx" ON "ShoppingList"("ownerParticipantId", "updatedAt");

-- CreateIndex
CREATE INDEX "ShoppingItem_listId_status_updatedAt_idx" ON "ShoppingItem"("listId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "ShoppingItem_listId_normalizedName_idx" ON "ShoppingItem"("listId", "normalizedName");

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_ownerParticipantId_fkey" FOREIGN KEY ("ownerParticipantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_updatedByParticipantId_fkey" FOREIGN KEY ("updatedByParticipantId") REFERENCES "Participant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
