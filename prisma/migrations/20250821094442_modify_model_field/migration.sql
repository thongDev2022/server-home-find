-- DropForeignKey
ALTER TABLE `apartment` DROP FOREIGN KEY `Apartment_categoryId_fkey`;

-- DropIndex
DROP INDEX `Apartment_categoryId_fkey` ON `apartment`;

-- AlterTable
ALTER TABLE `apartment` MODIFY `categoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Apartment` ADD CONSTRAINT `Apartment_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
