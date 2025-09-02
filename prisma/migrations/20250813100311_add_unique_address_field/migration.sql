/*
  Warnings:

  - A unique constraint covering the columns `[apartmentId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Address_apartmentId_key` ON `Address`(`apartmentId`);
