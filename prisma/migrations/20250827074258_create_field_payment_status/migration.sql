-- AlterTable
ALTER TABLE `apartment` ADD COLUMN `paymentStatus` ENUM('paid', 'unpaid', 'pending') NOT NULL DEFAULT 'unpaid',
    MODIFY `createdBy` VARCHAR(191) NOT NULL DEFAULT 'owner';
