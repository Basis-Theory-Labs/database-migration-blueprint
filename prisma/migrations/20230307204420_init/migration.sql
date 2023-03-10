-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "ssn" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_ssn_key" ON "Person"("ssn");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
