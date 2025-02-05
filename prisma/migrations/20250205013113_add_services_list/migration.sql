-- AlterTable
ALTER TABLE "users" ADD COLUMN     "services_list" TEXT[] DEFAULT ARRAY[]::TEXT[];
