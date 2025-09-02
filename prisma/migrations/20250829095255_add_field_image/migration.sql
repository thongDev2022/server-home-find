/*
  Warnings:

  - Added the required column `public_id` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `apartment` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `image` ADD COLUMN `public_id` VARCHAR(191) NOT NULL;
