-- AlterTable
ALTER TABLE `apartment` ALTER COLUMN `updatedAt` DROP DEFAULT,
    MODIFY `status` ENUM('available', 'booked', 'full', 'under_maintenance') NOT NULL DEFAULT 'available';
