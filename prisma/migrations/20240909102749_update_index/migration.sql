-- CreateTable
CREATE TABLE `Accounts` (
    `accountId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Accounts_userId_key`(`userId`),
    PRIMARY KEY (`accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Characters` (
    `characterId` VARCHAR(191) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `health` INTEGER NOT NULL DEFAULT 500,
    `power` INTEGER NOT NULL DEFAULT 100,
    `money` INTEGER NOT NULL DEFAULT 10000,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Characters_name_key`(`name`),
    PRIMARY KEY (`characterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `item_code` INTEGER NOT NULL,
    `item_name` VARCHAR(191) NOT NULL,
    `item_stat` JSON NOT NULL,
    `item_slot` VARCHAR(191) NULL,
    `item_price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Items_item_code_key`(`item_code`),
    UNIQUE INDEX `Items_item_name_key`(`item_name`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventories` (
    `inventoryId` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` VARCHAR(191) NOT NULL,
    `item_code` INTEGER NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Inventories_characterId_item_code_idx`(`characterId`, `item_code`),
    PRIMARY KEY (`inventoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Equipments` (
    `equipmentId` INTEGER NOT NULL AUTO_INCREMENT,
    `characterId` VARCHAR(191) NOT NULL,
    `item_code` INTEGER NOT NULL,
    `slot` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Equipments_characterId_slot_idx`(`characterId`, `slot`),
    PRIMARY KEY (`equipmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Characters` ADD CONSTRAINT `Characters_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Accounts`(`accountId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventories` ADD CONSTRAINT `Inventories_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Characters`(`characterId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventories` ADD CONSTRAINT `Inventories_item_code_fkey` FOREIGN KEY (`item_code`) REFERENCES `Items`(`item_code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipments` ADD CONSTRAINT `Equipments_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `Characters`(`characterId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Equipments` ADD CONSTRAINT `Equipments_item_code_fkey` FOREIGN KEY (`item_code`) REFERENCES `Items`(`item_code`) ON DELETE CASCADE ON UPDATE CASCADE;
