/*
  Warnings:

  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `apartment` ADD COLUMN `status` ENUM('AVAILABLE', 'BOOKED', 'UNDER_MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `totalPrice` DOUBLE NOT NULL DEFAULT 0.0,
    MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';
