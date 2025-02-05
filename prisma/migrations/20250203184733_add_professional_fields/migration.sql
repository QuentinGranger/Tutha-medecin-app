-- AlterTable
ALTER TABLE "users" ADD COLUMN     "business_start_date" TIMESTAMPTZ(6),
ADD COLUMN     "diploma_url" VARCHAR(255),
ADD COLUMN     "is_remote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
