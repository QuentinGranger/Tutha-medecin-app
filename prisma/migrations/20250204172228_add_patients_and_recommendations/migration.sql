-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sport" VARCHAR(100) NOT NULL,
    "injury" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_recommendations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "content" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "patient_recommendations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_recommendations" ADD CONSTRAINT "patient_recommendations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
