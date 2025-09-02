-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `Address_apartmentId_fkey`;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_apartmentId_fkey` FOREIGN KEY (`apartmentId`) REFERENCES `Apartment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
