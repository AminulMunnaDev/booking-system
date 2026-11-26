-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `paymentMethod` VARCHAR(191) NULL,
    ADD COLUMN `paymentRef` VARCHAR(191) NULL;
