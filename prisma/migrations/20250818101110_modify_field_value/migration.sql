/*
  Warnings:

  - You are about to alter the column `status` on the `apartment` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `booking` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `apartment` MODIFY `status` ENUM('available', 'booked', 'under_maintenance') NOT NULL DEFAULT 'available';

-- AlterTable
ALTER TABLE `booking` MODIFY `status` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending';
