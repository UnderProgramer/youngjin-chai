/*
  Warnings:

  - A unique constraint covering the columns `[userid,room_code]` on the table `Join_room` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Join_room_room_code_key` ON `join_room`;

-- CreateTable
CREATE TABLE `Reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporter` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Join_room_userid_room_code_key` ON `Join_room`(`userid`, `room_code`);
