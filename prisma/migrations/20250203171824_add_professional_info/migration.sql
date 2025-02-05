-- AlterTable
ALTER TABLE "users" ADD COLUMN     "additional_info" TEXT,
ADD COLUMN     "adeli_number" VARCHAR(50),
ADD COLUMN     "avatar_url" VARCHAR(255),
ADD COLUMN     "certification_number" VARCHAR(50),
ADD COLUMN     "diploma" VARCHAR(255),
ADD COLUMN     "practice_address" VARCHAR(255),
ADD COLUMN     "practice_city" VARCHAR(100),
ADD COLUMN     "practice_postal_code" VARCHAR(20),
ADD COLUMN     "professional_type" VARCHAR(50),
ADD COLUMN     "rpps_number" VARCHAR(50),
ADD COLUMN     "speciality" VARCHAR(100),
ADD COLUMN     "years_of_experience" INTEGER;
