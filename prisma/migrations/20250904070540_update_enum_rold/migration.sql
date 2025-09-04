-- AlterTable
ALTER TABLE `apartment` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('user', 'admin', 'owner') NOT NULL DEFAULT 'user';
