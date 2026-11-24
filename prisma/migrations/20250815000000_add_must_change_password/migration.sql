-- AlterTable: add mustChangePassword flag to User
-- Default false so all existing users are unaffected until explicitly set
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
