/*
  Warnings:

  - You are about to drop the column `apertmentId` on the `image` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - Added the required column `apartmentId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_apertmentId_fkey`;

-- DropIndex
DROP INDEX `Image_apertmentId_fkey` ON `image`;

-- AlterTable
ALTER TABLE `apartment` MODIFY `badRoom` INTEGER NOT NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `apertmentId`,
    ADD COLUMN `apartmentId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user';

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_apartmentId_fkey` FOREIGN KEY (`apartmentId`) REFERENCES `Apartment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
