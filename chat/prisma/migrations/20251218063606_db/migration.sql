-- CreateTable
CREATE TABLE `Ip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `login_ip` VARCHAR(191) NOT NULL,
    `userid` INTEGER NOT NULL,
    `last_updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Ip_userid_key`(`userid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ip` ADD CONSTRAINT `Ip_userid_fkey` FOREIGN KEY (`userid`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
