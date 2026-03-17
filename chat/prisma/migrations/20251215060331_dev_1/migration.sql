/*
  Warnings:

  - A unique constraint covering the columns `[refresh_token]` on the table `Refresh` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `refresh` MODIFY `refresh_token` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Refresh_refresh_token_key` ON `Refresh`(`refresh_token`);
