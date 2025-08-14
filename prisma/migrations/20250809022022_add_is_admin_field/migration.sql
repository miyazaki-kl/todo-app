-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Update existing admin user
UPDATE "User" SET "isAdmin" = true WHERE "email" = 'admin@example.com';