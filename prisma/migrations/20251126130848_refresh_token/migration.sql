-- AlterTable
ALTER TABLE `admin` ADD COLUMN `refreshTokenHash` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employee` ADD COLUMN `refreshTokenHash` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `refreshTokenHash` VARCHAR(191) NULL;
